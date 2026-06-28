import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/security/guard";

// Admin: populează biblioteca demo (idempotent).
export async function POST() {
  const ctx = await getAuthContext();
  if (!ctx || ctx.profile.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("seed_demo_library", {
    admin_email: ctx.profile.email,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, message: data });
}
