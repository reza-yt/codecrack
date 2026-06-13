import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on everything except static assets, image optimizer, favicon,
  // and the gateway routes (the gateway authenticates by Bearer token,
  // not cookies — middleware is dead weight there).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/v1|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|woff2?)).*)",
  ],
};
