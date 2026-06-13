"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function updateDisplayName(
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const name = String(formData.get("display_name") ?? "").trim().slice(0, 80);
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not authenticated." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name || null })
    .eq("id", user.id);

  if (error) {
    console.error("update profile failed:", error);
    return { ok: false, message: "Couldn't save." };
  }
  revalidatePath("/dashboard/settings");
  return { ok: true, message: "Saved." };
}
