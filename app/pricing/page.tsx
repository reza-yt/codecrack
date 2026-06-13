import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-50 mb-2">Pricing</h1>
        <p className="text-zinc-400 mb-12">
          Pay-as-you-go. No subscription, no hidden fees. Top up credits and use them.
        </p>

        {/* Token Pricing */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-6">Token Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-6">
              <p className="text-xs font-mono text-zinc-500 uppercase mb-2">Input tokens</p>
              <p className="text-3xl font-mono font-bold text-emerald-400">$3.00</p>
              <p className="text-sm text-zinc-400 mt-1">per 1 million tokens</p>
            </div>
            <div className="glass rounded-xl p-6">
              <p className="text-xs font-mono text-zinc-500 uppercase mb-2">Output tokens</p>
              <p className="text-3xl font-mono font-bold text-emerald-400">$15.00</p>
              <p className="text-sm text-zinc-400 mt-1">per 1 million tokens</p>
            </div>
          </div>
        </section>

        {/* Cost Breakdown */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-6">Cost Breakdown</h2>
          <div className="glass rounded-xl p-6">
            <p className="text-sm text-zinc-400 mb-4">
              Hermes injects a ~6.6k token system prompt on every request. Here&apos;s
              what a typical request costs:
            </p>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>System prompt (baked-in)</span>
                <span>~6,600 input tokens</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Your message</span>
                <span>~100 input tokens</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Agent response</span>
                <span>~500 output tokens</span>
              </div>
              <hr className="border-zinc-800/60" />
              <div className="flex justify-between text-zinc-300">
                <span>Input cost: 6,700 × $3/1M</span>
                <span>$0.0201</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Output cost: 500 × $15/1M</span>
                <span>$0.0075</span>
              </div>
              <hr className="border-zinc-800/60" />
              <div className="flex justify-between text-zinc-50 font-bold">
                <span>Total per request</span>
                <span className="text-emerald-400">~$0.028</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              With $10 credit, you get roughly ~350 typical requests.
            </p>
          </div>
        </section>

        {/* Top-up */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-6">Top-up</h2>
          <div className="glass rounded-xl p-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-mono font-bold text-zinc-50">$10</span>
              <span className="text-sm text-zinc-400">minimum top-up</span>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              For MVP, top-ups are processed manually. Email{" "}
              <code className="font-mono text-emerald-400">contact@codecrack.dev</code>{" "}
              with your transfer/crypto proof. We credit your account within 24 hours.
            </p>
            <p className="text-sm text-zinc-500">
              Stripe integration coming soon.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/waitlist"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-6 py-3 transition-colors"
          >
            Request access
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
