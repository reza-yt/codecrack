import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin gate. Use at the top of every server component / server action
 * that should only be accessible to admins.
 *
 *   const { user, supabase } = await requireAdmin();
 *
 * Returns the authenticated user and a session-bound supabase client.
 * Redirects to /login if unauthenticated, /dashboard if not admin.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { user, supabase };
}

/**
 * Same as requireAdmin but doesn't redirect — returns null if not admin.
 * Use for conditional UI (e.g., showing an "Admin" link in the navbar).
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin";
}
