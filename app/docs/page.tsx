import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Quickstart and API reference for the codecrack.dev OpenAI-compatible gateway.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
            Documentation
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Quickstart
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            codecrack speaks the OpenAI Chat Completions wire format. If your
            tool already supports OpenAI, change two values dan kelar.
          </p>
        </div>

        <Section id="get-access" title="1. Get access" number="01">
          <p className="text-zinc-400">
            We&apos;re invite-only during MVP. Drop your email on the{" "}
            <Link
              href="/waitlist"
              className="text-emerald-300 underline-offset-2 hover:underline"
            >
              waitlist
            </Link>
            . Once approved, log in via magic link and create an API key from{" "}
            <code className="font-mono text-emerald-300">
              /dashboard/keys
            </code>
            . Top up your balance from{" "}
            <code className="font-mono text-emerald-300">
              /dashboard/billing
            </code>
            .
          </p>
        </Section>

        <Section id="auth" title="2. Authentication" number="02">
          <p className="text-zinc-400">
            Send your key as a Bearer token. Keys are 40 characters, prefixed{" "}
            <code className="font-mono text-emerald-300">cc_live_</code>, and
            shown only once on creation. We store an SHA-256 hash —{" "}
            <span className="text-zinc-300">we cannot recover lost keys.</span>
          </p>
          <CodeBlock
            className="mt-4"
            caption="header"
            code={`Authorization: Bearer cc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}
          />
        </Section>

        <Section id="curl" title="3. Your first request" number="03">
          <CodeBlock
            caption="curl · non-streaming"
            code={`curl https://api.codecrack.dev/v1/chat/completions \\
  -H "Authorization: Bearer $CODECRACK_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "hermes-agent",
    "messages": [
      {"role": "user", "content": "halo, siapa lo?"}
    ]
  }'`}
          />
        </Section>

        <Section id="streaming" title="4. Streaming" number="04">
          <p className="text-zinc-400">
            Set{" "}
            <code className="font-mono text-emerald-300">stream: true</code>{" "}
            and we&apos;ll proxy SSE chunks straight from Hermes. Tool progress
            events arrive as{" "}
            <code className="font-mono text-emerald-300">
              event: hermes.tool.progress
            </code>
            .
          </p>
          <CodeBlock
            className="mt-4"
            caption="curl · streaming"
            code={`curl -N https://api.codecrack.dev/v1/chat/completions \\
  -H "Authorization: Bearer $CODECRACK_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "hermes-agent",
    "messages": [{"role":"user","content":"audit lib auth gua"}],
    "stream": true
  }'`}
          />
        </Section>

        <Section id="python" title="5. Python (openai SDK)" number="05">
          <CodeBlock
            caption="python · openai"
            code={`from openai import OpenAI

client = OpenAI(
    base_url="https://api.codecrack.dev/v1",
    api_key="cc_live_•••",
)

resp = client.chat.completions.create(
    model="hermes-agent",
    messages=[{"role": "user", "content": "halo"}],
)
print(resp.choices[0].message.content)`}
          />
        </Section>

        <Section id="node" title="6. Node.js (openai SDK)" number="06">
          <CodeBlock
            caption="node · openai"
            code={`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.codecrack.dev/v1",
  apiKey: process.env.CODECRACK_KEY,
});

const resp = await client.chat.completions.create({
  model: "hermes-agent",
  messages: [{ role: "user", content: "halo" }],
});

console.log(resp.choices[0].message.content);`}
          />
        </Section>

        <Section id="reference" title="7. API reference" number="07">
          <h3 className="mt-4 font-mono text-sm text-zinc-100">
            POST /v1/chat/completions
          </h3>
          <p className="mt-2 text-zinc-400">
            OpenAI-compatible. Required:{" "}
            <code className="font-mono text-emerald-300">model</code>,{" "}
            <code className="font-mono text-emerald-300">messages</code>.
            Optional: <code className="font-mono text-emerald-300">stream</code>
            . The model field is normalized to{" "}
            <code className="font-mono text-emerald-300">hermes-agent</code>{" "}
            server-side.
          </p>

          <h3 className="mt-8 font-mono text-sm text-zinc-100">GET /v1/models</h3>
          <p className="mt-2 text-zinc-400">
            Returns one entry:{" "}
            <code className="font-mono text-emerald-300">hermes-agent</code>.
          </p>

          <h3 className="mt-8 font-mono text-sm text-zinc-100">
            GET /api/health
          </h3>
          <p className="mt-2 text-zinc-400">
            Liveness + upstream healthcheck. Returns{" "}
            <code className="font-mono text-emerald-300">
              {`{"status":"ok"|"degraded"}`}
            </code>
            .
          </p>
        </Section>

        <Section id="errors" title="8. Errors" number="08">
          <p className="text-zinc-400">
            Errors mirror OpenAI&apos;s shape. The{" "}
            <code className="font-mono text-emerald-300">type</code> field is
            machine-readable.
          </p>
          <CodeBlock
            className="mt-4"
            caption="error · 401"
            code={`{
  "error": {
    "type": "invalid_api_key",
    "message": "Invalid API key",
    "code": 401
  }
}`}
          />
          <table className="mt-6 w-full overflow-hidden rounded-lg border border-zinc-800/70 text-sm">
            <thead className="bg-zinc-900/60 text-left text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-mono">code</th>
                <th className="px-4 py-2 font-mono">type</th>
                <th className="px-4 py-2">when</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs text-zinc-300">
              <tr className="border-t border-zinc-800/70">
                <td className="px-4 py-2">400</td>
                <td className="px-4 py-2">invalid_request_error</td>
                <td className="px-4 py-2 font-sans text-zinc-400">
                  malformed JSON or missing fields
                </td>
              </tr>
              <tr className="border-t border-zinc-800/70">
                <td className="px-4 py-2">401</td>
                <td className="px-4 py-2">invalid_api_key</td>
                <td className="px-4 py-2 font-sans text-zinc-400">
                  missing, malformed, or revoked key
                </td>
              </tr>
              <tr className="border-t border-zinc-800/70">
                <td className="px-4 py-2">402</td>
                <td className="px-4 py-2">insufficient_credit</td>
                <td className="px-4 py-2 font-sans text-zinc-400">
                  balance ≤ $0 — top up at /dashboard/billing
                </td>
              </tr>
              <tr className="border-t border-zinc-800/70">
                <td className="px-4 py-2">403</td>
                <td className="px-4 py-2">waitlist / account_suspended</td>
                <td className="px-4 py-2 font-sans text-zinc-400">
                  not yet approved or status flipped
                </td>
              </tr>
              <tr className="border-t border-zinc-800/70">
                <td className="px-4 py-2">502</td>
                <td className="px-4 py-2">upstream_error</td>
                <td className="px-4 py-2 font-sans text-zinc-400">
                  Hermes returned non-2xx or tunnel dropped
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  id,
  title,
  number,
  children,
}: {
  id: string;
  title: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-20">
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-xs text-emerald-400">{number}</span>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
          {title}
        </h2>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </section>
  );
}
