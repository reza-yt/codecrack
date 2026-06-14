import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-50 mb-2">Harga</h1>
        <p className="text-zinc-400 mb-12">
          Bayar sesuai pemakaian. Tanpa langganan, tanpa biaya tersembunyi. Cukup isi saldo, lalu gunakan.
        </p>

        {/* Token Pricing */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-6">Harga token</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-6">
              <p className="text-xs font-mono text-zinc-500 uppercase mb-2">Token input</p>
              <p className="text-3xl font-mono font-bold text-emerald-400">$3,00</p>
              <p className="text-sm text-zinc-400 mt-1">per 1 juta token</p>
            </div>
            <div className="glass rounded-xl p-6">
              <p className="text-xs font-mono text-zinc-500 uppercase mb-2">Token output</p>
              <p className="text-3xl font-mono font-bold text-emerald-400">$15,00</p>
              <p className="text-sm text-zinc-400 mt-1">per 1 juta token</p>
            </div>
          </div>
        </section>

        {/* Cost Breakdown */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-6">Rincian biaya</h2>
          <div className="glass rounded-xl p-6">
            <p className="text-sm text-zinc-400 mb-4">
              Hermes menambahkan system prompt sekitar 6.600 token pada setiap permintaan.
              Berikut perkiraan biaya untuk satu permintaan tipikal:
            </p>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>System prompt (bawaan)</span>
                <span>~6.600 token input</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Pesan Anda</span>
                <span>~100 token input</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Respons agen</span>
                <span>~500 token output</span>
              </div>
              <hr className="border-zinc-800/60" />
              <div className="flex justify-between text-zinc-300">
                <span>Biaya input: 6.700 × $3 / 1JT</span>
                <span>$0,0201</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Biaya output: 500 × $15 / 1JT</span>
                <span>$0,0075</span>
              </div>
              <hr className="border-zinc-800/60" />
              <div className="flex justify-between text-zinc-50 font-bold">
                <span>Total per permintaan</span>
                <span className="text-emerald-400">~$0,028</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              Dengan saldo $10, Anda mendapatkan kira-kira 350 permintaan tipikal.
            </p>
          </div>
        </section>

        {/* Top-up */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-50 mb-6">Isi saldo</h2>
          <div className="glass rounded-xl p-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-mono font-bold text-zinc-50">$10</span>
              <span className="text-sm text-zinc-400">isi saldo minimum</span>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Pada tahap MVP, pengisian saldo masih diproses secara manual. Kirim email ke{" "}
              <code className="font-mono text-emerald-400">contact@codecrack.dev</code>{" "}
              dengan menyertakan bukti transfer atau hash transaksi crypto. Saldo akan ditambahkan ke akun Anda dalam 24 jam.
            </p>
            <p className="text-sm text-zinc-500">
              Integrasi Stripe akan tersedia dalam waktu dekat.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/waitlist"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-6 py-3 transition-colors"
          >
            Ajukan akses
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
