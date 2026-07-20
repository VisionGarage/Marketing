import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/AuthForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect({ href: "/", locale });

  const t = await getTranslations("app");

  return (
    <main className="vg-watermark relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo principal centrat — fundalul logoului = tema, se integrează fără margini */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo-vg.png"
            alt="VisionGarage"
            width={200}
            height={200}
            priority
            className="h-40 w-40 rounded-2xl"
          />
        </div>
        <p className="mb-8 text-center text-sm text-muted">{t("tagline")}</p>

        <div className="rounded-2xl border border-gold/15 bg-ink/60 p-6 shadow-card backdrop-blur">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
