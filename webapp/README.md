# VisionGarage — Knowledge Base (PWA SaaS)

Bază de cunoștințe **multi-tenant** pentru ateliere auto: salvezi proceduri de
diagnoză / codare / programare (BMW · VAG · Mercedes) cu pași, coduri și capturi,
le cauți instant și le ai sincronizate pe PC și telefon. Aplicație **web** instalabilă
ca **PWA** pe desktop și mobil.

Construită din prima zi ca produs SaaS pe abonament: izolare strictă între clienți
(Row-Level Security la nivel de bază de date), bibliotecă partajată read-only de la tine
(admin) + notițe private ale fiecărui client, gating pe abonament cu revocare instantanee.

---

## 1. Ce trebuie instalat

| Necesar | De ce | Unde |
|---|---|---|
| **Node.js 20+** (ai 22) | rulează aplicația | https://nodejs.org (LTS) |
| **Cont Supabase** (gratuit) | Postgres + Auth + Storage + RLS | https://supabase.com — creează proiect în **regiunea UE (Frankfurt)** pentru GDPR |
| **Cont Vercel** (gratuit) | hosting/deploy | https://vercel.com |
| **Git** | versionare / deploy | — |

> Stack: **Next.js (App Router) + React + TypeScript + Tailwind + Vite-style PWA (Serwist)**,
> backend **Supabase** (Postgres/Auth/Storage/RLS), căutare full-text Postgres (tsvector/tsquery),
> i18n cu **next-intl** (RO implicit, EN, IT).

---

## 2. Pornire LOCALĂ (pas cu pas)

### 2.1 Creează proiectul Supabase
1. Intră pe supabase.com → **New project** → alege **regiunea UE (eu-central-1 / Frankfurt)**.
2. Notează din **Settings → API**: `Project URL`, `anon public`, `service_role` (secret).

### 2.2 Rulează migrațiile (schema + RLS + căutare + seed)
În Supabase: **SQL Editor → New query**, apoi rulează pe rând, în ordine, conținutul din:
1. `supabase/migrations/0001_init.sql`  — tabele, RLS, funcții, căutare FTS
2. `supabase/migrations/0002_storage.sql` — bucket-uri private + RLS pe Storage
3. `supabase/migrations/0003_seed.sql`  — funcția de populare a bibliotecii demo

> (Alternativ, cu Supabase CLI: `supabase db push` din folderul `webapp/`.)

### 2.3 Configurează variabilele de mediu
```bash
cd webapp
cp .env.example .env.local
# completează NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY din Supabase → Settings → API
```

### 2.4 Instalează și pornește
```bash
npm install
npm run dev
# deschide http://localhost:3000
```

### 2.5 Creează-ți contul admin (utilizatorul #1 = tu)
1. În aplicație: **Cont nou** cu emailul tău + parolă (confirmă din email dacă e cerut).
2. În Supabase **SQL Editor**, promovează-te admin + abonament permanent:
   ```sql
   update public.profiles
   set role = 'admin',
       subscription_status = 'active',
       subscription_expires_at = now() + interval '100 years'
   where email = 'EMAILUL_TAU';
   ```
3. Populează biblioteca demo (4 proceduri BMW/VAG/Mercedes):
   ```sql
   select public.seed_demo_library('EMAILUL_TAU');
   ```
   (sau din UI: **Administrare → Populează biblioteca demo**)

Gata — autentifică-te din nou și vei vedea biblioteca partajată + poți adăuga notițe private.

---

## 3. Cum se instalează ca aplicație (PWA)

- **iPhone (Safari):** Share → *Add to Home Screen*.
- **Android (Chrome):** meniu ⋮ → *Install app* / *Add to Home screen*.
- **Windows/Mac (Chrome/Edge):** iconița de instalare din bara de adrese.

Logoul VisionGarage apare ca iconiță, iar splash-ul folosește fundalul `#1a3330`.

---

## 4. Deploy (acces de pe telefon, de oriunde)

Vezi **[DEPLOY.md](./DEPLOY.md)** pentru pașii compleți pe Vercel + Supabase.

Pe scurt:
```bash
# din folderul webapp/
npx vercel            # prima dată: leagă proiectul
npx vercel --prod     # deploy în producție
```
Adaugă în Vercel → Project → Settings → Environment Variables aceleași chei ca în `.env.local`
(și setează `NEXT_PUBLIC_SITE_URL` la domeniul tău Vercel). În Supabase → Auth → URL Configuration,
adaugă domeniul Vercel la **Redirect URLs**.

---

## 5. Arhitectură & securitate (rezumat)

- **Multi-tenant + RLS strict:** fiecare rând are `owner_id`; politicile din `0001_init.sql`
  fac ca un user să nu poată citi niciodată rândurile/fișierele altui user — **nici prin API direct**.
- **Roluri:** `admin` (tu) publică în *biblioteca partajată* (read-only pentru toți);
  `user` are conținut **privat**, invizibil altora.
- **Gating pe abonament:** `profiles.subscription_status` (+ `expires_at`) prin
  `is_subscription_active()` în RLS **și** în `src/lib/security/guard.ts`. Expirat/revocat ⇒ acces tăiat instant.
- **Atașamente:** bucket **privat**, servite DOAR prin **URL semnat** scurt
  (`/api/attachments/[id]`), fără listare/enumerare, nume neghicibile.
- **Anti-clonare:** biblioteca partajată **nu** permite export în bloc; doar notițele
  **private** se exportă (ZIP) — `/api/export/me`. O procedură se poate exporta în PDF/MD.
- **Watermark per-user:** vizibil discret în UI + în PDF-uri (text diagonal) + în **metadatele PDF**.
- **Jurnal de acces + anomalii:** `access_log` + flag peste prag de proceduri/oră (`v_anomaly_watch`).
- **Rate-limiting:** `src/lib/security/rate-limit.ts` pe rutele API.
- **Procesare server-side (bin/IMMO):** upload → coadă (`processing_jobs`) → worker pe server
  → livrare DOAR rezultat. Metoda reală e un **placeholder marcat** în
  `src/lib/processing/worker.ts` (îl completezi tu).
- **Stripe:** **cusătură curată**, neactivată în v1 — `src/lib/billing/stripe-seam.ts`.

## 6. i18n

- UI internaționalizat complet (RO implicit, EN, IT). Tot textul stă în `messages/*.json`.
  **Limbă nouă = un singur fișier nou** + adăugat în `src/i18n/routing.ts`.
- Selectorul de limbă al **interfeței** este distinct de **filtrul de limbă al conținutului**
  (câmpul `language` de pe fiecare procedură).

## 7. Comenzi utile
```bash
npm run dev        # dezvoltare locală
npm run build      # build producție
npm run start      # rulează build-ul
npm run typecheck  # verificare TypeScript
npm run lint       # ESLint
```
