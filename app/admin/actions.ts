"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/api-keys";
import { requireAdmin } from "@/lib/admin";

const MAX_BULK_KEYS = 100;
// Hard cap kuota per key: 1 milyar token. Mencegah salah ketik.
const MAX_TOKEN_QUOTA = 1_000_000_000;

interface BulkGenResult {
  success?: boolean;
  error?: string;
  keys?: Array<{ name: string; fullKey: string; tokenQuota: number }>;
  batchLabel?: string;
}

/**
 * Bulk-generate quota-based API keys.
 *
 * Returns plaintext keys ONCE — admin harus copy/save sekarang juga
 * karena setelah ini hanya hash yang disimpan dan plaintext tidak bisa
 * dipulihkan.
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
    return { error: `Jumlah harus antara 1 sampai ${MAX_BULK_KEYS}.` };
  }
  if (!Number.isFinite(tokenQuota) || tokenQuota < 1) {
    return { error: "Kuota token harus berupa bilangan bulat positif." };
  }
  if (tokenQuota > MAX_TOKEN_QUOTA) {
    return { error: `Kuota token tidak boleh melebihi ${MAX_TOKEN_QUOTA.toLocaleString("id-ID")}.` };
  }
  if (!/^[A-Za-z0-9_\- ]{1,40}$/.test(namePrefix)) {
    return { error: "Awalan nama harus alfanumerik (1 sampai 40 karakter)." };
  }

  const supabase = createServiceClient();

  const generated: Array<{ name: string; fullKey: string; tokenQuota: number }> = [];
  const rows: any[] = [];

  for (let i = 0; i < count; i++) {
    const { fullKey, prefix, hash } = generateApiKey();
    const name = count === 1 ? namePrefix : `${namePrefix}-${i + 1}`;
    generated.push({ name, fullKey, tokenQuota });
    rows.push({
      user_id: null,
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
    return { error: `Gagal menyimpan key: ${error.message}` };
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
