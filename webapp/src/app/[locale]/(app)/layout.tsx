import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { getAuthContext, isSubscriptionActive } from "@/lib/security/guard";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const ctx = await getAuthContext();
  if (!ctx) redirect({ href: "/login", locale });

  const { profile } = ctx!;
  const t = await getTranslations("subscription");

  // Poarta de abonament: expirat/revocat => acces tăiat (ecran blocant).
  if (!isSubscriptionActive(profile)) {
    return (
      <main className="vg-watermark flex min-h-dvh items-center justify-center px-4">
        <div className="relative z-10 max-w-md rounded-2xl border border-gold/20 bg-ink/70 p-8 text-center">
          <h1 className="mb-3 font-heading text-2xl text-cream">{t("expiredTitle")}</h1>
          <p className="mb-6 text-sm text-cream/70">{t("expiredBody")}</p>
          <a
            href="mailto:visiongaragear@gmail.com"
            className="inline-block rounded-lg bg-gold px-5 py-2.5 font-semibold text-ink-dark hover:bg-gold-light"
          >
            {t("contact")}
          </a>
        </div>
      </main>
    );
  }

  // Banner de trial (zile rămase)
  let trialDays: number | null = null;
  if (profile.subscription_status === "trial" && profile.subscription_expires_at) {
    trialDays = Math.max(
      0,
      Math.ceil(
        (new Date(profile.subscription_expires_at).getTime() - Date.now()) / 86400000
      )
    );
  }

  return (
    <div className="vg-watermark relative flex min-h-dvh flex-col md:flex-row">
      <Sidebar isAdmin={profile.role === "admin"} watermarkTag={profile.watermark_tag} />
      <div className="relative z-10 min-w-0 flex-1">
        {trialDays !== null && (
          <div className="border-b border-gold/20 bg-gold/10 px-4 py-2 text-center text-xs text-gold-light">
            {t("trialBanner", { days: trialDays })}
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</div>
      </div>
      {/* Marcaj per-user discret peste conținut (urmărire scurgeri) */}
      <span className="vg-user-mark">VG · {profile.watermark_tag} · {profile.email}</span>
    </div>
  );
}
