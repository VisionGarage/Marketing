-- ============================================================================
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
  (admin_id, 'shared',
   'BMW F30 — Video In Motion (VIM) pe NBT prin E-Sys', 'BMW', 'Codare', 'F30', 'HU_NBT', 'E-Sys', 'ro',
   array['vim', 'nbt', 'fdl', 'codare']::text[],
   $vg$## Scop
Activarea redării video în mers (Video In Motion) pe **HU_NBT**.

## Pași
1. E-Sys → **Read FA** (citește FA din vehicul), Activate FA.
2. Calculează **VO** pentru CAFD-ul HU_NBT.
3. Deschide **HU_NBT** → editare **FDL**.

## Valori FDL
```
SPEEDLOCK_SPEEDVALUE_MIN:  reset / 0 km/h
SPEEDLOCK_SPEEDVALUE_MAX:  1023 km/h (max)
VIDEO_HANDBRAKE:           nicht_aktiv
VIDEO_FRONT_LOCKED:        nicht_aktiv
VIDEO_SPEEDLOCK_CONDITION: nicht_aktiv
```

## Scriere
- **FDL-Code** → **Code-FDL** pe HU_NBT.
- Klemme 15 OFF/ON 2 min.

> ⚠️ Doar pasager. Verifică legislația locală. Valorile diferă între NBT și NBT EVO.$vg$,
   'Referință VisionGarage — verificat pe build NBT'),
  (admin_id, 'shared',
   'BMW — Rabatare oglinzi la închidere (ASP) prin E-Sys', 'BMW', 'Retrofit', 'F-Series', 'FRM / ASP', 'E-Sys', 'ro',
   array['oglinzi', 'rabatare', 'asp', 'comfort']::text[],
   $vg$## Scop
Rabatare oglinzi la închidere (comfort close) + desfacere la descuiere.

## Modul
**FRM** (Footwell Module) sau modulul de oglinzi, secțiunea ASP.

## Valori FDL
```
ASP_EINKLAPPEN:                        aktiv
ASP_BEIKLAPPEN_BEI_KOMFORTSCHLIESSEN:  aktiv
ASP_AUSKLAPPEN_NACH_KOMFORTSCHLIESSEN: aktiv
```

## Alternativ — rabatare din cheie
- Ține **lock** apăsat pe telecomandă → oglinzile se pliază.

> Necesită oglinzi cu motor de pliere montate. Verifică prezența actuatorului.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'BMW — Viteză digitală / Sport Displays (M-View)', 'BMW', 'Codare', 'F20/F30', 'KOMBI', 'E-Sys', 'ro',
   array['viteza digitala', 'm-view', 'kombi', 'sport displays']::text[],
   $vg$## Scop
Afișaj viteză digitală / **Sport Displays (M-View)** cu putere & cuplu.

## Modul
**HU_NBT** (meniul de bord/entertainment) + **KOMBI** pentru unele build-uri.

## Valori FDL
```
HU_NBT:  M_VIEW = aktiv  (sau SPORT_DISPLAYS = aktiv)
KOMBI:   DIGITAL_SPEED / DIGITAL_V = aktiv
```

## Acces
- În iDrive: Apps → M / Sport Displays.

> Denumirile parametrilor variază pe build. Caută „M_VIEW" / „SPORT" în CAFD.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'BMW — Dezactivare avertizare centură (KOMBI)', 'BMW', 'Ceas / Cluster', 'F-Series', 'KOMBI', 'E-Sys', 'ro',
   array['centura', 'gong', 'seatbelt', 'kombi']::text[],
   $vg$## Scop
Dezactivare avertizare centură (gong/lampă) — util la testare pe rampă.

## Modul
**KOMBI**, secțiunea siguranță centură.

## Valori FDL
```
GURTWARNUNG_VORN:   nicht_aktiv   (avertizare față)
SITZBELEGUNGSMATTE: dupa caz
```

> ⚠️ Doar pentru scop tehnic. Recomandat să rămână activ în uz normal (siguranță).$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'BMW — Comfort Access: geamuri/trapă din cheie (CAS4/FEM/BDC)', 'BMW', 'Codare', 'F/G-Series', 'CAS4 / FEM / BDC', 'E-Sys', 'ro',
   array['comfort access', 'geamuri', 'fob', 'sunroof']::text[],
   $vg$## Scop
Închidere/deschidere geamuri (și trapă) din cheie / Comfort Access.

## Modul
**CAS4** (F pre-LCI) / **FEM_BODY** / **BDC** (F LCI, G).

## Valori FDL
```
KOMFORTZUGANG:          aktiv
FH_KOMFORTOEFFNUNG:     aktiv   (deschidere geamuri)
FH_KOMFORTSCHLIESSUNG:  aktiv   (inchidere geamuri)
SHD_KOMFORT:            aktiv   (trapa)
```

> Ține butonul de pe telecomandă apăsat pentru acțiune. Verifică prezența Comfort Access.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'BMW — Eliminare disclaimer legal la pornire (NBT)', 'BMW', 'Codare', 'F-Series', 'HU_NBT', 'E-Sys', 'ro',
   array['disclaimer', 'legal', 'warning', 'nbt']::text[],
   $vg$## Scop
Eliminare ecran de avertizare legal (disclaimer) la pornire în iDrive/Navi.

## Modul
**HU_NBT**.

## Valori FDL
```
WARNUNG_UNBEDENKLICH:  aktiv        (accepta automat)
ENTERTAINMENT_LEGALTEXT: nicht_aktiv
NAVIGATION_LEGALTEXT:    nicht_aktiv
```

> Confort pur; nu afectează funcționalitatea.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'BMW — Auto Start/Stop reține ultima stare (MSA)', 'BMW', 'Codare', 'F-Series', 'IHKA / KOMBI', 'E-Sys', 'ro',
   array['start-stop', 'msa', 'memorie']::text[],
   $vg$## Scop
Auto Start/Stop (MSA) să rețină **ultima stare** (OFF rămâne OFF).

## Modul
Uzual **IHKA** sau modulul care deține parametrul MSA (variază pe serie).

## Valori FDL
```
MSA_AUTOMATISCH_AUS:   aktiv      (dezactivare automata memorata)
// sau
MSA_LAST_STATE:        aktiv
```

> Denumirea variază mult între F și G. Caută „MSA" în CAFD-urile candidate.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'BMW EDC17 — Pinout bench + checksum la flash', 'BMW', 'Pinout', 'F-Series', 'EDC17C50', 'E-Sys', 'ro',
   array['edc17', 'bench', 'pinout', 'flash', 'checksum']::text[],
   $vg$## Pinout bench EDC17C50
```
Pin 1   -> GND
Pin 2   -> +12V (KL30)
Pin 91  -> CAN-H
Pin 92  -> CAN-L
```

## Flash
1. Citește **full backup** înainte de orice scriere.
2. Aplică modificarea, **recalculează checksum**.
3. Scrie și verifică.

```
checksum: auto (tool) -> verify OK inainte de write
```

> ⚠️ Fără backup = risc de cărămidă.$vg$,
   'Pinout de referință — uz intern'),
  (admin_id, 'shared',
   'VAG MQB — Activare Lane Assist (ODIS/VCDS + SVM)', 'VAG', 'Codare', 'MQB', 'Kamera R242', 'ODIS', 'ro',
   array['lane assist', 'mqb', 'svm', 'long coding']::text[],
   $vg$## Scop
Retrofit + codare **Lane Assist** pe MQB.

## SVM (online, ODIS)
```
SVM-Code: 3E3E
Actiune: SVM - Actualizare directa prin cod
```

## Long Coding (cameră R242)
```
Byte 0 Bit 0: Lane Assist installed = active
Byte 5: 01 (sensibilitate standard)
```

## Adaptări
```
Canal: Lane Assist - steering torque -> medium
```

> Necesită calibrare cameră după montaj (țintă + rulare).$vg$,
   'ODIS pentru SVM + VCDS pentru long coding'),
  (admin_id, 'shared',
   'VAG Golf 7 — Needle sweep / staging ace (VCDS [17])', 'VAG', 'Ceas / Cluster', 'Golf 7 / MQB', '17 - Instrumente', 'VCDS', 'ro',
   array['needle sweep', 'staging', 'kombi', '17']::text[],
   $vg$## Scop
**Needle sweep** (baletul acelor) la pornire.

## Modul
**[17] Instrumente** → Long Coding Helper.

## Valori
```
Byte 1, Bit 0:  Staging (Needle Sweep) = activat
```

> ⚠️ Mașina TREBUIE oprită (RPM = 0) când aplici, altfel apare eroare de calibrare ace.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'VAG Golf 7 — Rabatare oglinzi din telecomandă (VCDS)', 'VAG', 'Codare', 'Golf 7 / MQB', '52 / 42 - Uși', 'VCDS', 'ro',
   array['oglinzi', 'rabatare', 'funk', 'spiegel']::text[],
   $vg$## Scop
Rabatare oglinzi din telecomandă (Funk / remote).

## Modul
**[52] Door Elect, Pass** (și [42] șofer) → Adaptare.

## Adaptare
```
Canal: Funk_Spiegelanklappen_Modus
Valoare: activat / aktiviert
```

> Necesită oglinzi rabatabile electric. Setează pe ambele uși (42 + 52).$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'VAG Golf 7 — Coming / Leaving Home (VCDS [09])', 'VAG', 'Codare', 'Golf 7 / MQB', '09 - Electronică centrală', 'VCDS', 'ro',
   array['coming home', 'leaving home', 'lumini', '09']::text[],
   $vg$## Scop
Lumini **Coming / Leaving Home** + iluminare confort.

## Modul
**[09] Cent. Elect.** → Security Access.

## Pași
```
Security Access code: 31347
Comfort-Illumination -> Fog Light (ceata) sau Low Beam
```

## Durată
```
Adaptare: Menu duration / Leaving home time -> 30-60 s
```

> Verifică opțiunile în meniul MMI/infotainment după codare.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'VAG Golf 7 — Geamuri confort din telecomandă (VCDS [09])', 'VAG', 'Codare', 'Golf 7 / MQB', '09 - Electronică centrală', 'VCDS', 'ro',
   array['geamuri', 'confort', 'telecomanda', '09']::text[],
   $vg$## Scop
Închidere/deschidere **geamuri din telecomandă** (comfort open/close).

## Modul
**[09] Cent. Elect.** → Long Coding / Adaptare.

## Valori
```
Adaptare: Komfortoeffnung / Komfortschliessung -> aktiviert
// unele build-uri: Long Coding byte pentru 'convenience windows'
```

> Ține butonul lock/unlock apăsat pe cheie pentru acțiune.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'VAG Golf 7 — Dezactivare avertizare centură (VCDS [17])', 'VAG', 'Diagnoză', 'Golf 7 / MQB', '17 - Instrumente', 'VCDS', 'ro',
   array['centura', 'seatbelt', 'warning', '17']::text[],
   $vg$## Scop
Dezactivare avertizare centură (pentru testare pe rampă).

## Modul
**[17] Instrumente** → Adaptare.

## Valori
```
Canal: Seatbelt warning (driver/pass) -> deactivated
// sau Long Coding: bit 'Seatbelt warning active' = 0
```

> ⚠️ Doar tehnic. Repune pe activat pentru uz normal.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'VAG Golf 7 — Tear-wipe (ștergere după spălare)', 'VAG', 'Codare', 'Golf 7 / MQB', '09 - Electronică centrală', 'VCDS', 'ro',
   array['stergator', 'tear wipe', 'spalare', '09']::text[],
   $vg$## Scop
**Tear-wipe** — o ștergere suplimentară la câteva secunde după spălare.

## Modul
**[09] Cent. Elect.** → Adaptare.

## Valori
```
Canal: Wipe after wash / Nachwischen -> aktiviert
Interval: ~4-6 s
```

> Confort; util iarna împotriva petelor de lichid.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'VAG Golf 7 — Emergency brake light flashing', 'VAG', 'Codare', 'Golf 7 / MQB', '09 - Electronică centrală', 'VCDS', 'ro',
   array['frana', 'emergency', 'flashing', 'brake']::text[],
   $vg$## Scop
**Emergency brake light flashing** — clipire stopuri la frânare bruscă.

## Modul
**[09] Cent. Elect.** (și ABS [03] pe unele build-uri) → Long Coding / Adaptare.

## Valori
```
Emergency brake flashing: activated
Mod: brake light flashing (nu hazard) sau hazard, dupa preferinta
```

> Verifică omologarea locală pentru modul (stop vs. avarii).$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'VAG MIB2 — Video In Motion (VCDS [5F])', 'VAG', 'Codare', 'MIB2 / MQB', '5F - Infotainment', 'VCDS', 'ro',
   array['video in motion', 'mib2', 'green menu', '5f']::text[],
   $vg$## Scop
**Video In Motion** pe unitate MIB2.

## Modul
**[5F] Information Electr.** — prin meniu dezvoltator (green menu) sau adaptare.

## Pași
```
Green Engineering Menu -> nu bloca video la viteza
// sau Adaptare: 'Video nur im Stand' -> deactivated
```

> ⚠️ Poate necesita FEC/SWaP. Doar pasager, respectă legislația.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'VAG MQB — Eliminare Component Protection (ODIS SVM)', 'VAG', 'IMMO / Component Protection', 'MQB', 'diverse ECU', 'ODIS', 'ro',
   array['component protection', 'svm', 'immo', 'adaptare']::text[],
   $vg$## Scop
Eliminare **Component Protection** după înlocuire modul (VAG).

## Pași (ODIS + SVM)
```
SVM: Adaptare componenta / Actualizare software prin cod
Geko/online login necesar
```

## Verificare
```
Citeste DTC -> fara 'component protection active'
```

> Necesită cont online valid (GeKo). VCP/adaptare offline doar pe cazuri limitate.$vg$,
   'Referință VisionGarage — necesită acces online'),
  (admin_id, 'shared',
   'Mercedes W447 (Vito) — Component Protection / SCN (Xentry)', 'Mercedes', 'IMMO / Component Protection', 'W447', 'EZS / ME-SFI', 'Xentry', 'ro',
   array['component protection', 'scn', 'immo', 'vito']::text[],
   $vg$## Scop
Eliminare **Component Protection (CP)** după înlocuire calculator.

## Pași
1. Xentry → Diagnoză → modul → **Control unit adaptations**.
2. Selectează **SCN coding** (online + acces).
3. Rulează **Teach-in / CP reset**.

## Comenzi cheie
```
SCN: Online coding required
CP:  Reset component protection -> Execute
```

## Verificare
```
Citeste DTC -> fara 'Component protection active'
```

> ⚠️ Necesită acces online valid.$vg$,
   'Testat pe W447 2018'),
  (admin_id, 'shared',
   'Mercedes W205/W213 — Video In Motion (Vediamo, NTG5)', 'Mercedes', 'Codare', 'W205 / W213', 'HU / COMAND-NTG5', 'Vediamo', 'ro',
   array['video in motion', 'comand', 'ntg5', 'vediamo']::text[],
   $vg$## Scop
**Video In Motion** pe COMAND/Audio (NTG5/NTG5.5).

## Modul
**HU** (Head Unit) → variant coding în Vediamo (ECU: HU5 / NTG5).

## Valori
```
VIDEO_IN_MOTION:            enabled / codiert
TV_FRONT_DISPLAY_IN_MOTION: enabled
```

> ⚠️ Pe NTG6/W213 mai nou folosește DTS Monaco. Doar pasager; respectă legislația.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'Mercedes W205/W213 — Meniu iluminare ambientală (DTS Monaco)', 'Mercedes', 'Retrofit', 'W205 / W213', 'EZS / BCF / HU', 'DTS Monaco', 'ro',
   array['ambient', 'iluminare', 'lumini', 'dts']::text[],
   $vg$## Scop
Activare **meniu iluminare ambientală** (64 culori) după retrofit LED.

## Module
**HU** (meniul ambient) + **BCF_222 / SAM** (control benzi LED) + **EZS**.

## Valori (DTS Monaco / variant coding)
```
HU:   AMBIENT_LIGHT_MENU = coded
SAM:  AMBIENTE_BELEUCHTUNG = 64_farben
```

> Necesită benzi LED ambientale montate. Codare pe mai multe ECU-uri.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'Mercedes W205/W213 — Meniu AMG + vitezometru digital', 'Mercedes', 'Ceas / Cluster', 'W205 / W213', 'IC / KOMBI', 'DTS Monaco', 'ro',
   array['amg menu', 'digital speed', 'cluster', 'ic']::text[],
   $vg$## Scop
**Meniu AMG** în bord (temp ulei, cutie, turometru sport) + **vitezometru digital**.

## Modul
**IC** (Instrument Cluster) → variant coding.

## Valori
```
AMG_MENU / SPORT_DISPLAY: enabled
DIGITAL_SPEEDOMETER:      enabled
OIL_TEMP_DISPLAY:         enabled
```

> Disponibil pe cluster non-AMG. Denumirile variază NTG5 vs NTG6.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'Mercedes W205/W213 — Rabatare automată oglinzi la închidere', 'Mercedes', 'Codare', 'W205 / W213', 'SAM / oglinzi', 'DTS Monaco', 'ro',
   array['oglinzi', 'rabatare', 'auto fold', 'lock']::text[],
   $vg$## Scop
Rabatare automată oglinzi la închidere + desfacere la descuiere.

## Modul
**SAM** / modul uși → variant coding.

## Valori
```
MIRROR_FOLD_ON_LOCK:    enabled
MIRROR_UNFOLD_ON_UNLOCK: enabled
```

> Necesită oglinzi cu pliere electrică.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'Mercedes W205/W213 — Coming / Leaving Home', 'Mercedes', 'Codare', 'W205 / W213', 'SAM / EZS', 'DTS Monaco', 'ro',
   array['coming home', 'leaving home', 'lumini']::text[],
   $vg$## Scop
Lumini **Coming / Leaving Home** cu durată reglabilă.

## Modul
**SAM** (control lumini) → variant coding.

## Valori
```
COMING_HOME:  enabled
LEAVING_HOME: enabled
DURATION:     ~40 s
```

> Reglează durata din meniul bordului după codare.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'Mercedes W205/W213 — Dezactivare avertizare centură', 'Mercedes', 'Codare', 'W205 / W213', 'IC / SRS', 'Vediamo', 'ro',
   array['centura', 'chime', 'seatbelt']::text[],
   $vg$## Scop
Dezactivare avertizare sonoră centură (scop tehnic pe rampă).

## Modul
**IC** / modul SRS → variant coding.

## Valori
```
SEATBELT_CHIME:   disabled
SEATBELT_WARNING: disabled
```

> ⚠️ Doar tehnic. Recomandat repus pe activ pentru uz normal (siguranță).$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'Mercedes W205/W213 — Descuiere selectivă (o ușă)', 'Mercedes', 'Codare', 'W205 / W213', 'EZS / SAM', 'DTS Monaco', 'ro',
   array['descuiere selectiva', 'single door', 'unlock']::text[],
   $vg$## Scop
**Descuiere selectivă** (o singură ușă la prima apăsare pe cheie).

## Modul
**EZS / SAM** → variant coding.

## Valori
```
SELECTIVE_UNLOCK / SINGLE_DOOR_UNLOCK: enabled
```

> Confort + securitate. O apăsare = ușa șoferului; două = toate.$vg$,
   'Referință VisionGarage'),
  (admin_id, 'shared',
   'Mercedes W205/W213 — Animație de pornire AMG/Designo', 'Mercedes', 'Codare', 'W205 / W213', 'HU / IC', 'DTS Monaco', 'ro',
   array['startup', 'animatie', 'amg', 'designo']::text[],
   $vg$## Scop
**Animație de pornire** AMG / Designo pe display + bord.

## Module
**HU** (display central) + **IC** (bord).

## Valori
```
STARTUP_ANIMATION: AMG  (sau Designo / Maybach)
```

> Pur estetic. Alege setul care se potrivește echiparea.$vg$,
   'Referință VisionGarage');

  return 'OK: am inserat 27 proceduri în biblioteca partajată.';
end $$;
