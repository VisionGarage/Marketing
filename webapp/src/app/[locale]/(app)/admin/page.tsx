import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { getAuthContext } from "@/lib/security/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import AdminUsers from "@/components/AdminUsers";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const ctx = await getAuthContext();
  if (!ctx || ctx.profile.role !== "admin") redirect({ href: "/", locale });

  // Date privilegiate, citite cu service_role DOAR după verificarea rolului de admin.
  const admin = createAdminClient();
  const { data: users } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: anomalies } = await admin
    .from("v_anomaly_watch")
    .select("*")
    .limit(20);

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl text-cream">{t("title")}</h1>

      <section>
        <h2 className="mb-3 font-heading text-xl text-cream">{t("anomalies")}</h2>
        {(!anomalies || anomalies.length === 0) ? (
          <p className="text-sm text-muted">—</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {(anomalies as any[]).map((a) => (
              <li
                key={a.user_id}
                className="flex justify-between rounded border border-gold/15 bg-ink/40 px-3 py-2"
              >
                <span className="text-cream/80">{a.user_id}</span>
                <span className="text-gold-light">
                  {t("opensLastHour")}: {a.opens_last_hour}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl text-cream">{t("users")}</h2>
        <AdminUsers initial={(users as Profile[]) ?? []} />
      </section>
    </div>
  );
}
