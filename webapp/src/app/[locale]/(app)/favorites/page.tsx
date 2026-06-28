import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { toResult } from "@/lib/map";
import type { Procedure } from "@/lib/types";
import ProcedureCard from "@/components/ProcedureCard";

export default async function FavoritesPage() {
  const t = await getTranslations("nav");
  const tl = await getTranslations("library");
  const supabase = await createClient();

  const { data } = await supabase
    .from("favorites")
    .select("created_at, procedures(*)")
    .order("created_at", { ascending: false });

  const rows = ((data as any[]) ?? [])
    .map((r) => r.procedures as Procedure)
    .filter(Boolean);

  return (
    <div>
      <h1 className="mb-5 font-heading text-3xl text-cream">{t("favorites")}</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{tl("noResults")}</p>
      ) : (
        <div className="grid gap-3">
          {rows.map((p) => (
            <ProcedureCard key={p.id} r={toResult(p, true)} />
          ))}
        </div>
      )}
    </div>
  );
}
