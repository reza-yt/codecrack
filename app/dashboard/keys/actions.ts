"use server";

import { createClient } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/api-keys";
import { revalidatePath } from "next/cache";

export async function createApiKey(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check active key limit (10 max)
  const { count } = await supabase
    .from("api_keys")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("revoked", false);

  if ((count ?? 0) >= 10) {
    return { error: "Maximum 10 active keys. Revoke one to create another." };
  }

  const { fullKey, prefix, hash } = generateApiKey();

  const { error } = await supabase.from("api_keys").insert({
    user_id: user.id,
    name: name.trim() || "Untitled key",
    key_hash: hash,
    key_prefix: prefix,
  });

  if (error) {
    return { error: "Failed to create key. Try again." };
  }

  revalidatePath("/dashboard/keys");
  return { fullKey, prefix };
}

export async function revokeApiKey(keyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("api_keys")
    .update({ revoked: true })
    .eq("id", keyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Failed to revoke key." };
  }

  revalidatePath("/dashboard/keys");
  return { success: true };
}
