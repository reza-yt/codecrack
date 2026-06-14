import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CodeBlock } from "@/components/code-block";

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-50 mb-2">Dokumentasi</h1>
        <p className="text-zinc-400 mb-12">
          Panduan singkat dan referensi API untuk gateway codecrack.dev.
        </p>

        {/* Quickstart */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4 font-mono">
            # Memulai
          </h2>
          <ol className="space-y-4 text-zinc-300 list-decimal list-inside">
            <li>
              <strong className="text-zinc-50">Ajukan akses</strong>: kirim
              permohonan undangan melalui{" "}
              <code className="font-mono text-emerald-400">/waitlist</code> dan
              tunggu persetujuan.
            </li>
            <li>
              <strong className="text-zinc-50">Buat API key</strong>: kunjungi{" "}
              <code className="font-mono text-emerald-400">/dashboard/keys</code>{" "}
              dan buat key baru. Salin key tersebut segera setelah dibuat.
            </li>
            <li>
              <strong className="text-zinc-50">Kirim permintaan</strong>:
              gunakan SDK atau CLI apa pun yang kompatibel dengan OpenAI:
            </li>
          </ol>

          <div className="mt-4">
            <CodeBlock
              code={`from openai import OpenAI

client = OpenAI(
    base_url="https://api.codecrack.dev/v1",
    api_key="cc_live_key_anda_di_sini"
)

response = client.chat.completions.create(
    model="codecrack",
    messages=[{"role": "user", "content": "Halo, apa rencana hari ini?"}],
)

print(response.choices[0].message.content)`}
              language="python"
            />
          </div>
        </section>

        {/* API Reference */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4 font-mono">
            # Referensi API
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
                Membuat chat completion. Format permintaan dan respons sepenuhnya kompatibel dengan OpenAI.
              </p>
              <h4 className="text-xs font-mono text-zinc-500 uppercase mb-2">Header</h4>
              <div className="text-sm font-mono text-zinc-300 space-y-1 mb-4">
                <p>Authorization: Bearer cc_live_•••</p>
                <p>Content-Type: application/json</p>
              </div>
              <h4 className="text-xs font-mono text-zinc-500 uppercase mb-2">Body</h4>
              <CodeBlock
                code={`{
  "model": "codecrack",
  "messages": [
    {"role": "user", "content": "pesan Anda"}
  ],
  "stream": true
}`}
                language="json"
              />
              <div className="mt-4">
                <h4 className="text-xs font-mono text-zinc-500 uppercase mb-2">Catatan</h4>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                  <li>
                    Nilai <code className="font-mono">model</code> selalu ditimpa ke{" "}
                    <code className="font-mono text-emerald-400">codecrack</code>.
                  </li>
                  <li>Respons streaming menggunakan Server-Sent Events (SSE).</li>
                  <li>Setiap permintaan minimum sekitar 6.600 token prompt (system prompt).</li>
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
                Menampilkan daftar model yang tersedia. Saat ini hanya satu model:{" "}
                <code className="font-mono text-emerald-400">codecrack</code>.
              </p>
              <CodeBlock
                code={`{
  "object": "list",
  "data": [
    {
      "id": "codecrack",
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
                Endpoint pemeriksaan kesehatan. Mengembalikan status layanan upstream Hermes.
              </p>
            </div>
          </div>
        </section>

        {/* Error Codes */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4 font-mono">
            # Kode kesalahan
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-4 py-3 text-zinc-400 font-mono font-normal">Kode</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-mono font-normal">Tipe</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-mono font-normal">Arti</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/40">
                  <td className="px-4 py-2 font-mono">401</td>
                  <td className="px-4 py-2 font-mono text-red-400">invalid_api_key</td>
                  <td className="px-4 py-2">Key tidak ada, formatnya salah, atau telah dicabut.</td>
                </tr>
                <tr className="border-b border-zinc-800/40">
                  <td className="px-4 py-2 font-mono">402</td>
                  <td className="px-4 py-2 font-mono text-amber-400">insufficient_credit</td>
                  <td className="px-4 py-2">Saldo nol atau negatif.</td>
                </tr>
                <tr className="border-b border-zinc-800/40">
                  <td className="px-4 py-2 font-mono">402</td>
                  <td className="px-4 py-2 font-mono text-amber-400">quota_exhausted</td>
                  <td className="px-4 py-2">Kuota token pada key telah habis.</td>
                </tr>
                <tr className="border-b border-zinc-800/40">
                  <td className="px-4 py-2 font-mono">403</td>
                  <td className="px-4 py-2 font-mono text-amber-400">account_suspended</td>
                  <td className="px-4 py-2">Akun belum disetujui atau sedang ditangguhkan.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">400</td>
                  <td className="px-4 py-2 font-mono text-zinc-400">invalid_request_error</td>
                  <td className="px-4 py-2">Body permintaan tidak valid.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-4 font-mono">
            # Autentikasi
          </h2>
          <p className="text-zinc-400 mb-4">
            Seluruh permintaan API memerlukan Bearer token pada header Authorization.
            Format key adalah:
          </p>
          <code className="font-mono text-emerald-400 text-sm">
            cc_live_{"<32 karakter alfanumerik>"}
          </code>
          <p className="text-zinc-400 mt-4">
            Buat key melalui{" "}
            <code className="font-mono text-emerald-400">dasbor</code>. Key hanya
            ditampilkan satu kali pada saat pembuatan, jadi pastikan Anda menyimpannya dengan aman.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
