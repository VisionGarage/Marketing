-- ============================================================================
-- VisionGarage Knowledge Base — schema inițială
-- Multi-tenant cu Row-Level Security (RLS) STRICT.
-- Izolarea se face la nivel de bază de date: un user NU poate citi NICIODATĂ
-- rândurile/fișierele altui user, nici prin API direct.
-- ============================================================================

create extension if not exists "pgcrypto";       -- gen_random_uuid()
create extension if not exists "unaccent";        -- căutare fără diacritice

-- ── Tipuri enumerate ────────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('trial', 'active', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type procedure_visibility as enum ('private', 'shared');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 1) PROFILES — un rând per utilizator (extinde auth.users)
--    Conține rolul și statusul abonamentului care GATEAZĂ tot accesul.
-- ============================================================================
create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text not null,
  display_name           text,
  role                   user_role not null default 'user',
  subscription_status    subscription_status not null default 'trial',
  subscription_expires_at timestamptz default (now() + interval '14 days'),
  -- Identificator scurt, stabil, folosit ca watermark per-user în UI și PDF.
  watermark_tag          text not null default substr(replace(gen_random_uuid()::text,'-',''),1,8),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ── Funcții ajutătoare (SECURITY DEFINER) folosite în politicile RLS ────────
-- Rulează cu privilegii de owner ca să poată citi profiles fără recursivitate RLS.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Poarta de abonament: trial/active și neexpirat => acces; expired/revocat => tăiat instant.
create or replace function public.is_subscription_active()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.subscription_status in ('trial', 'active')
      and (p.subscription_expires_at is null or p.subscription_expires_at > now())
  );
$$;

-- La înregistrarea unui user nou în auth.users => creează automat un profil (trial 14 zile).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- Un user își vede DOAR profilul propriu; adminul le vede pe toate (pentru panoul de admin).
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- Userul își poate edita display_name, dar NU rolul/abonamentul (acelea le schimbă doar
-- adminul prin rute server cu service_role, ocolind RLS în mod controlat).
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and subscription_status = (select subscription_status from public.profiles where id = auth.uid())
  );

