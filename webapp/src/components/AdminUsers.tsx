"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Profile } from "@/lib/types";

export default function AdminUsers({ initial }: { initial: Profile[] }) {
  const t = useTranslations("admin");
  const ts = useTranslations("subscription");
  const [users, setUsers] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  async function setStatus(userId: string, status: "active" | "expired" | "trial") {
    setBusy(userId);
    const expiresAt =
      status === "active" ? new Date(Date.now() + 365 * 86400000).toISOString() : null;
    const res = await fetch("/api/admin/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status, expiresAt }),
    });
    if (res.ok) {
      setUsers((u) =>
        u.map((x) =>
          x.id === userId
            ? { ...x, subscription_status: status, subscription_expires_at: expiresAt }
            : x
        )
      );
    }
    setBusy(null);
  }

  async function seed() {
    setSeedMsg("…");
    const res = await fetch("/api/admin/seed", { method: "POST" });
    const j = await res.json().catch(() => ({}));
    setSeedMsg(res.ok ? j.message ?? "OK" : j.error ?? "error");
  }

  return (
    <div className="space-y-6">
      <button
        onClick={seed}
        className="rounded-lg border border-gold/30 px-4 py-2 text-sm text-gold-light hover:bg-ink-light"
      >
        🌱 {t("seedLibrary")}
      </button>
      {seedMsg && <p className="text-sm text-gold-light">{seedMsg}</p>}

      <div className="overflow-x-auto rounded-xl border border-gold/15">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-dark/60 text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">{t("role")}</th>
              <th className="px-3 py-2">{t("status")}</th>
              <th className="px-3 py-2">{t("expires")}</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gold/10">
                <td className="px-3 py-2 text-cream">{u.email}</td>
                <td className="px-3 py-2 text-cream/70">{u.role}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-gold/15 px-2 py-0.5 text-xs text-gold-light">
                    {ts(u.subscription_status)}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted">
                  {u.subscription_expires_at
                    ? new Date(u.subscription_expires_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button
                      disabled={busy === u.id}
                      onClick={() => setStatus(u.id, "active")}
                      className="rounded border border-green-400/30 px-2 py-1 text-xs text-green-300 hover:bg-green-500/10"
                    >
                      {t("activate")}
                    </button>
                    <button
                      disabled={busy === u.id}
                      onClick={() => setStatus(u.id, "expired")}
                      className="rounded border border-red-400/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      {t("revoke")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
