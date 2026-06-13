import { createServiceClient } from "@/lib/supabase/server";
import { formatDate, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const perPage = 100;
  const offset = (page - 1) * perPage;

  const supabase = createServiceClient();
  const { data: logs, count } = await supabase
    .from("usage_logs")
    .select("*, api_keys(key_prefix, name, batch_label, token_quota)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  const totalPages = Math.ceil((count ?? 0) / perPage);

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold text-zinc-50 mb-2">Log pemakaian (semua pengguna)</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Menampilkan seluruh permintaan yang melewati gateway.
      </p>

      {!logs || logs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-zinc-400">Belum ada pemakaian.</p>
        </div>
      ) : (
        <>
          <div className="glass rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-3 py-2 text-zinc-400 font-normal text-xs">
                    Waktu
                  </th>
                  <th className="text-left px-3 py-2 text-zinc-400 font-normal text-xs">
                    Key
                  </th>
                  <th className="text-left px-3 py-2 text-zinc-400 font-normal text-xs">
                    Tipe
                  </th>
                  <th className="text-right px-3 py-2 text-zinc-400 font-normal text-xs">
                    In
                  </th>
                  <th className="text-right px-3 py-2 text-zinc-400 font-normal text-xs">
                    Out
                  </th>
                  <th className="text-right px-3 py-2 text-zinc-400 font-normal text-xs">
                    Total
                  </th>
                  <th className="text-right px-3 py-2 text-zinc-400 font-normal text-xs">
                    Biaya
                  </th>
                  <th className="text-center px-3 py-2 text-zinc-400 font-normal text-xs">
                    Status
                  </th>
                  <th className="text-right px-3 py-2 text-zinc-400 font-normal text-xs">
                    Durasi
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => {
                  const isQuota = log.api_keys?.token_quota !== null;
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-zinc-800/40 last:border-0"
                    >
                      <td className="px-3 py-1.5 text-zinc-400 text-[11px] font-mono">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-3 py-1.5">
                        <code className="text-[11px] font-mono text-zinc-400">
                          {log.api_keys?.key_prefix ?? "—"}
                        </code>
                        {log.api_keys?.name && (
                          <span className="text-[10px] text-zinc-600 ml-1">
                            ({log.api_keys.name})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        <span
                          className={`text-[10px] px-1 py-0.5 rounded font-mono ${
                            isQuota
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-zinc-800/50 text-zinc-400"
                          }`}
                        >
                          {isQuota ? "kuota" : "kredit"}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right text-zinc-300 font-mono text-xs">
                        {log.prompt_tokens.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-1.5 text-right text-zinc-300 font-mono text-xs">
                        {log.completion_tokens.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-1.5 text-right text-zinc-50 font-mono text-xs">
                        {log.total_tokens.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-1.5 text-right text-emerald-400 font-mono text-xs">
                        {formatCurrency(Number(log.cost_usd))}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <span
                          className={`inline-block px-1 py-0.5 rounded text-[10px] font-mono ${
                            log.status_code === 200
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {log.status_code}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right text-zinc-500 font-mono text-[11px]">
                        {log.duration_ms ? `${log.duration_ms}ms` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {page > 1 && (
                <a
                  href={`/admin/usage?page=${page - 1}`}
                  className="text-xs text-zinc-400 hover:text-zinc-50 px-3 py-1.5 rounded-lg hover:bg-zinc-800/50"
                >
                  ← Sebelumnya
                </a>
              )}
              <span className="text-xs text-zinc-500 font-mono">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/admin/usage?page=${page + 1}`}
                  className="text-xs text-zinc-400 hover:text-zinc-50 px-3 py-1.5 rounded-lg hover:bg-zinc-800/50"
                >
                  Berikutnya →
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
