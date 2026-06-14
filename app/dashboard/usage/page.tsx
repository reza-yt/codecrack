import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default async function UsagePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const perPage = 50;
  const offset = (page - 1) * perPage;

  const { data: logs, count } = await supabase
    .from("usage_logs")
    .select("*, api_keys(key_prefix)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  const totalPages = Math.ceil((count ?? 0) / perPage);

  // CSV export data URL
  const csvHeaders = "Waktu,Key,Token Input,Token Output,Total Token,Status,Durasi ms\n";
  const csvRows = (logs ?? [])
    .map(
      (log: any) =>
        `${log.created_at},${log.api_keys?.key_prefix ?? "—"},${log.prompt_tokens},${log.completion_tokens},${log.total_tokens},${log.status_code},${log.duration_ms ?? ""}`
    )
    .join("\n");
  const csvContent = csvHeaders + csvRows;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Log pemakaian</h1>
        {(logs?.length ?? 0) > 0 && (
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`}
            download="codecrack-pemakaian.csv"
            className="text-xs text-emerald-400 hover:underline"
          >
            Ekspor CSV
          </a>
        )}
      </div>

      {!logs || logs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-zinc-400">Belum ada log pemakaian</p>
          <p className="text-xs text-zinc-500 mt-1">
            Lakukan permintaan API pertama Anda untuk melihat aktivitas di sini.
          </p>
        </div>
      ) : (
        <>
          <div className="glass rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-4 py-3 text-zinc-400 font-normal">Waktu</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-normal">Key</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-normal">In</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-normal">Out</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-normal">Total</th>
                  <th className="text-center px-4 py-3 text-zinc-400 font-normal">Status</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-normal">Durasi</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b border-zinc-800/40 last:border-0">
                    <td className="px-4 py-2 text-zinc-300 text-xs font-mono">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-2">
                      <code className="text-xs font-mono text-zinc-500">
                        {log.api_keys?.key_prefix ?? "—"}...
                      </code>
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-300 font-mono text-xs">
                      {log.prompt_tokens.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-300 font-mono text-xs">
                      {log.completion_tokens.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-300 font-mono text-xs">
                      {log.total_tokens.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono ${
                          log.status_code === 200
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {log.status_code}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-500 font-mono text-xs">
                      {log.duration_ms ? `${log.duration_ms}ms` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {page > 1 && (
                <a
                  href={`/dashboard/usage?page=${page - 1}`}
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
                  href={`/dashboard/usage?page=${page + 1}`}
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
