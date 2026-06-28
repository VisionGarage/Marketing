import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthContext, isSubscriptionActive } from "@/lib/security/guard";
import { logAccess } from "@/lib/security/audit";

const BUCKET = process.env.PROCESSING_BUCKET ?? "processing";
const TTL = Number(process.env.SIGNED_URL_TTL_SECONDS ?? 120);

// Livrează DOAR rezultatul unui job, prin URL semnat scurt. Fișierul de intrare al
// userului și metoda de procesare nu se expun niciodată.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getAuthContext();
  if (!ctx || !isSubscriptionActive(ctx.profile)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  // RLS: userul vede doar joburile proprii.
  const { data: job } = await supabase
    .from("processing_jobs")
    .select("output_path, status")
    .eq("id", id)
    .single();
  if (!job || job.status !== "done" || !job.output_path) {
    return NextResponse.json({ error: "not_ready" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: signed, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(job.output_path, TTL, { download: `rezultat-${id}.bin` });
  if (error || !signed) return NextResponse.json({ error: "sign_failed" }, { status: 500 });

  await logAccess({ userId: ctx.userId, action: "signed_url", req, meta: { result: id } });
  return NextResponse.redirect(signed.signedUrl, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
