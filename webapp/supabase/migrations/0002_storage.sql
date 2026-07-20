-- ============================================================================
-- Storage: bucket-uri PRIVATE + RLS pe storage.objects.
-- Atașamentele se servesc DOAR prin URL-uri semnate (signed URLs) cu durată scurtă.
-- Fără listare/enumerare publică a bucket-ului. Nume de fișiere neghicibile (uuid).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('processing', 'processing', false)
on conflict (id) do update set public = false;

-- Convenție de cale: primul segment al căii = owner_id (uuid).
-- Astfel un user poate scrie/citi DOAR în propriul "folder".

-- ── attachments ─────────────────────────────────────────────────────────────
drop policy if exists "attach read own" on storage.objects;
create policy "attach read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "attach insert own" on storage.objects;
create policy "attach insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "attach delete own" on storage.objects;
create policy "attach delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);

-- Notă: atașamentele din BIBLIOTECA PARTAJATĂ aparțin adminului. Clienții NU au acces
-- direct la storage la fișierele adminului (RLS de mai sus le blochează). Accesul de
-- citire se face EXCLUSIV prin ruta server /api/attachments/[id] care:
--   1) verifică prin RLS că userul poate vedea procedura-părinte,
--   2) generează un URL semnat cu service_role (durată scurtă),
--   3) loghează accesul.
-- Așa biblioteca nu poate fi clonată / enumerată din storage.

-- ── processing (fișiere valoroase bin/IMMO) ────────────────────────────────
drop policy if exists "proc read own" on storage.objects;
create policy "proc read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'processing' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "proc insert own" on storage.objects;
create policy "proc insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'processing' and (storage.foldername(name))[1] = auth.uid()::text);
