"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

// Selectorul de limbă al INTERFEȚEI (distinct de filtrul de limbă al CONȚINUTULUI).
const LABELS: Record<string, string> = { ro: "Română", en: "English", it: "Italiano" };

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <select
      aria-label="Interface language"
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className="rounded border border-gold/25 bg-ink-dark px-2 py-1 text-xs text-cream/80 focus:border-gold focus:outline-none"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {LABELS[l] ?? l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
