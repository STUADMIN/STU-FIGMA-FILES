import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/supabaseMiddleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Exclude static files and public auth pages from middleware
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth/.*|login|register|reset-password).*)",
  ],
};
