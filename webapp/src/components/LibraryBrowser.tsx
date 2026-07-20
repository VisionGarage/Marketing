"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { BRANDS, CATEGORIES, TOOLS, CONTENT_LANGUAGES } from "@/lib/constants";
import type { SearchResult } from "@/lib/types";
import ProcedureCard from "./ProcedureCard";

type Filters = {
  brand: string | null;
  category: string | null;
  tool: string | null;
  language: string | null;
  tag: string | null;
  scope: "all" | "shared" | "private";
};

const EMPTY: Filters = {
  brand: null,
  category: null,
  tool: null,
  language: null,
  tag: null,
  scope: "all",
};

export default function LibraryBrowser() {
  const t = useTranslations("library");
  const tc = useTranslations("common");
  const supabase = useMemo(() => createClient(), []);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // debounce căutare instant
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 220);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase.rpc("search_procedures", {
        q: debouncedQ,
        brand_filter: filters.brand,
        category_filter: filters.category,
        tool_filter: filters.tool,
        language_filter: filters.language,
        tag_filter: filters.tag,
        limit_n: 80,
      });
      if (cancelled) return;
      let rows = (data as SearchResult[]) ?? [];
      if (filters.scope !== "all") rows = rows.filter((r) => r.visibility === filters.scope);
      setResults(rows);
      setLoading(false);
      if (error) console.error(error);
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, filters, supabase]);

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const hasFilters =
    filters.brand || filters.category || filters.tool || filters.language || filters.scope !== "all";

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      {/* Filtre laterale */}
      <aside className="space-y-5">
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
            {t("scope")}
          </h2>
          <div className="flex flex-wrap gap-1">
            {(["all", "shared", "private"] as const).map((s) => (
              <button
                key={s}
                onClick={() => set({ scope: s })}
                className={`rounded px-2 py-1 text-xs transition ${
                  filters.scope === s
                    ? "bg-gold/20 text-gold-light"
                    : "bg-ink-dark text-cream/60 hover:bg-ink-light"
                }`}
              >
                {s === "all" ? tc("all") : t(s)}
              </button>
            ))}
          </div>
        </div>

        <FilterGroup
          label={t("brand")}
          options={[...BRANDS]}
          value={filters.brand}
          onChange={(v) => set({ brand: v })}
        />
        <FilterGroup
          label={t("category")}
          options={[...CATEGORIES]}
          value={filters.category}
          onChange={(v) => set({ category: v })}
        />
        <FilterGroup
          label={t("tool")}
          options={[...TOOLS]}
          value={filters.tool}
          onChange={(v) => set({ tool: v })}
        />
        <FilterGroup
          label={t("language")}
          options={[...CONTENT_LANGUAGES]}
          value={filters.language}
          onChange={(v) => set({ language: v })}
          upper
        />

        {hasFilters && (
          <button
            onClick={() => setFilters(EMPTY)}
            className="text-xs text-gold-light underline-offset-2 hover:underline"
          >
            {t("clearFilters")}
          </button>
        )}
      </aside>

      {/* Rezultate */}
      <div>
        <div className="mb-4">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-xl border border-gold/25 bg-ink-dark/70 px-4 py-3 text-cream placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <p className="mt-2 text-xs text-muted">
            {loading ? "…" : t("resultsCount", { count: results.length })}
          </p>
        </div>

        {results.length === 0 && !loading ? (
          <p className="rounded-xl border border-dashed border-gold/20 p-8 text-center text-sm text-muted">
            {t("noResults")}
          </p>
        ) : (
          <div className="grid gap-3">
            {results.map((r) => (
              <ProcedureCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
  upper = false,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  upper?: boolean;
}) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">{label}</h2>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(value === o ? null : o)}
            className={`rounded px-2 py-1 text-xs transition ${
              value === o
                ? "bg-gold/20 text-gold-light"
                : "bg-ink-dark text-cream/60 hover:bg-ink-light"
            }`}
          >
            {upper ? o.toUpperCase() : o}
          </button>
        ))}
      </div>
    </div>
  );
}
