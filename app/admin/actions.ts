"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/api-keys";
import { requireAdmin } from "@/lib/admin";

const MAX_BULK_KEYS = 100;
const MAX_TOKEN_QUOTA = 1_000_000_000; // 1 billion tokens hard cap per key

interface BulkGenResult {
  success?: boolean;
  error?: string;
  keys?: Array<{ name: string; fullKey: string; tokenQuota: number }>;
  batchLabel?: string;
}

/**
 * Bulk-generate quota-based API keys.
 *
 * Returns plaintext keys ONCE — the admin must copy/save them right away,
 * since key_hash is stored after this and the plaintext is unrecoverable.
 */
export async function bulkGenerateKeys(formData: FormData): Promise<BulkGenResult> {
  const { user } = await requireAdmin();

  const count = parseInt(String(formData.get("count") ?? "1"), 10);
  const tokenQuota = parseInt(String(formData.get("tokenQuota") ?? "0"), 10);
  const namePrefix = String(formData.get("namePrefix") ?? "key").trim();
  const batchLabel =
    String(formData.get("batchLabel") ?? "").trim() ||
    `batch-${new Date().toISOString().split("T")[0]}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

  if (!Number.isFinite(count) || count < 1 || count > MAX_BULK_KEYS) {
    return { error: `Count must be between 1 and ${MAX_BULK_KEYS}.` };
  }
  if (!Number.isFinite(tokenQuota) || tokenQuota < 1) {
    return { error: "Token quota must be a positive integer." };
  }
  if (tokenQuota > MAX_TOKEN_QUOTA) {
    return { error: `Token quota cannot exceed ${MAX_TOKEN_QUOTA.toLocaleString()}.` };
  }
  if (!/^[A-Za-z0-9_\- ]{1,40}$/.test(namePrefix)) {
    return { error: "Name prefix must be alphanumeric (1-40 chars)." };
  }

  const supabase = createServiceClient();

  const generated: Array<{ name: string; fullKey: string; tokenQuota: number }> = [];
  const rows: any[] = [];

  for (let i = 0; i < count; i++) {
    const { fullKey, prefix, hash } = generateApiKey();
    const name = count === 1 ? namePrefix : `${namePrefix}-${i + 1}`;
    generated.push({ name, fullKey, tokenQuota });
    rows.push({
      user_id: null, // floating admin-issued key
      name,
      key_hash: hash,
      key_prefix: prefix,
      token_quota: tokenQuota,
      tokens_used: 0,
      batch_label: batchLabel,
      issued_by: user.id,
    });
  }

  const { error } = await supabase.from("api_keys").insert(rows);

  if (error) {
    return { error: `Failed to insert keys: ${error.message}` };
  }

  revalidatePath("/admin/keys");
  return { success: true, keys: generated, batchLabel };
}

export async function revokeAdminKey(keyId: string): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("api_keys")
    .update({ revoked: true })
    .eq("id", keyId);
  if (error) return { error: error.message };
  revalidatePath("/admin/keys");
  return { success: true };
}

export async function setUserRole(
  userId: string,
  role: "user" | "admin"
): Promise<{ error?: string; success?: boolean }> {
  const { user } = await requireAdmin();

  if (userId === user.id && role !== "admin") {
    return { error: "Cannot demote yourself. Have another admin do it." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function setUserStatus(
  userId: string,
  status: "approved" | "suspended" | "waitlist"
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function adjustCredits(
  userId: string,
  newBalance: number
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  if (!Number.isFinite(newBalance) || newBalance < 0) {
    return { error: "Balance must be >= 0." };
  }
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("credits")
    .upsert({
      user_id: userId,
      balance_usd: newBalance,
      updated_at: new Date().toISOString(),
    });
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}
