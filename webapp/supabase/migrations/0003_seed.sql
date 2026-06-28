-- ============================================================================
-- Seed: 3-4 proceduri demo în BIBLIOTECA PARTAJATĂ (BMW / VAG / Mercedes).
-- Procedurile partajate aparțin unui cont ADMIN.
--
-- Cum rulezi (după ce ți-ai creat contul și l-ai făcut admin):
--   1) Înregistrează-te în aplicație cu email/parolă.
--   2) Promovează-te admin:
--        update public.profiles set role='admin', subscription_status='active',
--          subscription_expires_at = now() + interval '100 years'
--        where email = 'EMAILUL_TAU';
--   3) Populează biblioteca demo:
--        select public.seed_demo_library('EMAILUL_TAU');
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

  -- evită duplicarea la rulări repetate
  if exists (select 1 from public.procedures where owner_id = admin_id and visibility='shared') then
    return 'Biblioteca demo există deja. Nimic de făcut.';
  end if;

  insert into public.procedures (owner_id, visibility, title, brand, category, vehicle, module_ecu, tool, language, tags, content_md, source_notes)
  values
  (admin_id, 'shared',
   'BMW F30 — Codare Video In Motion (VIM) prin E-Sys',
   'BMW', 'Codare', 'F30', 'HU_NBT', 'E-Sys', 'ro',
   array['vim','nbt','fdl','codare','retrofit'],
$md$## Scop
Activarea redării video în mers (Video In Motion) pe **HU_NBT**.

## Pași
1. Conectează E-Sys, citește FA din vehicul (**Read FA**).
2. Activează FA, calculează **VO** pentru CAFD-ul HU_NBT.
3. Deschide modulul **HU_NBT** → editare **FDL**.

## Valori FDL
```text
VIM:                              nicht_aktiv  ->  aktiv
ENTERTAINMENT_LISTS_IN_MOTION:    nicht_aktiv  ->  aktiv
```

## Scriere
- **FDL-Code** → **Code-FDL** pe HU_NBT.
- Ciclu de aprindere (Klemme 15) OFF/ON 2 min.

> ⚠️ Doar pasager. Verifică legislația locală.
$md$,
   'Notițe interne VisionGarage — verificat pe build NBT 11/2015'),

  (admin_id, 'shared',
   'VAG MQB — Activare Lane Assist prin ODIS / VCDS + SVM',
   'VAG', 'Codare', 'MQB', 'BCM2 / Kamera R242', 'ODIS', 'ro',
   array['lane assist','mqb','svm','long coding','camera'],
$md$## Scop
Retrofit + codare **Lane Assist** pe platformă MQB.

## SVM (online, ODIS)
Rulează acțiunea SVM de actualizare:
```text
SVM-Code: 3E3E
Actiune: SVM - Actualizare directa prin introducerea unui cod
```

## Long Coding (cameră R242)
```text
Byte 0  Bit 0:  Lane Assist installed = active
Byte 5: HEX -> 01 (sensibilitate standard)
```

## Adaptări
```text
Canal: "Lane Assist - steering torque"   valoare: medium
```

> Necesită calibrare cameră după montaj (țintă + rulare).
$md$,
   'Procedura combinată ODIS pentru SVM + VCDS pentru long coding'),

  (admin_id, 'shared',
   'Mercedes W447 (Vito) — Component Protection / SCN prin Xentry',
   'Mercedes', 'IMMO', 'W447', 'EZS / ME-SFI', 'Xentry', 'ro',
   array['component protection','scn','immo','vito','xentry'],
$md$_(IMMO / Component Protection)_

## Scop
Eliminare **Component Protection (CP)** după înlocuire calculator pe W447.

## Pași
1. Xentry → Diagnoză → modulul afectat → **Control unit adaptations**.
2. Selectează **SCN coding** (necesită conexiune online + acces).
3. Rulează **Teach-in / Component protection reset**.

## Comenzi cheie
```text
SCN: Online coding required
CP:  Reset component protection -> Execute
```

## Verificare
```text
Citește DTC -> nu trebuie sa ramana "Component protection active"
```

> ⚠️ Necesită acces online valid. Vediamo/DTS Monaco doar pentru cazuri offline avansate.
$md$,
   'Notițe VisionGarage — testat pe W447 2018'),

  (admin_id, 'shared',
   'BMW EDC17 — Pinout bench + checksum la flash TCU',
   'BMW', 'Pinout', 'F-Series', 'EDC17C50', 'E-Sys', 'ro',
   array['edc17','bench','pinout','flash','checksum','tcu'],
$md$## Pinout bench EDC17C50
```text
Pin 1   -> GND
Pin 2   -> +12V (KL30)
Pin 91  -> CAN-H
Pin 92  -> CAN-L
Boot:   -> nu necesita (BDM/bench OBD ok)
```

## Flash
1. Citește full backup (rd) înainte de orice scriere.
2. Aplică modificarea, **recalculează checksum**.
3. Scrie (wr) și verifică.

```text
checksum: auto (tool) -> verify OK inainte de write
```

> ⚠️ Fără backup = risc de cărămidă. Întotdeauna salvează originalul.
$md$,
   'Pinout de referință — uz intern');

  return 'OK: am inserat 4 proceduri demo în biblioteca partajată.';
end $$;
