import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext, isSubscriptionActive } from "@/lib/security/guard";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logAccess } from "@/lib/security/audit";
import { processJob } from "@/lib/processing/worker";
import type { ProcessingJob } from "@/lib/types";

// GET: listează joburile userului.
export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx || !isSubscriptionActive(ctx.profile)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("processing_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return NextResponse.json({ jobs: (data as ProcessingJob[]) ?? [] });
}

// POST: înregistrează un job pentru un fișier deja încărcat în bucket-ul privat 'processing'
// (sub {userId}/in/...), apoi rulează workerul (placeholder). Metoda rămâne pe server.
export async function POST(req: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || !isSubscriptionActive(ctx.profile)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rl = checkRateLimit(`proc:${ctx.userId}`, 30);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { input_path, kind } = await req.json();
  if (typeof input_path !== "string" || !input_path.startsWith(`${ctx.userId}/`)) {
    return NextResponse.json({ error: "bad_input" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("processing_jobs")
    .insert({ owner_id: ctx.userId, kind: String(kind || "generic"), input_path, status: "queued" })
    .select("id")
    .single();
  if (error || !job) {
    return NextResponse.json({ error: error?.message ?? "insert_failed" }, { status: 500 });
  }

  await logAccess({ userId: ctx.userId, action: "process_enqueue", req, meta: { job: job.id, kind } });

  // NOTĂ: pentru volum real, mută execuția pe o coadă/worker dedicat (vezi worker.ts).
  await processJob(job.id);

  return NextResponse.json({ ok: true, jobId: job.id });
}
