import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/security/guard";
import { toResult } from "@/lib/map";
import type { Procedure } from "@/lib/types";
import ProcedureCard from "@/components/ProcedureCard";

export default async function RecentEditsPage() {
  const t = await getTranslations("nav");
  const tl = await getTranslations("library");
  const ctx = await getAuthContext();
  const supabase = await createClient();

  const { data } = await supabase
    .from("procedures")
    .select("*")
    .eq("owner_id", ctx!.userId)
    .order("updated_at", { ascending: false })
    .limit(40);

  const rows = (data as Procedure[]) ?? [];

  return (
    <div>
      <h1 className="mb-5 font-heading text-3xl text-cream">{t("recentEdits")}</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{tl("noResults")}</p>
      ) : (
        <div className="grid gap-3">
          {rows.map((p) => (
            <ProcedureCard key={p.id} r={toResult(p, false)} />
          ))}
        </div>
      )}
    </div>
  );
}
