import Link from "next/link";
import {
  Activity,
  ArrowRight,
  KeyRound,
  Wallet,
} from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { CodeBlock } from "@/components/code-block";
import { cn, formatInt, formatUsd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Layout already guards; non-null assertion is safe.
  const userId = user!.id;

  // Run reads in parallel.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [creditsRes, keysRes, usageRes] = await Promise.all([
    supabase
      .from("credits")
      .select("balance_usd")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("api_keys")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("revoked", false),
    supabase
      .from("usage_logs")
      .select("cost_usd, total_tokens")
      .eq("user_id", userId)
      .gte("created_at", since),
  ]);

  const balance = Number(creditsRes.data?.balance_usd ?? 0);
  const activeKeys = keysRes.count ?? 0;
  const usage30 = usageRes.data ?? [];
  const totalCost30 = usage30.reduce(
    (acc, r) => acc + Number(r.cost_usd ?? 0),
    0,
  );
  const totalTokens30 = usage30.reduce(
    (acc, r) => acc + Number(r.total_tokens ?? 0),
    0,
  );

  const lowBalance = balance < 1;

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label="Credit balance"
          value={`$${formatUsd(balance)}`}
          accent={lowBalance ? "amber" : "emerald"}
          href="/dashboard/billing"
          hrefLabel="Manage"
        />
        <StatCard
          icon={<KeyRound className="h-4 w-4" />}
          label="Active keys"
          value={String(activeKeys)}
          href="/dashboard/keys"
          hrefLabel="Manage"
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="30-day spend"
          value={`$${formatUsd(totalCost30)}`}
          subtitle={`${formatInt(totalTokens30)} tokens`}
          href="/dashboard/usage"
          hrefLabel="View"
        />
      </div>

      <div className="mt-12">
        <h2 className="text-base font-semibold tracking-tight text-zinc-100">
          Quickstart
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Got a key? Drop your{" "}
          <code className="font-mono text-emerald-300">base_url</code> and go.
        </p>
        <div className="mt-4">
          <CodeBlock
            caption="python · openai"
            code={`from openai import OpenAI

client = OpenAI(
    base_url="https://api.codecrack.dev/v1",
    api_key="cc_live_•••",
)

resp = client.chat.completions.create(
    model="hermes-agent",
    messages=[{"role": "user", "content": "audit lib auth gua"}],
)
print(resp.choices[0].message.content)`}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  accent = "emerald",
  href,
  hrefLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  accent?: "emerald" | "amber";
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-5">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border",
            accent === "amber"
              ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
              : "border-emerald-500/20 bg-emerald-400/10 text-emerald-400",
          )}
        >
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-6 font-mono text-3xl font-semibold tracking-tight",
          accent === "amber" ? "text-amber-200" : "text-zinc-50",
        )}
      >
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 font-mono text-xs text-zinc-500">{subtitle}</p>
      )}
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-100"
      >
        {hrefLabel}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
