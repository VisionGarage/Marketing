"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const t = useTranslations("procedure");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard indisponibil */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1 rounded border border-gold/30 bg-ink-dark/70 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-gold-light transition hover:bg-ink-light ${className}`}
      aria-label={t("copy")}
    >
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
