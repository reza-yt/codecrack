import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Magic-link OTP exchange.
 *
 * Supabase sends the user back here with either:
 *   ?code=...          (PKCE flow)  → exchangeCodeForSession
 *   #access_token=...  (hash flow)  → handled client-side; we just bounce
 *
 * On success, redirect to ?next= (default /dashboard). On failure, redirect
 * to /auth/error.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (!code) {
    // Fallback: maybe Supabase put credentials in the hash. The browser
    // will handle it; just send them onward.
    return NextResponse.redirect(`${origin}${next}`);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("auth callback failed:", error.message);
    return NextResponse.redirect(
      `${origin}/auth/error?reason=${encodeURIComponent(error.message)}`,
    );
  }
  return NextResponse.redirect(`${origin}${next}`);
}

function sanitizeNext(next: string | null): string {
  if (!next) return "/dashboard";
  // Only allow same-origin paths.
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}
