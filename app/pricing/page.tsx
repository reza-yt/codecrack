import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Pay-as-you-go pricing for the codecrack.dev gateway. No subscription, no minimums beyond a $10 top-up.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Pay-as-you-go. No subscription.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Two prices to remember: input dan output. Top up sekali, pakai
            sampai habis.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          <PriceTile
            label="Input tokens"
            unit="per 1M tokens"
            price="$3.00"
            note="Everything you send: messages, system prompt, tool results."
          />
          <PriceTile
            label="Output tokens"
            unit="per 1M tokens"
            price="$15.00"
            note="Tokens the model emits, including tool-call arguments."
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-6 md:grid-cols-3">
          <Detail label="Minimum top-up" value="$10" />
          <Detail label="Billing cadence" value="per request" />
          <Detail label="Refunds" value="not for usage" />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            What you should know
          </h2>
          <ul className="mt-6 space-y-4 text-sm text-zinc-400">
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span>
                Hermes injects a ~6.6k-token system prompt (SOUL.md persona +
                skills + memory) on every request. That floor counts as input.
                A trivial &quot;hi&quot; still bills around{" "}
                <code className="font-mono text-emerald-300">$0.020</code>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span>
                Streaming requests are billed when the upstream emits its final{" "}
                <code className="font-mono text-emerald-300">usage</code> chunk.
                If the connection drops mid-stream we still bill the tokens
                Hermes counted up to that point.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span>
                Cost formula:{" "}
                <code className="font-mono text-emerald-300">
                  (input/1M) * 3 + (output/1M) * 15
                </code>
                . Stored in <code className="font-mono">usage_logs</code> at 8
                decimals.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span>
                No Stripe yet. Top up by emailing{" "}
                <a
                  href="mailto:contact@codecrack.dev"
                  className="text-emerald-300 underline-offset-2 hover:underline"
                >
                  contact@codecrack.dev
                </a>{" "}
                with proof — credited within 24h.
              </span>
            </li>
          </ul>
        </section>

        <div className="mt-14 flex flex-col items-center gap-3 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-8 text-center">
          <h3 className="text-xl font-semibold">Ready to crack on?</h3>
          <p className="max-w-md text-sm text-zinc-400">
            Request access, get approved, top up, ship. No quotas beyond your
            balance.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-emerald-300"
            >
              Request access
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700/60 px-5 py-2.5 text-sm text-zinc-100 hover:border-zinc-600 hover:bg-zinc-900/60"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function PriceTile({
  label,
  unit,
  price,
  note,
}: {
  label: string;
  unit: string;
  price: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="font-mono text-xs text-zinc-500">{unit}</p>
      </div>
      <p className="mt-6 font-mono text-5xl font-semibold tracking-tight text-zinc-50">
        {price}
      </p>
      <p className="mt-4 text-sm text-zinc-400">{note}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-zinc-50">
        {value}
      </p>
    </div>
  );
}
