"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";
import SignOutButton from "./SignOutButton";

const ICONS: Record<string, string> = {
  library: "▦",
  newProcedure: "＋",
  favorites: "★",
  recent: "🕑",
  recentEdits: "✎",
  processing: "⚙",
  admin: "⚑",
  settings: "⚙",
};

export default function Sidebar({ isAdmin, watermarkTag }: { isAdmin: boolean; watermarkTag: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links: { href: string; key: string }[] = [
    { href: "/", key: "library" },
    { href: "/new", key: "newProcedure" },
    { href: "/favorites", key: "favorites" },
    { href: "/recent", key: "recent" },
    { href: "/recent-edits", key: "recentEdits" },
    { href: "/processing", key: "processing" },
    { href: "/settings", key: "settings" },
  ];
  if (isAdmin) links.splice(6, 0, { href: "/admin", key: "admin" });

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Bară mobilă sus */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gold/15 bg-ink-dark/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icons/icon-192.png" alt="VG" width={28} height={28} className="rounded" />
          <span className="font-heading text-lg text-cream">VisionGarage</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className="rounded border border-gold/30 px-3 py-1 text-cream"
        >
          ☰
        </button>
      </div>

      <aside
        className={`${
          open ? "block" : "hidden"
        } border-b border-gold/15 bg-ink px-3 py-4 md:sticky md:top-0 md:block md:h-dvh md:w-60 md:shrink-0 md:border-b-0 md:border-r`}
      >
        {/* Logo header (desktop) */}
        <Link href="/" className="mb-6 hidden items-center gap-3 px-2 md:flex">
          <Image src="/icons/icon-192.png" alt="VG" width={36} height={36} className="rounded-lg" />
          <span className="font-heading text-xl leading-tight text-cream">
            Vision<span className="text-gold">Garage</span>
          </span>
        </Link>

        <nav className="space-y-1" onClick={() => setOpen(false)}>
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive(l.href)
                  ? "bg-gold/15 text-gold-light"
                  : "text-cream/75 hover:bg-ink-light hover:text-cream"
              }`}
            >
              <span className="w-4 text-center opacity-70">{ICONS[l.key]}</span>
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="mt-6 space-y-3 border-t border-gold/15 pt-4">
          <LanguageSwitcher />
          <SignOutButton />
          <p className="px-1 text-[10px] uppercase tracking-widest text-muted/60">
            VG·{watermarkTag}
          </p>
        </div>
      </aside>
    </>
  );
}
