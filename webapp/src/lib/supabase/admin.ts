import { createClient } from "@supabase/supabase-js";

// ⚠️ Client cu SERVICE_ROLE — ocolește RLS. Folosit DOAR în rute server / worker,
// NICIODATĂ în client. Toate apelurile care îl folosesc verifică ÎNTÂI accesul userului
// printr-un client normal (RLS), apoi folosesc acest client pentru operații privilegiate
// controlate (ex: generare URL semnat la fișierele adminului, scriere în access_log,
// schimbare rol/abonament de către admin).
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY lipsește din mediu.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
