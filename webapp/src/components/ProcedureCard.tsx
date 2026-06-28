"use client";

import { Link } from "@/i18n/routing";
import { BRAND_ACCENT } from "@/lib/constants";
import type { SearchResult } from "@/lib/types";

export default function ProcedureCard({ r }: { r: SearchResult }) {
  const accent = BRAND_ACCENT[r.brand] ?? "#b8922a";
  return (
    <Link
      href={`/p/${r.id}`}
      className="block rounded-xl border border-gold/15 bg-ink/50 p-4 transition hover:border-gold/40 hover:bg-ink-light/40"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
          style={{ background: `${accent}22`, color: accent }}
        >
          {r.brand}
        </span>
        <span className="rounded bg-ink-dark px-2 py-0.5 text-[11px] text-cream/60">
          {r.category}
        </span>
        {r.tool && (
          <span className="rounded bg-ink-dark px-2 py-0.5 text-[11px] text-cream/60">
            {r.tool}
          </span>
        )}
        <span className="ml-auto rounded border border-gold/25 px-1.5 py-0.5 text-[10px] uppercase text-gold-light">
          {r.language}
        </span>
        {r.is_favorite && <span className="text-gold">★</span>}
        {r.visibility === "shared" && (
          <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] uppercase text-gold-light">
            VG
          </span>
        )}
      </div>
      <h3 className="font-heading text-lg text-cream">{r.title}</h3>
      <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted">
        {r.vehicle && <span>🚗 {r.vehicle}</span>}
        {r.module_ecu && <span>🔧 {r.module_ecu}</span>}
      </div>
      {r.headline && (
        <p
          className="mt-2 line-clamp-2 text-sm text-cream/55 [&_mark]:bg-gold [&_mark]:text-ink-dark"
          dangerouslySetInnerHTML={{ __html: r.headline }}
        />
      )}
      {r.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {r.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="rounded bg-ink-dark px-1.5 py-0.5 text-[10px] text-cream/50">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
