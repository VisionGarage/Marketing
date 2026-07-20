import { getTranslations } from "next-intl/server";
import { getAuthContext } from "@/lib/security/guard";
import DataExport from "@/components/DataExport";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const te = await getTranslations("export");
  const ts = await getTranslations("subscription");
  const ctx = await getAuthContext();
  const p = ctx!.profile;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-heading text-3xl text-cream">{t("title")}</h1>

      <section className="rounded-xl border border-gold/15 bg-ink/40 p-5">
        <h2 className="mb-3 font-heading text-xl text-cream">{t("account")}</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Email</dt>
            <dd className="text-cream">{p.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{t("displayName")}</dt>
            <dd className="text-cream">{p.display_name ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Status</dt>
            <dd className="text-gold-light">{ts(p.subscription_status)}</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-lg bg-ink-dark/60 p-3 text-xs text-cream/70">
          {t("watermark", { tag: p.watermark_tag })}
          <br />
          <span className="text-muted">{t("watermarkNote")}</span>
        </p>
      </section>

      <section className="rounded-xl border border-gold/15 bg-ink/40 p-5">
        <h2 className="mb-3 font-heading text-xl text-cream">{t("language")}</h2>
        <LanguageSwitcher />
      </section>

      <section className="rounded-xl border border-gold/15 bg-ink/40 p-5">
        <h2 className="mb-3 font-heading text-xl text-cream">{te("title")}</h2>
        <DataExport />
      </section>
    </div>
  );
}
