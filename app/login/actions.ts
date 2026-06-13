"use server";

import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMagicLink(
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const h = await headers();
  const ip = getClientIp(h);
  const rl = rateLimit(`login:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return { ok: false, message: "Too many attempts. Try again later." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = String(formData.get("next") ?? "/dashboard");
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  // Build absolute callback URL from the incoming request.
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "codecrack.dev";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const safeNext = next.startsWith("/") ? next : "/dashboard";
  const redirectTo = `${proto}://${host}/auth/callback?next=${encodeURIComponent(
    safeNext,
  )}`;

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });

  if (error) {
    console.error("magic link send failed:", error);
    return {
      ok: false,
      message: "Couldn't send the link. Try again in a minute.",
    };
  }
  return { ok: true, message: "Magic link sent." };
}
