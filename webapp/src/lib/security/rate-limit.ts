// Rate-limiting simplu, în-memorie, per-user/IP per fereastră de 1 minut.
// SUFICIENT pentru o singură instanță (Vercel serverless are însă mai multe instanțe,
// deci în producție mută la un store partajat — vezi nota de mai jos).
//
// CUSĂTURĂ pentru producție multi-instanță: înlocuiește harta de mai jos cu Upstash
// Redis (REST) sau cu un counter în Postgres. Interfața rămâne aceeași.

const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limitPerMinute = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 120)
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limitPerMinute - 1, resetAt };
  }
  b.count += 1;
  const ok = b.count <= limitPerMinute;
  return { ok, remaining: Math.max(0, limitPerMinute - b.count), resetAt: b.resetAt };
}

// curățare periodică ca să nu crească memoria nelimitat
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
}, WINDOW_MS).unref?.();
