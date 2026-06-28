"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/routing";

export default function DeleteProcedureButton({ procedureId }: { procedureId: string }) {
  const t = useTranslations("procedure");
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm(t("deleteConfirm"))) return;
    setBusy(true);
    const { error } = await supabase.from("procedures").delete().eq("id", procedureId);
    if (!error) {
      router.replace("/");
      router.refresh();
    } else {
      setBusy(false);
      alert(error.message);
    }
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
    >
      🗑 {t("delete")}
    </button>
  );
}
