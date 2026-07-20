import { createAdminClient } from "@/lib/supabase/admin";
import type { NextRequest } from "next/server";

type Action = "view" | "search" | "export" | "signed_url" | "process_enqueue" | "import";

/**
 * Jurnal de acces: cine, ce, când. Scris cu service_role (RLS interzice scrierea din client),
 * userii își pot citi DOAR propriul jurnal (adminul pe tot).
 * Întoarce numărul de proceduri deschise în ultima oră (pentru flag de anomalie).
 */
export async function logAccess(opts: {
  userId: string;
  action: Action;
  procedureId?: string | null;
  req?: NextRequest;
  meta?: Record<string, unknown>;
}): Promise<{ anomaly: boolean; opensLastHour: number }> {
  const admin = createAdminClient();
  const ip =
    opts.req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = opts.req?.headers.get("user-agent") ?? null;

  await admin.from("access_log").insert({
    user_id: opts.userId,
    action: opts.action,
    procedure_id: opts.procedureId ?? null,
    ip,
    user_agent: ua,
    meta: opts.meta ?? null,
  });

  // Flag de anomalie: prea multe proceduri deschise/oră de un singur user.
  if (opts.action === "view") {
    const { data } = await admin.rpc("recent_open_count", {
      p_user: opts.userId,
      p_minutes: 60,
    });
    const opensLastHour = Number(data ?? 0);
    const threshold = Number(process.env.ANOMALY_OPEN_THRESHOLD_PER_HOUR ?? 300);
    const anomaly = opensLastHour > threshold;
    if (anomaly) {
      await admin.from("access_log").insert({
        user_id: opts.userId,
        action: "view",
        meta: { flag: "ANOMALY", opensLastHour, threshold },
      });
    }
    return { anomaly, opensLastHour };
  }
  return { anomaly: false, opensLastHour: 0 };
}
