import { createServiceClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";
import { BulkGenerateForm } from "./bulk-generate-form";
import { RevokeKeyButton } from "./revoke-key-button";

export const dynamic = "force-dynamic";

export default async function AdminKeysPage() {
  const supabase = createServiceClient();

  const { data: keys } = await supabase
    .from("api_keys")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const allKeys = keys ?? [];

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold text-zinc-50 mb-2">API key</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Buat key berbasis kuota untuk dijual kembali. Setiap key memiliki
        batas pemakaian token tersendiri.
      </p>

      {/* Bulk generate */}
      <div className="glass rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-zinc-50 mb-4">
          Buat key massal
        </h2>
        <BulkGenerateForm />
      </div>

      {/* Existing keys */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">
          Daftar key{" "}
          <span className="text-sm font-normal text-zinc-500">
            ({allKeys.length})
          </span>
        </h2>
        {allKeys.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <p className="text-sm text-zinc-400">Belum ada key yang dibuat.</p>
          </div>
        ) : (
          <div className="glass rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-4 py-3 text-zinc-400 font-normal">
                    Nama
                  </th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-normal">
                    Awalan
                  </th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-normal">
                    Batch
                  </th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-normal">
                    Terpakai / Kuota
                  </th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-normal">
                    Terakhir digunakan
                  </th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-normal">
                    Dibuat
                  </th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-normal">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {allKeys.map((k: any) => {
                  const used = Number(k.tokens_used);
                  const quota = Number(k.token_quota ?? 0);
                  const pct = quota > 0 ? Math.min(100, (used / quota) * 100) : 0;
                  const exhausted = quota > 0 && used >= quota;
                  return (
                    <tr
                      key={k.id}
                      className={`border-b border-zinc-800/40 last:border-0 ${
                        k.revoked ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-2 text-zinc-300">{k.name}</td>
                      <td className="px-4 py-2">
                        <code className="font-mono text-xs text-zinc-500">
                          {k.key_prefix}...
                        </code>
                      </td>
                      <td className="px-4 py-2 text-xs text-zinc-500 font-mono">
                        {k.batch_label ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {quota > 0 ? (
                          <>
                            <div className="text-xs font-mono">
                              <span
                                className={
                                  exhausted
                                    ? "text-red-400"
                                    : pct > 80
                                    ? "text-amber-400"
                                    : "text-zinc-300"
                                }
                              >
                                {used.toLocaleString("id-ID")}
                              </span>
                              <span className="text-zinc-600"> / </span>
                              <span className="text-zinc-400">
                                {quota.toLocaleString("id-ID")}
                              </span>
                            </div>
                            <div className="w-24 h-1 bg-zinc-800 rounded-full mt-1 ml-auto overflow-hidden">
                              <div
                                className={`h-full ${
                                  exhausted
                                    ? "bg-red-400"
                                    : pct > 80
                                    ? "bg-amber-400"
                                    : "bg-emerald-400"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-500 font-mono">
                            {used.toLocaleString("id-ID")} / ∞
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs text-zinc-500">
                        {k.last_used_at
                          ? formatRelativeTime(k.last_used_at)
                          : "Belum pernah"}
                      </td>
                      <td className="px-4 py-2 text-xs text-zinc-500">
                        {formatRelativeTime(k.created_at)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {k.revoked ? (
                          <span className="text-xs text-zinc-600">dicabut</span>
                        ) : (
                          <RevokeKeyButton keyId={k.id} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
