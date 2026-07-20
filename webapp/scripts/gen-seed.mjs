// Generează seed-ul SQL (biblioteca partajată) din sursa canonică codings.json.
//   node scripts/gen-seed.mjs
// Produce: supabase/migrations/0003_seed.sql
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "supabase/seed-data/codings.json"), "utf8"));

const q = (s) => "'" + String(s ?? "").replace(/'/g, "''") + "'";
const arr = (a) => "array[" + (a || []).map(q).join(", ") + "]::text[]";
const dollar = (s) => "$vg$" + String(s ?? "") + "$vg$"; // conținutul nu conține $vg$

const values = data
  .map(
    (p) => `  (admin_id, 'shared',
   ${q(p.title)}, ${q(p.brand)}, ${q(p.category)}, ${q(p.vehicle)}, ${q(p.module)}, ${q(p.tool)}, ${q(p.language)},
   ${arr(p.tags)},
   ${dollar(p.content)},
   ${q(p.source)})`
  )
  .join(",\n");

const sql = `-- ============================================================================
-- Seed: biblioteca PARTAJATĂ VisionGarage (BMW / VAG / Mercedes).
-- GENERAT AUTOMAT din supabase/seed-data/codings.json — NU edita manual.
--   Regenerează:  node scripts/gen-seed.mjs
--
-- Procedurile partajate aparțin unui cont ADMIN. Cum rulezi:
--   1) Înregistrează-te în aplicație (email/parolă).
--   2) update public.profiles set role='admin', subscription_status='active',
--        subscription_expires_at = now() + interval '100 years' where email = 'EMAILUL_TAU';
--   3) select public.seed_demo_library('EMAILUL_TAU');
--
-- ⚠️ Valorile de codare sunt REFERINȚĂ compilată din surse publice + know-how.
--    Diferă între build-uri/ani — verifică-le pe vehicul înainte de scriere.
-- ============================================================================

create or replace function public.seed_demo_library(admin_email text)
returns text language plpgsql security definer set search_path = public as $$
declare
  admin_id uuid;
begin
  select id into admin_id from public.profiles where email = admin_email and role = 'admin' limit 1;
  if admin_id is null then
    return 'EROARE: nu există un profil ADMIN cu emailul '||admin_email||'. Promovează-l întâi la admin.';
  end if;

  if exists (select 1 from public.procedures where owner_id = admin_id and visibility='shared') then
    return 'Biblioteca partajată există deja pentru acest admin. Nimic de făcut.';
  end if;

  insert into public.procedures
    (owner_id, visibility, title, brand, category, vehicle, module_ecu, tool, language, tags, content_md, source_notes)
  values
${values};

  return 'OK: am inserat ${data.length} proceduri în biblioteca partajată.';
end $$;
`;

writeFileSync(join(root, "supabase/migrations/0003_seed.sql"), sql);
console.log(`0003_seed.sql regenerat cu ${data.length} proceduri.`);
