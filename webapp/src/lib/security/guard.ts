import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export interface AuthContext {
  userId: string;
  profile: Profile;
}

/**
 * Poarta de acces centrală. Verifică:
 *  1) există sesiune validă;
 *  2) abonamentul e activ (trial/active, neexpirat) — expirat/revocat => acces tăiat.
 * Întoarce null dacă userul NU are voie (apelantul redirecționează / 403).
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return { userId: user.id, profile: profile as Profile };
}

export function isSubscriptionActive(p: Profile): boolean {
  if (p.subscription_status === "expired") return false;
  if (p.subscription_expires_at && new Date(p.subscription_expires_at) < new Date())
    return false;
  return p.subscription_status === "trial" || p.subscription_status === "active";
}
