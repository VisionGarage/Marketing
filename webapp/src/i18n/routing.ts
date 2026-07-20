import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // RO implicit; EN și IT din start. Limbă nouă = doar un fișier nou în /messages.
  locales: ["ro", "en", "it"],
  defaultLocale: "ro",
  localePrefix: "as-needed", // RO la rădăcină (fără prefix), /en /it pentru restul
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
