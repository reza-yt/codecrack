import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail, ADMIN_EMAIL } from "@/lib/owner";

/**
 * Admin gate. Use at the top of every server component / server action
 * that should only be accessible to admins.
 *
 *   const { user, supabase } = await requireAdmin();
 *
 * Self-healing: kalau user lo email-nya owner (verified by Supabase auth)
 * tapi profile-nya gak ada / role-nya bukan admin (misal migration 003
 * belum jalan, atau profile kebuat sebelum migration), kita upsert role
 * via service role di tempat. Ini menghilangkan redirect loop antara
 * /admin → /dashboard → /admin yang terjadi kalau database state
 * gak konsisten dengan ekspektasi kode.
 *
 * Untuk email selain owner: redirect ke /auth/error (defense-in-depth
 * selain trigger handle_new_user).
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Single-tenant lock: bukan email owner, tolak.
  if (!isAdminEmail(user.email)) {
    redirect(
      `/auth/error?error=forbidden&error_description=${encodeURIComponent(
        "Akses ditolak. Hanya pemilik yang dapat masuk.",
      )}`,
    );
  }

  // Owner confirmed. Pastikan profile.role = 'admin'.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    return { user, supabase };
  }

  // Self-heal via service role (bypass RLS).
  // Idempotent — aman kalau dipanggil berkali-kali.
  const admin = createServiceClient();
  await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? ADMIN_EMAIL,
        role: "admin",
        status: "approved",
        approved_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  // Pastikan credits row juga ada (gak harus ada balance, cuma row).
  await admin
    .from("credits")
    .upsert({ user_id: user.id, balance_usd: 0 }, { onConflict: "user_id" });

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
  // Single-tenant: hanya owner yang admin. Skip query DB.
  return isAdminEmail(user.email);
}
