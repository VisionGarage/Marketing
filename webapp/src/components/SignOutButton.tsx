"use client";

import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/routing";

export default function SignOutButton() {
  const t = useTranslations("nav");
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="w-full rounded-lg border border-gold/20 px-3 py-2 text-left text-sm text-cream/70 transition hover:bg-ink-light hover:text-cream"
    >
      {t("logout")}
    </button>
  );
}
