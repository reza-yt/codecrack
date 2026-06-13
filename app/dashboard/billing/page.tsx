import { Wallet } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { cn, formatUsd } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface DailyAgg {
  date: string;
  cost: number;
  tokens: number;
  requests: number;
}

interface UsageRow {
  created_at: string;
  cost_usd: number;
  total_tokens: number;
}

export default async function BillingPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [creditsRes, usageRes] = await Promise.all([
    supabase
      .from("credits")
      .select("balance_usd, updated_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("usage_logs")
      .select("created_at, cost_usd, total_tokens")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false }),
  ]);

  const balance = Number(creditsRes.data?.balance_usd ?? 0);
  const lowBalance = balance < 1;
  const usage = (usageRes.data ?? []) as UsageRow[];

  // Aggregate by UTC date.
  const byDay = new Map<string, DailyAgg>();
  for (const row of usage) {
    const day = new Date(row.created_at).toISOString().slice(0, 10);
    const existing = byDay.get(day) ?? {
      date: day,
      cost: 0,
      tokens: 0,
      requests: 0,
    };
    existing.cost += Number(row.cost_usd ?? 0);
    existing.tokens += Number(row.total_tokens ?? 0);
    existing.requests += 1;
    byDay.set(day, existing);
  }
  const days = Array.from(byDay.values()).sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );
  const totalSpend30 = days.reduce((acc, d) => acc + d.cost, 0);
  const peak = Math.max(0.0001, ...days.map((d) => d.cost));

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          Billing
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Balance &amp; transactions
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div
          className={cn(
            "rounded-xl border bg-zinc-900/30 p-8",
            lowBalance
              ? "border-amber-400/40 ring-1 ring-amber-400/20"
              : "border-zinc-800/70",
          )}
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
            <Wallet className="h-3.5 w-3.5" />
            Current balance
          </div>
          <p
            className={cn(
              "mt-6 font-mono text-6xl font-semibold tracking-tight",
              lowBalance ? "text-amber-200" : "text-zinc-50",
            )}
          >
            ${formatUsd(balance)}
          </p>
          <p className="mt-3 font-mono text-xs text-zinc-500">
            30-day spend ${formatUsd(totalSpend30)}
          </p>
          {lowBalance && (
            <p className="mt-4 text-sm text-amber-200">
              Balance is low. Top up to avoid hitting{" "}
              <code className="font-mono">402 insufficient_credit</code>.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-8">
          <h2 className="text-base font-semibold text-zinc-100">
            Top up · manual
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            We don&apos;t take card payments yet. Email{" "}
            <a
              href="mailto:contact@codecrack.dev"
              className="text-emerald-300 underline-offset-2 hover:underline"
            >
              contact@codecrack.dev
            </a>{" "}
            with proof of crypto / bank transfer (USDT, USDC, IDR transfer all
            fine), and we&apos;ll credit your account within 24h.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
              Minimum top-up: <span className="font-mono text-zinc-200">$10</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
              Include your account email in the message
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
              Balance refreshes here within seconds of crediting
            </li>
          </ul>
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-base font-semibold text-zinc-100">
            Daily usage · last 30 days
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            {days.length} day{days.length === 1 ? "" : "s"} with activity
          </p>
        </div>

        {days.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-12 text-center text-sm text-zinc-400">
            No usage in the last 30 days yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/50 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Spend</th>
                  <th className="px-4 py-3 font-medium text-right">Requests</th>
                  <th className="px-4 py-3 font-medium text-right">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {days.map((d) => (
                  <tr key={d.date} className="text-zinc-200">
                    <td className="px-4 py-3 font-mono text-xs">{d.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-20 font-mono text-xs">
                          ${formatUsd(d.cost)}
                        </span>
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-zinc-800/60">
                          <div
                            className="h-full bg-emerald-400/70"
                            style={{
                              width: `${Math.min(
                                100,
                                (d.cost / peak) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-zinc-300">
                      {d.requests}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-zinc-400">
                      {d.tokens.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
