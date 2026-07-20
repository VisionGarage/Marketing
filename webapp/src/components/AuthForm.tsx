"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/routing";

type Mode = "signin" | "signup";

export default function AuthForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split("@")[0] },
            emailRedirectTo: `${siteUrl}/auth/callback`,
          },
        });
        if (error) throw error;
        setMsg(t("checkEmailConfirm"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
        router.refresh();
      }
    } catch (e: any) {
      setErr(e?.message ?? t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  async function handleMagicLink() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${siteUrl}/auth/callback` },
      });
      if (error) throw error;
      setMsg(t("magicLinkSent"));
    } catch (e: any) {
      setErr(e?.message ?? t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handlePassword} className="w-full space-y-3">
      <h1 className="mb-4 text-center font-heading text-2xl text-cream">
        {mode === "signin" ? t("loginTitle") : t("signupTitle")}
      </h1>

      {mode === "signup" && (
        <input
          type="text"
          placeholder={t("displayName")}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-gold/25 bg-ink-dark/60 px-4 py-3 text-cream placeholder:text-muted focus:border-gold focus:outline-none"
        />
      )}
      <input
        type="email"
        required
        autoComplete="email"
        placeholder={t("email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-gold/25 bg-ink-dark/60 px-4 py-3 text-cream placeholder:text-muted focus:border-gold focus:outline-none"
      />
      <input
        type="password"
        required
        minLength={6}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        placeholder={t("password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-gold/25 bg-ink-dark/60 px-4 py-3 text-cream placeholder:text-muted focus:border-gold focus:outline-none"
      />

      {err && <p className="text-sm text-red-300">{err}</p>}
      {msg && <p className="text-sm text-gold-light">{msg}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-gold py-3 font-semibold uppercase tracking-wide text-ink-dark transition hover:bg-gold-light disabled:opacity-50"
      >
        {mode === "signin" ? t("signIn") : t("signUp")}
      </button>

      <div className="flex items-center gap-3 py-1 text-xs text-muted">
        <span className="h-px flex-1 bg-gold/15" />
        {t("orContinueWith")}
        <span className="h-px flex-1 bg-gold/15" />
      </div>

      <button
        type="button"
        onClick={handleMagicLink}
        disabled={busy || !email}
        className="w-full rounded-lg border border-gold/40 py-3 text-sm font-medium text-gold-light transition hover:bg-ink-light disabled:opacity-40"
      >
        {t("magicLink")}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setErr(null);
          setMsg(null);
        }}
        className="block w-full pt-2 text-center text-sm text-cream/70 underline-offset-2 hover:underline"
      >
        {mode === "signin" ? t("noAccount") : t("haveAccount")}
      </button>

      <p className="pt-3 text-center text-xs text-muted">
        {t.rich("termsNotice", {
          terms: (c) => (
            <Link href="/terms" className="underline">
              {c}
            </Link>
          ),
          privacy: (c) => (
            <Link href="/privacy" className="underline">
              {c}
            </Link>
          ),
        })}
      </p>
    </form>
  );
}