-- ============================================================================
-- 2) PROCEDURES — modelul central de date
-- ============================================================================
create table if not exists public.procedures (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  visibility   procedure_visibility not null default 'private',

  title        text not null,
  brand        text not null,                 -- BMW / VAG / Mercedes / Altele
  category     text not null,                 -- Codare, IMMO, Flash ECU/TCU, Airbag/Crash, Cluster, Retrofit, Pinout, Manual, Diagnoză
  vehicle      text,                          -- F30, W447, MQB
  module_ecu   text,                          -- CAS4, EDC17, KOMBI, BCM2
  tool         text,                          -- E-Sys, ODIS, VCDS, Vediamo, DTS Monaco, Xentry
  language     text not null default 'ro',    -- limba CONȚINUTULUI (RO/EN/IT/altele) — separat de limba UI
  tags         text[] not null default '{}',

  content_md   text not null default '',      -- conținut Markdown (FA/VO/NCD, hex, comenzi)
  source_notes text,

  -- Coloană de căutare full-text generată automat (titlu + conținut + tag-uri + modul + model).
  search_tsv   tsvector generated always as (
    setweight(to_tsvector('simple', unaccent(coalesce(title,''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(module_ecu,'') || ' ' || coalesce(vehicle,''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(array_to_string(tags,' '))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(content_md,''))), 'C')
  ) stored,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists procedures_search_idx   on public.procedures using gin (search_tsv);
create index if not exists procedures_owner_idx     on public.procedures (owner_id);
create index if not exists procedures_visibility_idx on public.procedures (visibility);
create index if not exists procedures_brand_idx     on public.procedures (brand);
create index if not exists procedures_tags_idx      on public.procedures using gin (tags);

-- updated_at automat
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists procedures_touch on public.procedures;
create trigger procedures_touch before update on public.procedures
  for each row execute function public.touch_updated_at();

alter table public.procedures enable row level security;

-- SELECT: proprii (oricare vizibilitate) SAU din biblioteca partajată — DAR numai cu abonament activ.
drop policy if exists procedures_select on public.procedures;
create policy procedures_select on public.procedures
  for select using (
    public.is_subscription_active()
    and (owner_id = auth.uid() or visibility = 'shared')
  );

-- INSERT: doar pe numele propriu, cu abonament activ.
--   visibility='shared' este permis DOAR adminului (cârligul = biblioteca curată de la mine).
drop policy if exists procedures_insert on public.procedures;
create policy procedures_insert on public.procedures
  for insert with check (
    owner_id = auth.uid()
    and public.is_subscription_active()
    and (visibility = 'private' or public.is_admin())
  );

-- UPDATE: doar proprietarul; un user normal nu-și poate publica în biblioteca partajată.
drop policy if exists procedures_update on public.procedures;
create policy procedures_update on public.procedures
  for update using (owner_id = auth.uid() and public.is_subscription_active())
  with check (
    owner_id = auth.uid()
    and (visibility = 'private' or public.is_admin())
  );

-- DELETE: doar proprietarul.
drop policy if exists procedures_delete on public.procedures;
create policy procedures_delete on public.procedures
  for delete using (owner_id = auth.uid());

-- ============================================================================
-- 3) ATTACHMENTS — metadate pentru fișiere din Storage (imagini, bin/pdf/zip)
--    Fișierele reale stau în bucket PRIVAT; se servesc DOAR prin URL semnat.
-- ============================================================================
create table if not exists public.attachments (
  id           uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,                 -- ex: {owner_id}/{uuid}.png — nume neghicibil
  file_name    text not null,                 -- numele original, pentru afișare/download
  mime_type    text,
  size_bytes   bigint,
  kind         text not null default 'file',  -- 'image' | 'file'
  created_at   timestamptz not null default now()
);
create index if not exists attachments_procedure_idx on public.attachments (procedure_id);

alter table public.attachments enable row level security;

-- Vezi atașamentul dacă poți vedea procedura-părinte (re-folosește politica de pe procedures).
drop policy if exists attachments_select on public.attachments;
create policy attachments_select on public.attachments
  for select using (
    exists (select 1 from public.procedures p where p.id = procedure_id)
  );

drop policy if exists attachments_insert on public.attachments;
create policy attachments_insert on public.attachments
  for insert with check (
    owner_id = auth.uid()
    and exists (select 1 from public.procedures p where p.id = procedure_id and p.owner_id = auth.uid())
  );

drop policy if exists attachments_delete on public.attachments;
create policy attachments_delete on public.attachments
  for delete using (owner_id = auth.uid());

-- ============================================================================
-- 4) FAVORITES + RECENT VIEWS  (per-user, merg și pe biblioteca partajată)
-- ============================================================================
create table if not exists public.favorites (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, procedure_id)
);
alter table public.favorites enable row level security;
drop policy if exists favorites_all on public.favorites;
create policy favorites_all on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.recent_views (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  viewed_at    timestamptz not null default now(),
  primary key (user_id, procedure_id)
);
alter table public.recent_views enable row level security;
drop policy if exists recent_views_all on public.recent_views;
create policy recent_views_all on public.recent_views
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- 5) ACCESS LOG — jurnal de acces (cine, ce procedură, când) + bază pentru anomalii
-- ============================================================================
create table if not exists public.access_log (
  id           bigint generated always as identity primary key,
  user_id      uuid references public.profiles(id) on delete set null,
  action       text not null,                 -- 'view' | 'search' | 'export' | 'signed_url' | ...
  procedure_id uuid,
  ip           inet,
  user_agent   text,
  meta         jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists access_log_user_time_idx on public.access_log (user_id, created_at desc);

alter table public.access_log enable row level security;
-- Userul își vede propriul jurnal; adminul vede tot. Scrierea se face din server (service_role).
drop policy if exists access_log_select on public.access_log;
create policy access_log_select on public.access_log
  for select using (user_id = auth.uid() or public.is_admin());

-- ============================================================================
-- 6) PROCESSING JOBS — conducta server-side pentru fișiere valoroase (bin/IMMO)
--    Clientul încarcă dump-ul; un worker pe server procesează și întoarce DOAR
--    rezultatul. Metoda (logica reală) NU ajunge niciodată pe PC-ul clientului.
-- ============================================================================
do $$ begin
  create type job_status as enum ('queued', 'processing', 'done', 'error');
