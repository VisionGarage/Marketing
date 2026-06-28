import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client de server pentru Server Components / Route Handlers.
// Folosește anon key + cookie-ul de sesiune => RLS aplică izolarea per-user.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll apelat dintr-un Server Component — ignorabil; middleware reîmprospătează sesiunea.
          }
        },
      },
    }
  );
}
