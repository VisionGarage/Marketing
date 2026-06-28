import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext, isSubscriptionActive } from "@/lib/security/guard";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logAccess } from "@/lib/security/audit";
import { procedureToPdf } from "@/lib/export/pdf";
import type { Procedure } from "@/lib/types";

// Export al UNEI proceduri (vizibilă userului) în PDF (watermark per-user) sau Markdown.
// NU este export în bloc — biblioteca partajată nu poate fi clonată în masă.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const format = new URL(req.url).searchParams.get("format") ?? "pdf";

  const ctx = await getAuthContext();
  if (!ctx || !isSubscriptionActive(ctx.profile)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rl = checkRateLimit(`exp:${ctx.userId}`);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const supabase = await createClient();
  const { data: proc } = await supabase.from("procedures").select("*").eq("id", id).single();
  if (!proc) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const p = proc as Procedure;

  await logAccess({ userId: ctx.userId, action: "export", procedureId: id, req, meta: { format } });

  const safeName = p.title.replace(/[^\p{L}\p{N}]+/gu, "_").slice(0, 60);

  if (format === "md") {
    // Markdown cu antet de watermark per-user în comentariu (urmărire scurgeri).
    const md = `<!-- VisionGarage export • ${ctx.profile.watermark_tag} • ${ctx.profile.email} • redistribuirea interzisă -->
# ${p.title}

> **${p.brand}** · ${p.category}${p.vehicle ? ` · ${p.vehicle}` : ""}${
      p.module_ecu ? ` · ${p.module_ecu}` : ""
    }${p.tool ? ` · ${p.tool}` : ""} · ${p.language.toUpperCase()}
${p.tags?.length ? `> Tag-uri: ${p.tags.join(", ")}\n` : ""}
${p.content_md}
`;
    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}.md"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const pdf = await procedureToPdf(p, ctx.profile);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
