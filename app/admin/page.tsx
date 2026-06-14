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
      .select("total_tokens, created_at")
      .gte(
        "created_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ),
  ]);

  const totalTokens30d = (usageRows ?? []).reduce(
    (s: number, r: any) => s + Number(r.total_tokens ?? 0),
    0
  );
  const requests30d = usageRows?.length ?? 0;

  const stats = [
    {
      label: "Pengguna",
      value: (userCount ?? 0).toLocaleString("id-ID"),
      icon: Users,
    },
    {
      label: "Key aktif",
      value: `${activeKeyCount ?? 0} / ${keyCount ?? 0}`,
      icon: Key,
    },
    {
      label: "Permintaan (30 hari)",
      value: requests30d.toLocaleString("id-ID"),
      icon: Activity,
    },
    {
      label: "Token (30 hari)",
      value: totalTokens30d.toLocaleString("id-ID"),
      icon: Coins,
    },
  ];

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold text-zinc-50 mb-2">Ringkasan admin</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Panel khusus operator. Semua kueri dijalankan dengan service role, RLS dilewati.
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
    </div>
  );
}
