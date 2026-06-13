import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Layers,
  Shield,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatusPill } from "@/components/status-pill";
import { CodeBlock } from "@/components/code-block";

export default function LandingPage() {
  const curlExample = `curl https://api.codecrack.dev/v1/chat/completions \\
  -H "Authorization: Bearer cc_live_•••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "hermes-agent",
    "messages": [
      {"role": "user", "content": "audit lib auth gua"}
    ],
    "stream": true
  }'`;

  const pythonExample = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.codecrack.dev/v1",
    api_key="cc_live_•••",
)

stream = client.chat.completions.create(
    model="hermes-agent",
    messages=[
        {"role": "user", "content": "audit lib auth gua"},
    ],
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")`;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-dotgrid absolute inset-0 opacity-60" aria-hidden />
        <div
          className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-emerald-500/[0.05] to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32">
          <div className="mb-6 flex items-center justify-center">
            <StatusPill tone="ok">all systems operational</StatusPill>
          </div>

          <h1 className="mx-auto max-w-3xl text-center text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl md:text-6xl">
            OpenAI-compatible gateway to{" "}
            <span className="font-mono italic text-emerald-400">Hermes</span>.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-zinc-400 sm:text-lg">
            Persona-locked agent with tools, memory, and streaming. Satu base
            URL, satu key — pakai dari CLI mana aja yang ngomong OpenAI.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-400 px-5 py-2.5 text-sm font-medium text-zinc-950 shadow-sm shadow-emerald-500/20 transition-colors hover:bg-emerald-300"
            >
              Request access
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700/60 px-5 py-2.5 text-sm text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-900/60"
            >
              <BookOpen className="h-4 w-4" />
              Read docs
            </Link>
          </div>

          <div className="relative mx-auto mt-14 max-w-3xl">
            <div className="gradient-border p-px">
              <CodeBlock
                code={curlExample}
                caption="terminal · curl"
                className="!border-zinc-800/40"
              />
            </div>
            <p className="mt-4 text-center font-mono text-xs text-zinc-500">
              powered by hermes-agent v0.16.0 &middot; claude opus 4.7 &middot;
              ~6.6k token system prompt baked in
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-zinc-800/60 bg-zinc-950">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-800/60 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Zap className="h-4 w-4" />}
              title="OpenAI-compatible"
              body="Drop-in replacement. Set base_url, point at us, ship."
            />
            <Feature
              icon={<Layers className="h-4 w-4" />}
              title="Hermes-powered"
              body="Persona-locked agent with full tool belt and memory."
            />
            <Feature
              icon={<Shield className="h-4 w-4" />}
              title="Pay-as-you-go"
              body="No subscription. Top up, use, stop when you stop."
            />
            <Feature
              icon={<Code2 className="h-4 w-4" />}
              title="Streaming SSE"
              body="Token-by-token output, tool progress events, the works."
            />
          </div>
        </div>
      </section>

      {/* SDK SECTION */}
      <section className="border-t border-zinc-800/60">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
              SDK
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Use the openai SDK.
              <br />
              <span className="text-zinc-400">Nothing to learn.</span>
            </h2>
            <p className="mt-5 max-w-md text-zinc-400">
              If your tool already speaks OpenAI — Aider, Cursor, llm, custom
              scripts, whatever — it speaks codecrack. Override{" "}
              <code className="rounded bg-zinc-900/80 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                base_url
              </code>{" "}
              and{" "}
              <code className="rounded bg-zinc-900/80 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                api_key
              </code>
              , dan jalan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-700/60 px-4 py-2 text-sm text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-900/60"
              >
                Quickstart
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-zinc-300 transition-colors hover:text-zinc-50"
              >
                Pricing details
              </Link>
            </div>
          </div>

          <CodeBlock code={pythonExample} caption="python · openai" />
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="border-t border-zinc-800/60 bg-zinc-950">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Pay only for tokens you use.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PriceCard label="Input · per 1M tokens" value="$3" />
            <PriceCard label="Output · per 1M tokens" value="$15" />
            <PriceCard label="Minimum top-up" value="$10" />
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-50"
            >
              See full breakdown
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-zinc-950 p-6 transition-colors hover:bg-zinc-900/40">
      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-400/10 text-emerald-400">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
    </div>
  );
}

function PriceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-6 text-center">
      <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-3 font-mono text-4xl font-semibold tracking-tight text-zinc-50">
        {value}
      </p>
    </div>
  );
}
