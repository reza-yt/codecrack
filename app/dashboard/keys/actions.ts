"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/api-keys";

export interface CreateKeyResult {
  ok: boolean;
  full?: string;
  prefix?: string;
  message?: string;
}

const MAX_ACTIVE_KEYS = 10;

export async function createApiKey(formData: FormData): Promise<CreateKeyResult> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (!name) {
    return { ok: false, message: "Please give the key a name." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Not authenticated." };
  }

  // Enforce 10 active keys per user.
  const { count, error: countErr } = await supabase
    .from("api_keys")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("revoked", false);
  if (countErr) {
    console.error("count keys failed:", countErr);
    return { ok: false, message: "Couldn't read existing keys." };
  }
  if ((count ?? 0) >= MAX_ACTIVE_KEYS) {
    return {
      ok: false,
      message: `You already have ${MAX_ACTIVE_KEYS} active keys. Revoke one to create another.`,
    };
  }

  const generated = generateApiKey();
  const { error } = await supabase.from("api_keys").insert({
    user_id: user.id,
    name,
    key_hash: generated.hash,
    key_prefix: generated.prefix,
  });

  if (error) {
    console.error("create key failed:", error);
    return { ok: false, message: "Couldn't create key. Try again." };
  }

  revalidatePath("/dashboard/keys");
  revalidatePath("/dashboard");
  return { ok: true, full: generated.full, prefix: generated.prefix };
}

export async function revokeApiKey(
  keyId: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!keyId || typeof keyId !== "string") {
    return { ok: false, message: "Bad request." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not authenticated." };

  // RLS already enforces user_id = auth.uid(), but we filter for safety.
  const { error } = await supabase
    .from("api_keys")
    .update({ revoked: true })
    .eq("id", keyId)
    .eq("user_id", user.id);

  if (error) {
    console.error("revoke key failed:", error);
    return { ok: false, message: "Couldn't revoke key." };
  }

  revalidatePath("/dashboard/keys");
  revalidatePath("/dashboard");
  return { ok: true };
}
