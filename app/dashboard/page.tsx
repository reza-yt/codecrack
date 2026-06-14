import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Key, Activity } from "lucide-react";
import { CodeBlock } from "@/components/code-block";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch active keys count
  const { count: keysCount } = await supabase
    .from("api_keys")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("revoked", false);

  // Fetch 30-day request count
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();
  const { count: requests30d } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", thirtyDaysAgo);

  const quickstartCode = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.codecrack.dev/v1",
    api_key="API_KEY_ANDA"  # ambil dari /dashboard/keys
)

response = client.chat.completions.create(
    model="codecrack",
    messages=[{"role": "user", "content": "halo"}],
    stream=True,
)`;

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold text-zinc-50 mb-6">Dasbor</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Active keys */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-400">API key aktif</span>
          </div>
          <p className="text-2xl font-mono font-bold text-zinc-50">
            {keysCount ?? 0}
          </p>
          <Link
            href="/dashboard/keys"
            className="text-xs text-emerald-400 hover:underline mt-2 inline-block"
          >
            Kelola →
          </Link>
        </div>

        {/* 30d requests */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-400">Permintaan (30 hari)</span>
          </div>
          <p className="text-2xl font-mono font-bold text-zinc-50">
            {(requests30d ?? 0).toLocaleString("id-ID")}
          </p>
          <Link
            href="/dashboard/usage"
            className="text-xs text-emerald-400 hover:underline mt-2 inline-block"
          >
            Lihat log →
          </Link>
        </div>
      </div>

      {/* Quickstart */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">Panduan singkat</h2>
        <CodeBlock code={quickstartCode} language="python" />
      </div>
    </div>
  );
}
