"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function DataExport() {
  const t = useTranslations("export");
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function doImport(file: File) {
    setImporting(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/import", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    setImporting(false);
    setMsg(res.ok ? `✓ ${j.imported ?? 0}` : j.error ?? "error");
  }

  return (
    <div className="space-y-3">
      <a
        href="/api/export/me"
        className="inline-block rounded-lg border border-gold/30 px-4 py-2 text-sm text-gold-light hover:bg-ink-light"
      >
        ⬇ {t("myData")}
      </a>
      <p className="text-xs text-muted">{t("myDataHint")}</p>

      <label className="inline-block cursor-pointer rounded-lg border border-gold/30 px-4 py-2 text-sm text-gold-light hover:bg-ink-light">
        {importing ? t("preparing") : `⬆ ${t("import")}`}
        <input
          type="file"
          accept=".zip"
          hidden
          disabled={importing}
          onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
        />
      </label>
      <p className="text-xs text-muted">{t("importHint")}</p>
      {msg && <p className="text-sm text-gold-light">{msg}</p>}
    </div>
  );
}
