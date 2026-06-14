import { createServiceClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { UserActions } from "./user-actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  approved: "disetujui",
  suspended: "ditangguhkan",
  waitlist: "daftar tunggu",
};

const ROLE_LABEL: Record<string, string> = {
  admin: "admin",
  user: "pengguna",
};

export default async function AdminUsersPage() {
  const supabase = createServiceClient();

  const [{ data: profiles }, { data: credits }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("credits").select("user_id, balance_usd"),
  ]);

  const balanceMap = new Map<string, number>();
  (credits ?? []).forEach((c: any) => balanceMap.set(c.user_id, Number(c.balance_usd)));

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold text-zinc-50 mb-2">Pengguna</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Total {profiles?.length ?? 0} pengguna. Anda dapat menjadikan admin,
        menangguhkan akun, atau menyesuaikan saldo.
      </p>

      <div className="glass rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-zinc-800/60">
              <th className="text-left px-4 py-3 text-zinc-400 font-normal">Email</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-normal">Peran</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-normal">Status</th>
              <th className="text-right px-4 py-3 text-zinc-400 font-normal">Saldo</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-normal">Bergabung</th>
              <th className="text-right px-4 py-3 text-zinc-400 font-normal">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p: any) => (
              <tr key={p.id} className="border-b border-zinc-800/40 last:border-0">
                <td className="px-4 py-2 text-zinc-300 font-mono text-xs">
                  {p.email}
                  {p.display_name && (
                    <span className="text-zinc-500 ml-2">({p.display_name})</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                      p.role === "admin"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-zinc-800/50 text-zinc-400"
                    }`}
                  >
                    {ROLE_LABEL[p.role] ?? p.role}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                      p.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : p.status === "suspended"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-zinc-800/50 text-zinc-400"
                    }`}
                  >
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-emerald-400 font-mono text-xs">
                  ${(balanceMap.get(p.id) ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-zinc-500 text-xs">
                  {formatDate(p.created_at)}
                </td>
                <td className="px-4 py-2 text-right">
                  <UserActions
                    userId={p.id}
                    email={p.email}
                    role={p.role}
                    status={p.status}
                    balance={balanceMap.get(p.id) ?? 0}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
