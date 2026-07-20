"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function FavoriteButton({
  procedureId,
  initial,
}: {
  procedureId: string;
  initial: boolean;
}) {
  const t = useTranslations("procedure");
  const supabase = createClient();
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !fav;
    setFav(next);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      if (next) {
        await supabase.from("favorites").insert({ user_id: user.id, procedure_id: procedureId });
      } else {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("procedure_id", procedureId);
      }
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition ${
        fav
          ? "border-gold/50 bg-gold/15 text-gold-light"
          : "border-gold/25 text-cream/70 hover:bg-ink-light"
      }`}
    >
      <span>{fav ? "★" : "☆"}</span>
      {fav ? t("unfavorite") : t("favorite")}
    </button>
  );
}
