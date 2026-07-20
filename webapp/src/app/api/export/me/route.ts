import { NextResponse, type NextRequest } from "next/server";
import archiver from "archiver";
import { PassThrough } from "node:stream";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthContext, isSubscriptionActive } from "@/lib/security/guard";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logAccess } from "@/lib/security/audit";
import type { Attachment, Procedure } from "@/lib/types";

const BUCKET = process.env.NEXT_PUBLIC_ATTACHMENTS_BUCKET ?? "attachments";

// Export GDPR: DOAR notițele PRIVATE ale userului + atașamentele lor. Biblioteca
// partajată NU se exportă niciodată (anti-clonare). Rezultat: ZIP cu date + fișiere.
export async function GET(req: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || !isSubscriptionActive(ctx.profile)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rl = checkRateLimit(`zip:${ctx.userId}`, 10);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const supabase = await createClient();
  // STRICT: doar private + proprii.
  const { data: procs } = await supabase
    .from("procedures")
    .select("*")
    .eq("owner_id", ctx.userId)
    .eq("visibility", "private");
  const procedures = (procs as Procedure[]) ?? [];

  const ids = procedures.map((p) => p.id);
  const { data: atts } =
    ids.length > 0
      ? await supabase.from("attachments").select("*").in("procedure_id", ids)
      : { data: [] as Attachment[] };
  const attachments = (atts as Attachment[]) ?? [];

  await logAccess({
    userId: ctx.userId,
    action: "export",
    req,
    meta: { kind: "zip_me", procedures: procedures.length },
  });

  const admin = createAdminClient();
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = new PassThrough();
  archive.pipe(stream);

  // index machine-readable (pentru re-import)
  archive.append(
    JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        user: { email: ctx.profile.email, watermark: ctx.profile.watermark_tag },
        procedures,
        attachments: attachments.map((a) => ({
          id: a.id,
          procedure_id: a.procedure_id,
          file_name: a.file_name,
          kind: a.kind,
          path_in_zip: `attachments/${a.id}_${a.file_name}`,
        })),
      },
      null,
      2
    ),
    { name: "data.json" }
  );

  // câte un .md lizibil per procedură
  for (const p of procedures) {
    const md = `# ${p.title}\n\n> ${p.brand} · ${p.category} · ${p.language.toUpperCase()}\n\n${p.content_md}\n`;
    archive.append(md, { name: `markdown/${p.id}.md` });
  }

  // fișierele atașate (descărcate cu service_role din bucket privat)
  for (const a of attachments) {
    const { data: file } = await admin.storage.from(BUCKET).download(a.storage_path);
    if (file) {
      const buf = Buffer.from(await file.arrayBuffer());
      archive.append(buf, { name: `attachments/${a.id}_${a.file_name}` });
    }
  }

  const done = archive.finalize();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  await done;
  const zip = Buffer.concat(chunks);

  return new NextResponse(zip, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="visiongarage-export-${Date.now()}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
