import { NextResponse, type NextRequest } from "next/server";
import JSZip from "jszip";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthContext, isSubscriptionActive } from "@/lib/security/guard";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logAccess } from "@/lib/security/audit";

const BUCKET = process.env.NEXT_PUBLIC_ATTACHMENTS_BUCKET ?? "attachments";

// Import înapoi al unui ZIP exportat anterior. Procedurile se inserează ca PRIVATE,
// proprietate a userului curent (niciodată în biblioteca partajată).
export async function POST(req: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || !isSubscriptionActive(ctx.profile)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rl = checkRateLimit(`imp:${ctx.userId}`, 5);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const dataFile = zip.file("data.json");
  if (!dataFile) return NextResponse.json({ error: "invalid_archive" }, { status: 400 });
  const data = JSON.parse(await dataFile.async("string"));

  const supabase = await createClient();
  const admin = createAdminClient();
  let imported = 0;

  for (const p of data.procedures ?? []) {
    // Inserare ca PRIVATE pe numele userului curent (RLS verifică owner=auth.uid()).
    const { data: ins, error } = await supabase
      .from("procedures")
      .insert({
        owner_id: ctx.userId,
        visibility: "private",
        title: p.title,
        brand: p.brand,
        category: p.category,
        vehicle: p.vehicle ?? null,
        module_ecu: p.module_ecu ?? null,
        tool: p.tool ?? null,
        language: p.language ?? "ro",
        tags: p.tags ?? [],
        content_md: p.content_md ?? "",
        source_notes: p.source_notes ?? null,
      })
      .select("id")
      .single();
    if (error || !ins) continue;
    imported++;

    // re-urcă atașamentele aferente, dacă există în arhivă
    const related = (data.attachments ?? []).filter((a: any) => a.procedure_id === p.id);
    for (const a of related) {
      const entry = zip.file(a.path_in_zip);
      if (!entry) continue;
      const buf = await entry.async("uint8array");
      const ext = a.file_name.split(".").pop() || "bin";
      const path = `${ctx.userId}/${crypto.randomUUID()}.${ext}`;
      const up = await admin.storage.from(BUCKET).upload(path, buf, { upsert: false });
      if (!up.error) {
        await supabase.from("attachments").insert({
          procedure_id: ins.id,
          owner_id: ctx.userId,
          storage_path: path,
          file_name: a.file_name,
          kind: a.kind ?? "file",
        });
      }
    }
  }

  await logAccess({ userId: ctx.userId, action: "import", req, meta: { imported } });
  return NextResponse.json({ ok: true, imported });
}
