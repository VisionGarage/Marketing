import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1) rutare i18n (alege locale, eventual redirect)
  const response = intlMiddleware(request);

  // 2) reîmprospătează sesiunea Supabase și propagă cookie-urile pe răspunsul de mai sus
  await updateSession(request, response as unknown as NextResponse);

  return response;
}

export const config = {
  // exclude API, fișiere statice, sw, fișiere cu extensie
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
