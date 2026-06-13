import { createServiceClient } from "@/lib/supabase/server";
import { Users, Key, Activity, Coins } from "lucide-react";

export default async function AdminOverview() {
  const supabase = createServiceClient();

  // Aggregate stats via service role (admin RLS bypassed)
  const [
    { count: userCount },
    { count: keyCount },
    { count: activeKeyCount },
    { data: usageRows },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("api_keys").select("*", { count: "exact", head: true }),
    supabase
      .from("api_keys")
      .select("*", { count: "exact", head: true })
      .eq("revoked", false),
    supabase
      .from("usage_logs")
      .select("total_tokens, cost_usd, created_at")
      .gte(
        "created_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ),
  ]);

  const totalTokens30d = (usageRows ?? []).reduce(
    (s: number, r: any) => s + Number(r.total_tokens ?? 0),
    0
  );
  const totalCost30d = (usageRows ?? []).reduce(
    (s: number, r: any) => s + Number(r.cost_usd ?? 0),
    0
  );
  const requests30d = usageRows?.length ?? 0;

  const stats = [
    {
      label: "Users",
      value: (userCount ?? 0).toLocaleString(),
      icon: Users,
    },
    {
      label: "Active keys",
      value: `${activeKeyCount ?? 0} / ${keyCount ?? 0}`,
      icon: Key,
    },
    {
      label: "Requests (30d)",
      value: requests30d.toLocaleString(),
      icon: Activity,
    },
    {
      label: "Tokens (30d)",
      value: totalTokens30d.toLocaleString(),
      icon: Coins,
    },
  ];

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold text-zinc-50 mb-2">Admin overview</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Operator-only panel. Service-role queries — RLS bypassed.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-zinc-500" />
              <span className="text-xs text-zinc-400">{s.label}</span>
            </div>
            <p className="text-xl font-mono font-bold text-zinc-50">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">
          30-day revenue (USD-billed only)
        </h2>
        <p className="text-3xl font-mono font-bold text-emerald-400">
          ${totalCost30d.toFixed(4)}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          From dashboard-issued (non-quota) keys. Token-quota keys are billed
          upfront when generated and don't show here.
        </p>
      </div>
    </div>
  );
}
