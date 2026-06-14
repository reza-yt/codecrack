import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-50 mb-8">Kebijakan Privasi</h1>
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 text-sm leading-relaxed">
          <p>Terakhir diperbarui: Januari 2026</p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">1. Data yang Kami Kumpulkan</h2>
          <p>
            Kami mengumpulkan alamat email (untuk autentikasi), metadata pemakaian
            API (jumlah token, waktu, kode status), dan deskripsi rencana
            penggunaan opsional dari formulir daftar tunggu.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">2. Data yang Tidak Kami Simpan</h2>
          <p>
            Kami tidak menyimpan isi pesan Anda maupun respons model AI. Body
            permintaan diteruskan secara real-time dan tidak dicatat. API key
            disimpan hanya dalam bentuk hash SHA-256.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">3. Penggunaan Data</h2>
          <p>
            Email digunakan untuk autentikasi dan komunikasi layanan. Data
            pemakaian digunakan untuk perhitungan kuota dan pemantauan sistem.
            Kami tidak menjual data Anda kepada pihak ketiga.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">4. Keamanan Data</h2>
          <p>
            Seluruh data disimpan di Supabase (Postgres) dengan Row Level Security
            yang aktif. API key dihash sebelum disimpan. Seluruh lalu lintas
            dienkripsi melalui TLS.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">5. Retensi Data</h2>
          <p>
            Log pemakaian disimpan tanpa batas waktu untuk keperluan operasional.
            Anda dapat mengajukan penghapusan akun dengan menghubungi
            contact@codecrack.dev.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">6. Kontak</h2>
          <p>
            Untuk pertanyaan terkait privasi, silakan hubungi{" "}
            <code className="font-mono text-emerald-400">contact@codecrack.dev</code>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
