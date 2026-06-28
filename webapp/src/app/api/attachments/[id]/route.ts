import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthContext, isSubscriptionActive } from "@/lib/security/guard";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logAccess } from "@/lib/security/audit";

const BUCKET = process.env.NEXT_PUBLIC_ATTACHMENTS_BUCKET ?? "attachments";
const TTL = Number(process.env.SIGNED_URL_TTL_SECONDS ?? 120);

// Servește un atașament DOAR prin URL semnat cu durată scurtă, după verificarea accesului.
// Fără listare/enumerare a bucket-ului. Biblioteca partajată nu poate fi clonată din storage.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ctx = await getAuthContext();
  if (!ctx || !isSubscriptionActive(ctx.profile)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(`att:${ctx.userId}`);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  // Verificare acces prin RLS: dacă userul NU poate citi rândul, nu poate vedea fișierul.
  const supabase = await createClient();
  const { data: att } = await supabase
    .from("attachments")
    .select("storage_path, file_name")
    .eq("id", id)
    .single();
  if (!att) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Accesul e permis => generăm URL semnat cu service_role (fișierul poate aparține adminului).
  const admin = createAdminClient();
  const { data: signed, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(att.storage_path, TTL);
  if (error || !signed) {
    return NextResponse.json({ error: "sign_failed" }, { status: 500 });
  }

  await logAccess({ userId: ctx.userId, action: "signed_url", req, meta: { attachment: id } });

  return NextResponse.redirect(signed.signedUrl, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
