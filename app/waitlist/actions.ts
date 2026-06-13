"use server";

import { headers } from "next/headers";
import { createServiceSupabase } from "@/lib/supabase/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export interface WaitlistResult {
  ok: boolean;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(formData: FormData): Promise<WaitlistResult> {
  // 1. Rate limit per IP — 5 inserts per hour.
  const h = await headers();
  const ip = getClientIp(h);
  const rl = rateLimit(`waitlist:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return {
      ok: false,
      message: "Too many requests. Try again in an hour.",
    };
  }

  // 2. Validate input.
  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();
  const useCaseRaw = String(formData.get("use_case") ?? "").trim();
  const sourceRaw = String(formData.get("source") ?? "").trim();

  if (!EMAIL_RE.test(emailRaw)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (emailRaw.length > 254) {
    return { ok: false, message: "Email is too long." };
  }
  const useCase = useCaseRaw.slice(0, 500) || null;
  const source = sourceRaw.slice(0, 100) || null;

  // 3. Insert (service role bypasses RLS but the policy already allows
  //    anon insert — service role makes it consistent with how the
  //    gateway writes).
  const supa = createServiceSupabase();
  const { error } = await supa
    .from("waitlist")
    .insert({ email: emailRaw, use_case: useCase, source });

  if (error) {
    // Unique violation = email already on the list. Treat as success
    // so we don't leak who's signed up.
    if (error.code === "23505") {
      return {
        ok: true,
        message: "You're on the list. We'll be in touch.",
      };
    }
    console.error("waitlist insert failed:", error);
    return {
      ok: false,
      message: "Something went wrong. Try again in a minute.",
    };
  }

  return { ok: true, message: "You're on the list. We'll be in touch." };
}
