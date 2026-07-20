// ════════════════════════════════════════════════════════════════════════════
// CUSĂTURĂ STRIPE — NU este integrată în v1 (cerință explicită).
//
// Tot ce ține de abonament trece prin câmpul `profiles.subscription_status`
// (+ `subscription_expires_at`). Aplicația GATEAZĂ accesul DOAR pe baza acestor
// câmpuri (vezi RLS `is_subscription_active()` și `src/lib/security/guard.ts`).
//
// Pentru a activa plățile mai târziu, NU trebuie rescrisă nicio logică de acces:
//   1) Creezi produse/prețuri în Stripe.
//   2) Adaugi o rută webhook `/api/billing/webhook` care, la evenimentele Stripe
//      (checkout.session.completed, customer.subscription.updated/deleted),
//      apelează `applySubscriptionFromStripe(...)` de mai jos.
//   3) Adaugi o rută `/api/billing/checkout` care creează o sesiune Stripe Checkout.
//
// Funcția de mai jos este singurul punct de contact: setează statusul în DB.
// ════════════════════════════════════════════════════════════════════════════

import { createAdminClient } from "@/lib/supabase/admin";
import type { SubStatus } from "@/lib/types";

export async function applySubscriptionFromStripe(params: {
  userId: string;
  status: SubStatus;
  expiresAt: string | null;
}) {
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({
      subscription_status: params.status,
      subscription_expires_at: params.expiresAt,
    })
    .eq("id", params.userId);
}

// Placeholder — va crea o sesiune Stripe Checkout când integrezi plățile.
export async function createCheckoutSessionStub(): Promise<{ url: string }> {
  throw new Error(
    "Stripe nu este activat în v1. Vezi src/lib/billing/stripe-seam.ts pentru pașii de integrare."
  );
}
