import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get balance
  const { data: credits } = await supabase
    .from("credits")
    .select("balance_usd")
    .eq("user_id", user.id)
    .single();

  // Get daily aggregated usage (last 30 days)
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: usageLogs } = await supabase
    .from("usage_logs")
    .select("cost_usd, created_at")
    .eq("user_id", user.id)
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: false });

  // Aggregate by day
  const dailySpend: Record<string, number> = {};
  (usageLogs ?? []).forEach((log: any) => {
    const day = new Date(log.created_at).toISOString().split("T")[0];
    dailySpend[day] = (dailySpend[day] || 0) + Number(log.cost_usd);
  });

  const dailyEntries = Object.entries(dailySpend)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 30);

  const balance = Number(credits?.balance_usd ?? 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-50 mb-6">Billing</h1>

      {/* Balance card */}
      <div className="glass rounded-xl p-8 mb-8 text-center">
        <p className="text-sm text-zinc-400 mb-2">Current Balance</p>
        <p
          className={`text-4xl font-mono font-bold ${
            balance < 1 ? "text-amber-400" : "text-zinc-50"
          }`}
        >
          ${balance.toFixed(2)}
        </p>
      </div>

      {/* Top-up instructions */}
      <div className="glass rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">Top-up</h2>
        <p className="text-sm text-zinc-400 mb-3">
          For MVP, top-ups are processed manually. Minimum top-up: $10.
        </p>
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <p className="text-sm text-zinc-300 mb-2">
            Email{" "}
            <code className="font-mono text-emerald-400">contact@codecrack.dev</code>{" "}
            with:
          </p>
          <ol className="text-sm text-zinc-400 list-decimal list-inside space-y-1">
            <li>Your registered email</li>
            <li>Transfer/crypto proof (screenshot or tx hash)</li>
            <li>Amount in USD</li>
          </ol>
          <p className="text-xs text-zinc-500 mt-3">
            We&apos;ll credit your account within 24 hours.
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">
          Daily Spend (30d)
        </h2>
        {dailyEntries.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-zinc-400 text-sm">No transactions yet.</p>
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-4 py-3 text-zinc-400 font-normal">Date</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-normal">Spend</th>
                </tr>
              </thead>
              <tbody>
                {dailyEntries.map(([day, amount]) => (
                  <tr key={day} className="border-b border-zinc-800/40 last:border-0">
                    <td className="px-4 py-2 text-zinc-300 font-mono text-xs">{day}</td>
                    <td className="px-4 py-2 text-right text-emerald-400 font-mono text-xs">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
