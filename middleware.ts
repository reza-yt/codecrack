import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/v1/* (gateway routes use their own auth)
     * - api/health (public health check)
     * - v1/* (public alias of api/v1/*, rewritten in next.config.js)
     * - health (public alias of api/health)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/v1|api/health|v1/|health$).*)",
  ],
};
