import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Owner-only single-tenant deployment: /dashboard cuma dipakai sebagai
 * gateway redirect ke /admin. Semua kerja sehari-hari ada di /admin.
 */
export default async function DashboardIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  redirect("/admin");
}
