import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap, Layers, Shield, Code2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatusPill } from "@/components/status-pill";
import { CodeBlock } from "@/components/code-block";

const curlExample = `curl https://api.codecrack.dev/v1/chat/completions \\
  -H "Authorization: Bearer cc_live_•••" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"hermes-agent","messages":[{"role":"user","content":"hello"}],"stream":true}'`;

const pythonExample = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.codecrack.dev/v1",
    api_key="cc_live_•••"
)

stream = client.chat.completions.create(
    model="hermes-agent",
    messages=[{"role": "user", "content": "audit lib auth gua"}],
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")`;

const features = [
  {
    icon: Zap,
    title: "OpenAI-compatible",
    description: "Drop-in replacement. Pakai SDK atau CLI yang udah lo kenal.",
  },
  {
    icon: Layers,
    title: "Hermes-powered",
    description: "Persona-locked agent with tools, memory, and context baked in.",
  },
  {
    icon: Shield,
    title: "Pay-as-you-go",
    description: "No subscription. Top up credits, bayar per token yang lo pakai.",
  },
  {
    icon: Code2,
    title: "Streaming SSE",
    description: "Real-time token streaming. Sama persis kayak OpenAI API.",
  },
];

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>;
}) {
  // Defense-in-depth: if Supabase falls back to the Site URL with ?code=...
  // (e.g. allowlist gap or stale magic link), forward to /auth/callback so
  // exchangeCodeForSession still runs.
  const params = await searchParams;
  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`);
  }
  if (params.error) {
    redirect(
      `/auth/error?error=${encodeURIComponent(params.error)}${
        params.error_description
          ? `&error_description=${encodeURIComponent(params.error_description)}`
          : ""
      }`,
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <StatusPill />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 mb-4">
            OpenAI-compatible gateway to{" "}
            <span className="font-mono italic text-emerald-400">Hermes</span>.
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Persona-locked agent with tools, memory, and streaming.
            Satu base URL, satu key — pakai dari CLI mana aja.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-6 py-3 transition-colors"
            >
              Request access
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-50 border border-zinc-700 font-medium px-6 py-3 transition-colors"
            >
              Read docs
            </Link>
          </div>

          {/* Code example with animated border */}
          <div className="max-w-3xl mx-auto gradient-border">
            <CodeBlock code={curlExample} language="bash" />
          </div>

          <p className="mt-6 text-xs font-mono text-zinc-500">
            powered by hermes-agent v0.16.0 · claude opus 4.7 · ~6.6k token system prompt baked in
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-xl p-5 hover:border-zinc-700/80 transition-colors"
              >
                <feature.icon className="w-5 h-5 text-emerald-400 mb-3" />
                <h3 className="text-sm font-semibold text-zinc-50 mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDK Section */}
      <section className="py-16 px-4 border-t border-zinc-800/60">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-4">
              Use the <span className="font-mono text-emerald-400">openai</span> SDK.
              <br />
              Nothing to learn.
            </h2>
            <p className="text-zinc-400">
              Ganti base_url dan api_key, selesai. Compatible sama Python, Node,
              Go, Rust — semua SDK yang support OpenAI format.
            </p>
          </div>
          <div>
            <CodeBlock code={pythonExample} language="python" />
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-16 px-4 border-t border-zinc-800/60">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-zinc-50 mb-8">
            Simple pricing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6">
              <p className="text-3xl font-mono font-bold text-emerald-400">$3</p>
              <p className="text-xs text-zinc-400 mt-1">per 1M input tokens</p>
            </div>
            <div className="glass rounded-xl p-6">
              <p className="text-3xl font-mono font-bold text-emerald-400">$15</p>
              <p className="text-xs text-zinc-400 mt-1">per 1M output tokens</p>
            </div>
            <div className="glass rounded-xl p-6">
              <p className="text-3xl font-mono font-bold text-zinc-50">$10</p>
              <p className="text-xs text-zinc-400 mt-1">minimum top-up</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            No subscription. Pay for what you use.{" "}
            <Link href="/pricing" className="text-emerald-400 hover:underline">
              See full breakdown →
            </Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