exception when duplicate_object then null; end $$;

create table if not exists public.processing_jobs (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  kind         text not null,                 -- ex: 'immo_clean', 'bin_repair' (definite de admin)
  status       job_status not null default 'queued',
  input_path   text not null,                 -- în bucket privat 'processing', sub {owner_id}/
  output_path  text,                          -- rezultatul, livrat doar prin URL semnat
  error_msg    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists processing_jobs_owner_idx on public.processing_jobs (owner_id, created_at desc);

drop trigger if exists processing_jobs_touch on public.processing_jobs;
create trigger processing_jobs_touch before update on public.processing_jobs
  for each row execute function public.touch_updated_at();

alter table public.processing_jobs enable row level security;
-- Userul își vede DOAR joburile proprii. Workerul rulează cu service_role (ocolește RLS controlat).
drop policy if exists processing_jobs_select on public.processing_jobs;
create policy processing_jobs_select on public.processing_jobs
  for select using (owner_id = auth.uid());
drop policy if exists processing_jobs_insert on public.processing_jobs;
create policy processing_jobs_insert on public.processing_jobs
  for insert with check (owner_id = auth.uid() and public.is_subscription_active());

-- ============================================================================
-- 7) RPC de căutare full-text cu evidențiere (headline) — respectă RLS automat.
-- ============================================================================
create or replace function public.search_procedures(
  q text,
  brand_filter text default null,
  category_filter text default null,
  tool_filter text default null,
  language_filter text default null,
  tag_filter text default null,
  limit_n int default 50
)
returns table (
  id uuid, title text, brand text, category text, vehicle text,
  module_ecu text, tool text, language text, tags text[],
  visibility procedure_visibility, owner_id uuid,
  is_favorite boolean, headline text, rank real,
  created_at timestamptz, updated_at timestamptz
)
language sql stable security invoker set search_path = public as $$
  with query as (
    select case when coalesce(trim(q),'') = '' then null
                else websearch_to_tsquery('simple', unaccent(q)) end as tsq
  )
  select p.id, p.title, p.brand, p.category, p.vehicle, p.module_ecu, p.tool,
         p.language, p.tags, p.visibility, p.owner_id,
         (f.procedure_id is not null) as is_favorite,
         case when (select tsq from query) is null then left(p.content_md, 180)
              else ts_headline('simple', unaccent(coalesce(p.title,'') || ' — ' || coalesce(p.content_md,'')),
                               (select tsq from query),
                               'StartSel=<mark>,StopSel=</mark>,MaxWords=30,MinWords=8,MaxFragments=2')
         end as headline,
         case when (select tsq from query) is null then 0
              else ts_rank(p.search_tsv, (select tsq from query)) end as rank,
         p.created_at, p.updated_at
  from public.procedures p
  left join public.favorites f on f.procedure_id = p.id and f.user_id = auth.uid()
  where ( (select tsq from query) is null or p.search_tsv @@ (select tsq from query) )
    and (brand_filter    is null or p.brand    = brand_filter)
    and (category_filter is null or p.category = category_filter)
    and (tool_filter     is null or p.tool     = tool_filter)
    and (language_filter is null or p.language = language_filter)
    and (tag_filter      is null or tag_filter = any(p.tags))
  order by rank desc, p.updated_at desc
  limit limit_n;
$$;

-- ============================================================================
-- 8) Detecție de anomalii — câte proceduri a deschis un user în ultima oră.
--    Folosit de rutele server ca să ridice un flag peste prag.
-- ============================================================================
create or replace function public.recent_open_count(p_user uuid, p_minutes int default 60)
returns bigint language sql stable security definer set search_path = public as $$
  select count(*) from public.access_log
  where user_id = p_user and action = 'view'
    and created_at > now() - make_interval(mins => p_minutes);
$$;

-- Vizualizare pentru adminul care monitorizează anomalii.
create or replace view public.v_anomaly_watch as
  select user_id, count(*) as opens_last_hour,
         max(created_at) as last_open
  from public.access_log
  where action = 'view' and created_at > now() - interval '1 hour'
  group by user_id
  order by opens_last_hour desc;
