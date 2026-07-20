"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/routing";
import { BRANDS, CATEGORIES, TOOLS, CONTENT_LANGUAGES } from "@/lib/constants";
import type { Procedure } from "@/lib/types";
import Markdown from "./Markdown";

const ATT_BUCKET = process.env.NEXT_PUBLIC_ATTACHMENTS_BUCKET ?? "attachments";

export default function ProcedureForm({
  initial,
  isAdmin,
}: {
  initial?: Procedure;
  isAdmin: boolean;
}) {
  const t = useTranslations("procedure");
  const supabase = createClient();
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [id, setId] = useState<string | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? BRANDS[0]);
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [vehicle, setVehicle] = useState(initial?.vehicle ?? "");
  const [moduleEcu, setModuleEcu] = useState(initial?.module_ecu ?? "");
  const [tool, setTool] = useState(initial?.tool ?? "");
  const [language, setLanguage] = useState(initial?.language ?? "ro");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [content, setContent] = useState(initial?.content_md ?? "");
  const [source, setSource] = useState(initial?.source_notes ?? "");
  const [visibility, setVisibility] = useState<"private" | "shared">(
    initial?.visibility ?? "private"
  );

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function payload() {
    return {
      title: title.trim(),
      brand,
      category,
      vehicle: vehicle.trim() || null,
      module_ecu: moduleEcu.trim() || null,
      tool: tool || null,
      language,
      tags: tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      content_md: content,
      source_notes: source.trim() || null,
      visibility,
    };
  }

  // Asigură că procedura există (returnează id). Necesar înainte de a atașa fișiere.
  async function ensureSaved(): Promise<string | null> {
    if (id) {
      await supabase.from("procedures").update(payload()).eq("id", id);
      return id;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("procedures")
      .insert({ ...payload(), owner_id: user.id })
      .select("id")
      .single();
    if (error) {
      setErr(error.message);
      return null;
    }
    setId(data.id);
    window.history.replaceState(null, "", `/edit/${data.id}`);
    return data.id;
  }

  async function uploadFile(file: File, asImage: boolean) {
    setErr(null);
    const procId = await ensureSaved();
    if (!procId) return;
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const ext = file.name.split(".").pop() || (asImage ? "png" : "bin");
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(ATT_BUCKET)
        .upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (upErr) throw upErr;

      const { data: att, error: aErr } = await supabase
        .from("attachments")
        .insert({
          procedure_id: procId,
          owner_id: user.id,
          storage_path: path,
          file_name: file.name || `paste.${ext}`,
          mime_type: file.type || null,
          size_bytes: file.size,
          kind: asImage ? "image" : "file",
        })
        .select("id")
        .single();
      if (aErr) throw aErr;

      if (asImage) {
        // Inserează referința în Markdown la poziția cursorului.
        const ref = `\n![${file.name || "captura"}](/api/attachments/${att.id})\n`;
        const ta = contentRef.current;
        const pos = ta?.selectionStart ?? content.length;
        setContent((c) => c.slice(0, pos) + ref + c.slice(pos));
      } else {
        setErr(null);
        alert(`${t("addAttachment")}: ${file.name} ✓`);
      }
    } catch (e: any) {
      setErr(e?.message ?? "upload error");
    } finally {
      setUploading(false);
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const it of items) {
      if (it.type.startsWith("image/")) {
        const file = it.getAsFile();
        if (file) {
          e.preventDefault();
          void uploadFile(file, true);
        }
      }
    }
  }

  async function save() {
    setErr(null);
    if (!title.trim()) {
      setErr(t("title") + " — " + t("save"));
      return;
    }
    setBusy(true);
    const procId = await ensureSaved();
    setBusy(false);
    if (procId) {
      router.push(`/p/${procId}`);
      router.refresh();
    }
  }

  const input =
    "w-full rounded-lg border border-gold/25 bg-ink-dark/60 px-3 py-2 text-cream placeholder:text-muted focus:border-gold focus:outline-none";
  const lbl = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gold";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-heading text-3xl text-cream">
        {id ? t("editTitle") : t("newTitle")}
      </h1>

      <div>
        <label className={lbl}>
          {t("title")} <span className="text-red-300">*</span>
        </label>
        <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={lbl}>{t("brand")}</label>
          <select className={input} value={brand} onChange={(e) => setBrand(e.target.value)}>
            {BRANDS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>{t("category")}</label>
          <select
            className={input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>{t("vehicle")}</label>
          <input
            className={input}
            value={vehicle}
            placeholder="F30, W447, MQB"
            onChange={(e) => setVehicle(e.target.value)}
          />
        </div>
        <div>
          <label className={lbl}>{t("module")}</label>
          <input
            className={input}
            value={moduleEcu}
            placeholder="CAS4, EDC17, KOMBI"
            onChange={(e) => setModuleEcu(e.target.value)}
          />
        </div>
        <div>
          <label className={lbl}>{t("tool")}</label>
          <select className={input} value={tool} onChange={(e) => setTool(e.target.value)}>
            <option value="">—</option>
            {TOOLS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>{t("language")}</label>
          <select
            className={input}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {CONTENT_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={lbl}>
          {t("tags")} <span className="font-normal lowercase text-muted">({t("tagsHint")})</span>
        </label>
        <input
          className={input}
          value={tags}
          placeholder="vim, nbt, fdl"
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      {/* Editor markdown + preview live */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className={lbl}>{t("content")}</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`rounded px-2 py-1 text-xs ${
                tab === "write" ? "bg-gold/20 text-gold-light" : "text-cream/60"
              }`}
            >
              {t("write")}
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`rounded px-2 py-1 text-xs ${
                tab === "preview" ? "bg-gold/20 text-gold-light" : "text-cream/60"
              }`}
            >
              {t("preview")}
            </button>
          </div>
        </div>
        <p className="mb-2 text-xs text-muted">{t("contentHint")}</p>
        {tab === "write" ? (
          <textarea
            ref={contentRef}
            className={`${input} min-h-[320px] font-mono text-sm`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={onPaste}
          />
        ) : (
          <div className="min-h-[320px] rounded-lg border border-gold/15 bg-ink/40 p-4">
            <Markdown content={content || "_—_"} />
          </div>
        )}
        {uploading && <p className="mt-1 text-xs text-gold-light">⬆ {t("saving")}</p>}
      </div>

      {/* Atașamente */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-lg border border-gold/30 px-3 py-1.5 text-sm text-gold-light hover:bg-ink-light">
          🖼 {t("pasteImage").split("(")[0]}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], true)}
          />
        </label>
        <label className="cursor-pointer rounded-lg border border-gold/30 px-3 py-1.5 text-sm text-gold-light hover:bg-ink-light">
          📎 {t("addAttachment")}
          <input
            type="file"
            hidden
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], false)}
          />
        </label>
      </div>

      <div>
        <label className={lbl}>{t("source")}</label>
        <input className={input} value={source} onChange={(e) => setSource(e.target.value)} />
      </div>

      {/* Vizibilitate — „shared" doar pentru admin */}
      <div>
        <label className={lbl}>{t("visibility")}</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex items-center gap-2 text-sm text-cream/80">
            <input
              type="radio"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            />
            {t("visPrivate")}
          </label>
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm text-cream/80">
              <input
                type="radio"
                checked={visibility === "shared"}
                onChange={() => setVisibility("shared")}
              />
              {t("visShared")}
            </label>
          )}
        </div>
      </div>

      {err && <p className="text-sm text-red-300">{err}</p>}

      <div className="flex gap-2 pb-10">
        <button
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-gold px-5 py-2.5 font-semibold text-ink-dark transition hover:bg-gold-light disabled:opacity-50"
        >
          {busy ? t("saving") : t("save")}
        </button>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gold/25 px-5 py-2.5 text-cream/70 hover:bg-ink-light"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
