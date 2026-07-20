"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { ProcessingJob } from "@/lib/types";

const PROC_BUCKET = process.env.NEXT_PUBLIC_PROCESSING_BUCKET ?? "processing";

export default function ProcessingPanel() {
  const t = useTranslations("processing");
  const supabase = createClient();
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [kind, setKind] = useState("immo_clean");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/process");
    if (res.ok) setJobs((await res.json()).jobs ?? []);
  }
  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  async function upload(file: File) {
    setBusy(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      // Încărcare în folderul privat de intrare al userului.
      const path = `${user.id}/in/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from(PROC_BUCKET).upload(path, file);
      if (error) throw error;
      // Înregistrează jobul; workerul de pe server procesează și livrează doar rezultatul.
      await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_path: path, kind }),
      });
      await load();
    } catch (e: any) {
      alert(e?.message ?? "error");
    } finally {
      setBusy(false);
    }
  }

  const statusLabel = (s: ProcessingJob["status"]) =>
    s === "queued" ? t("queued") : s === "processing" ? t("running") : s === "done" ? t("done") : t("error");

  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-gold/20 bg-ink/40 p-4 text-sm text-cream/70">
        {t("intro")}
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gold">
            {t("kind")}
          </label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="rounded-lg border border-gold/25 bg-ink-dark/60 px-3 py-2 text-cream"
          >
            <option value="immo_clean">IMMO clean</option>
            <option value="bin_repair">BIN repair</option>
            <option value="checksum">Checksum</option>
            <option value="generic">Generic</option>
          </select>
        </div>
        <label className="cursor-pointer rounded-lg bg-gold px-4 py-2 font-semibold text-ink-dark hover:bg-gold-light">
          {busy ? "…" : `⬆ ${t("upload")}`}
          <input
            type="file"
            hidden
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </label>
      </div>

      <p className="text-xs text-muted">{t("placeholderNote")}</p>

      <div>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted">{t("noJobs")}</p>
        ) : (
          <ul className="space-y-2">
            {jobs.map((j) => (
              <li
                key={j.id}
                className="flex items-center justify-between rounded-lg border border-gold/15 bg-ink/40 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-cream">{j.kind}</span>
                  <span className="ml-3 text-xs text-muted">
                    {new Date(j.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      j.status === "done"
                        ? "bg-green-500/15 text-green-300"
                        : j.status === "error"
                        ? "bg-red-500/15 text-red-300"
                        : "bg-gold/15 text-gold-light"
                    }`}
                  >
                    {statusLabel(j.status)}
                  </span>
                  {j.status === "done" && (
                    <a
                      href={`/api/process/result/${j.id}`}
                      className="rounded border border-gold/30 px-2 py-1 text-xs text-gold-light hover:bg-ink-light"
                    >
                      ⬇ {t("download")}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
