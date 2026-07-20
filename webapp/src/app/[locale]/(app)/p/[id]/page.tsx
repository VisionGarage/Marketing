import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/security/guard";
import { logAccess } from "@/lib/security/audit";
import { BRAND_ACCENT } from "@/lib/constants";
import type { Attachment, Procedure } from "@/lib/types";
import Markdown from "@/components/Markdown";
import FavoriteButton from "@/components/FavoriteButton";
import DeleteProcedureButton from "@/components/DeleteProcedureButton";

export default async function ProcedurePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("procedure");
  const ctx = await getAuthContext();
  const supabase = await createClient();

  // RLS garantează că vedem doar procedurile proprii sau din biblioteca partajată.
  const { data: proc } = await supabase
    .from("procedures")
    .select("*")
    .eq("id", id)
    .single();
  if (!proc) notFound();
  const procedure = proc as Procedure;

  const { data: atts } = await supabase
    .from("attachments")
    .select("*")
    .eq("procedure_id", id)
    .order("created_at", { ascending: true });
  const attachments = (atts as Attachment[]) ?? [];

  const { data: favRow } = await supabase
    .from("favorites")
    .select("procedure_id")
    .eq("procedure_id", id)
    .maybeSingle();

  const isOwner = ctx?.userId === procedure.owner_id;

  // Jurnal de acces + actualizare „văzute recent" + flag anomalie (best-effort).
  if (ctx) {
    await logAccess({ userId: ctx.userId, action: "view", procedureId: id });
    await supabase
      .from("recent_views")
      .upsert(
        { user_id: ctx.userId, procedure_id: id, viewed_at: new Date().toISOString() },
        { onConflict: "user_id,procedure_id" }
      );
  }

  const accent = BRAND_ACCENT[procedure.brand] ?? "#b8922a";
  const images = attachments.filter((a) => a.kind === "image");
  const files = attachments.filter((a) => a.kind !== "image");
  const fmt = (d: string) => new Date(d).toLocaleString();

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/" className="mb-4 inline-block text-sm text-gold-light hover:underline">
        ← {t("backToLibrary")}
      </Link>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className="rounded px-2 py-0.5 text-xs font-semibold uppercase"
          style={{ background: `${accent}22`, color: accent }}
        >
          {procedure.brand}
        </span>
        <span className="rounded bg-ink-dark px-2 py-0.5 text-xs text-cream/60">
          {procedure.category}
        </span>
        {procedure.tool && (
          <span className="rounded bg-ink-dark px-2 py-0.5 text-xs text-cream/60">
            {procedure.tool}
          </span>
        )}
        <span className="rounded border border-gold/25 px-1.5 py-0.5 text-[10px] uppercase text-gold-light">
          {procedure.language}
        </span>
        {procedure.visibility === "shared" && (
          <span className="rounded bg-gold/15 px-2 py-0.5 text-[10px] uppercase text-gold-light">
            {t("readOnlyShared")}
          </span>
        )}
      </div>

      <h1 className="font-heading text-3xl text-cream">{procedure.title}</h1>

      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {procedure.vehicle && <span>🚗 {procedure.vehicle}</span>}
        {procedure.module_ecu && <span>🔧 {procedure.module_ecu}</span>}
        <span>
          {t("updatedAt")}: {fmt(procedure.updated_at)}
        </span>
      </div>

      {/* Acțiuni */}
      <div className="mt-4 flex flex-wrap gap-2">
        <FavoriteButton procedureId={id} initial={!!favRow} />
        <a
          href={`/api/export/procedure/${id}?format=pdf`}
          className="rounded-lg border border-gold/25 px-3 py-1.5 text-sm text-cream/70 hover:bg-ink-light"
        >
          ⬇ {t("exportPdf")}
        </a>
        <a
          href={`/api/export/procedure/${id}?format=md`}
          className="rounded-lg border border-gold/25 px-3 py-1.5 text-sm text-cream/70 hover:bg-ink-light"
        >
          ⬇ {t("exportMd")}
        </a>
        {isOwner && (
          <>
            <Link
              href={`/edit/${id}`}
              className="rounded-lg border border-gold/25 px-3 py-1.5 text-sm text-cream/70 hover:bg-ink-light"
            >
              ✎ {t("edit")}
            </Link>
            <DeleteProcedureButton procedureId={id} />
          </>
        )}
      </div>

      {/* Conținut */}
      <div className="mt-6">
        <Markdown content={procedure.content_md} />
      </div>

      {/* Galerie imagini (servite prin URL semnat via /api/attachments/[id]) */}
      {images.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl text-cream">{t("attachments")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((a) => (
              <a
                key={a.id}
                href={`/api/attachments/${a.id}`}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg border border-gold/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/attachments/${a.id}`}
                  alt={a.file_name}
                  className="h-32 w-full object-cover"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Fișiere (bin/pdf/zip) */}
      {files.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-heading text-xl text-cream">Fișiere</h2>
          <ul className="space-y-2">
            {files.map((a) => (
              <li key={a.id}>
                <a
                  href={`/api/attachments/${a.id}`}
                  className="flex items-center gap-2 rounded-lg border border-gold/20 bg-ink/40 px-3 py-2 text-sm text-cream/80 hover:bg-ink-light"
                >
                  📎 {a.file_name}
                  {a.size_bytes ? (
                    <span className="text-xs text-muted">
                      ({Math.round(a.size_bytes / 1024)} KB)
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {procedure.source_notes && (
        <p className="mt-8 border-t border-gold/15 pt-4 text-xs text-muted">
          {t("source")}: {procedure.source_notes}
        </p>
      )}
    </article>
  );
}
