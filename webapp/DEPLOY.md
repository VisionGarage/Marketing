# Deploy — Vercel + Supabase

Ghid pas cu pas ca să accesezi aplicația de pe telefon, de oriunde.

## A. Supabase (producție, regiunea UE)

1. **Proiect UE:** dacă nu l-ai creat deja, fă-l în **eu-central-1 (Frankfurt)** pentru GDPR.
2. **Migrații:** în **SQL Editor**, rulează în ordine:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_storage.sql`
   - `supabase/migrations/0003_seed.sql`
3. **Storage:** verifică în **Storage** că există bucket-urile `attachments` și `processing`
   și că sunt **Private** (migrația le creează automat).
4. **Auth → Providers:** activează **Email** (parolă) și **Magic Link** (Email OTP).
5. **Auth → URL Configuration:**
   - `Site URL`: domeniul tău Vercel (ex: `https://visiongarage.vercel.app`)
   - `Redirect URLs`: adaugă `https://DOMENIUL-TAU/auth/callback` (și `http://localhost:3000/auth/callback` pentru local)
6. Notează din **Settings → API**: `Project URL`, `anon`, `service_role`.

## B. Vercel

1. Instalează CLI (sau folosește dashboard-ul): `npm i -g vercel`
2. Din folderul `webapp/`:
   ```bash
   vercel              # leagă/creează proiectul (root = webapp)
   ```
   > Dacă întreabă de *Root Directory* în dashboard, setează-l la `webapp`.
3. **Environment Variables** (Project → Settings → Environment Variables) — adaugă:

   | Cheie | Valoare |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL din Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key (**Secret**) |
   | `NEXT_PUBLIC_SITE_URL` | `https://DOMENIUL-TAU` |
   | `NEXT_PUBLIC_ATTACHMENTS_BUCKET` | `attachments` |
   | `PROCESSING_BUCKET` | `processing` |
   | `NEXT_PUBLIC_PROCESSING_BUCKET` | `processing` |
   | `SIGNED_URL_TTL_SECONDS` | `120` |
   | `RATE_LIMIT_PER_MINUTE` | `120` |
   | `ANOMALY_OPEN_THRESHOLD_PER_HOUR` | `300` |

4. Deploy în producție:
   ```bash
   vercel --prod
   ```

## C. După primul deploy

1. Creează-ți contul (email + parolă) pe domeniul live.
2. Promovează-te admin (Supabase SQL Editor):
   ```sql
   update public.profiles
   set role='admin', subscription_status='active',
       subscription_expires_at = now() + interval '100 years'
   where email = 'EMAILUL_TAU';
   ```
3. Populează biblioteca demo din **Administrare → Populează biblioteca demo**
   (sau `select public.seed_demo_library('EMAILUL_TAU');`).
4. Instalează PWA pe telefon (Add to Home Screen).

## D. Note de producție (recomandări)
- **Rate-limiting**: implementarea curentă e în-memorie (ok pentru o instanță). Pe Vercel,
  cu mai multe instanțe serverless, mută la **Upstash Redis** (REST) — interfața din
  `src/lib/security/rate-limit.ts` rămâne aceeași.
- **Procesare bin/IMMO**: pentru volum real, mută execuția workerului dintr-o rută serverless
  pe o **coadă dedicată** (Supabase Edge Function + `pg_cron`, sau worker extern). Logica de
  procesare e izolată în `src/lib/processing/worker.ts` (`runProcessingMethod`).
- **Backups**: activează Point-in-Time Recovery în Supabase.
- **Stripe**: când activezi plățile, vezi cusătura din `src/lib/billing/stripe-seam.ts`
  (nu trebuie rescrisă logica de acces — doar setezi `subscription_status`).
