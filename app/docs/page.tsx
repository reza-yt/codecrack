import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CodeBlock } from "@/components/code-block";

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-50 mb-2">Documentation</h1>
        <p className="text-zinc-400 mb-12">
          Quickstart guide and API reference for codecrack.dev gateway.
        </p>

        {/* Quickstart */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4 font-mono">
            # Quickstart
          </h2>
          <ol className="space-y-4 text-zinc-300 list-decimal list-inside">
            <li>
              <strong className="text-zinc-50">Get access</strong> — request an
              invite at{" "}
              <code className="font-mono text-emerald-400">/waitlist</code> and
              wait for approval.
            </li>
            <li>
              <strong className="text-zinc-50">Create an API key</strong> — go to{" "}
              <code className="font-mono text-emerald-400">/dashboard/keys</code>{" "}
              and generate a new key. Copy it immediately.
            </li>
            <li>
              <strong className="text-zinc-50">Make a request</strong> — use any
              OpenAI-compatible SDK or CLI:
            </li>
          </ol>

          <div className="mt-4">
            <CodeBlock
              code={`from openai import OpenAI

client = OpenAI(
    base_url="https://api.codecrack.dev/v1",
    api_key="cc_live_your_key_here"
)

response = client.chat.completions.create(
    model="hermes-agent",
    messages=[{"role": "user", "content": "Halo, kerjain apa hari ini?"}],
)

print(response.choices[0].message.content)`}
              language="python"
            />
          </div>
        </section>

        {/* API Reference */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4 font-mono">
            # API Reference
          </h2>

          <div className="space-y-8">
            {/* Chat Completions */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  POST
                </span>
                <code className="font-mono text-sm text-zinc-300">
                  /v1/chat/completions
                </code>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Create a chat completion. 100% OpenAI-compatible request/response format.
              </p>
              <h4 className="text-xs font-mono text-zinc-500 uppercase mb-2">Headers</h4>
              <div className="text-sm font-mono text-zinc-300 space-y-1 mb-4">
                <p>Authorization: Bearer cc_live_...</p>
                <p>Content-Type: application/json</p>
              </div>
              <h4 className="text-xs font-mono text-zinc-500 uppercase mb-2">Body</h4>
              <CodeBlock
                code={`{
  "model": "hermes-agent",
  "messages": [
    {"role": "user", "content": "your message"}
  ],
  "stream": true
}`}
                language="json"
              />
              <div className="mt-4">
                <h4 className="text-xs font-mono text-zinc-500 uppercase mb-2">Notes</h4>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                  <li>
                    <code className="font-mono">model</code> is always overridden to{" "}
                    <code className="font-mono text-emerald-400">hermes-agent</code>
                  </li>
                  <li>Streaming responses use Server-Sent Events (SSE)</li>
                  <li>Minimum ~6.6k prompt tokens per request (system prompt)</li>
                </ul>
              </div>
            </div>

            {/* Models */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  GET
                </span>
                <code className="font-mono text-sm text-zinc-300">
                  /v1/models
                </code>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                List available models. Returns a single model:{" "}
                <code className="font-mono text-emerald-400">hermes-agent</code>.
              </p>
              <CodeBlock
                code={`{
  "object": "list",
  "data": [
    {
      "id": "hermes-agent",
      "object": "model",
      "owned_by": "codecrack"
    }
  ]
}`}
                language="json"
              />
            </div>

            {/* Health */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  GET
                </span>
                <code className="font-mono text-sm text-zinc-300">
                  /health
                </code>
              </div>
              <p className="text-sm text-zinc-400">
                Health check endpoint. Returns upstream Hermes status.
              </p>
            </div>
          </div>
        </section>

        {/* Error Codes */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4 font-mono">
            # Error Codes
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-4 py-3 text-zinc-400 font-mono font-normal">Code</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-mono font-normal">Type</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-mono font-normal">Meaning</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/40">
                  <td className="px-4 py-2 font-mono">401</td>
                  <td className="px-4 py-2 font-mono text-red-400">invalid_api_key</td>
                  <td className="px-4 py-2">Key missing, malformed, or revoked</td>
                </tr>
                <tr className="border-b border-zinc-800/40">
                  <td className="px-4 py-2 font-mono">402</td>
                  <td className="px-4 py-2 font-mono text-amber-400">insufficient_credit</td>
                  <td className="px-4 py-2">Balance is zero or negative</td>
                </tr>
                <tr className="border-b border-zinc-800/40">
                  <td className="px-4 py-2 font-mono">403</td>
                  <td className="px-4 py-2 font-mono text-amber-400">account_suspended</td>
                  <td className="px-4 py-2">Account not approved or suspended</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">400</td>
                  <td className="px-4 py-2 font-mono text-zinc-400">invalid_request_error</td>
                  <td className="px-4 py-2">Malformed request body</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4 font-mono">
            # Authentication
          </h2>
          <p className="text-zinc-400 mb-4">
            All API requests require a Bearer token in the Authorization header.
            Keys follow the format:
          </p>
          <code className="font-mono text-emerald-400 text-sm">
            cc_live_{"<32 alphanumeric characters>"}
          </code>
          <p className="text-zinc-400 mt-4">
            Generate keys from your{" "}
            <code className="font-mono text-emerald-400">dashboard</code>. Keys
            are shown once at creation — store them securely.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
