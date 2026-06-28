import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthContext } from "@/lib/security/guard";
import type { SubStatus } from "@/lib/types";

// Admin: schimbă statusul abonamentului unui user (revocare instant / activare).
export async function POST(req: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || ctx.profile.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { userId, status, expiresAt } = (await req.json()) as {
    userId: string;
    status: SubStatus;
    expiresAt?: string | null;
  };
  if (!userId || !["trial", "active", "expired"].includes(status)) {
    return NextResponse.json({ error: "bad_input" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      subscription_status: status,
      subscription_expires_at:
        status === "expired" ? new Date().toISOString() : expiresAt ?? null,
    })
    .eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
