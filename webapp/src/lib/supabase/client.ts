"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client de browser (folosește anon key + sesiunea userului). RLS aplică izolarea.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
