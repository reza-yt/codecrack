import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-50 mb-8">Ketentuan Layanan</h1>
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 text-sm leading-relaxed">
          <p>Terakhir diperbarui: Januari 2026</p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">1. Deskripsi Layanan</h2>
          <p>
            codecrack.dev menyediakan gateway API yang kompatibel dengan OpenAI untuk
            agen Hermes. Akses bersifat undangan dan harus disetujui terlebih dahulu.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">2. Akun dan Akses</h2>
          <p>
            Anda harus mendapatkan persetujuan sebelum menggunakan layanan. Anda
            bertanggung jawab atas keamanan API key. Mohon tidak membagikan key
            secara publik atau menyematkannya pada kode sisi klien.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">3. Penagihan</h2>
          <p>
            Saldo bersifat prabayar dan tidak dapat dikembalikan. Pemakaian token
            dihitung per permintaan berdasarkan konsumsi sebenarnya. Harga dapat
            berubah dengan pemberitahuan tujuh hari sebelumnya.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">4. Pemakaian yang Diperbolehkan</h2>
          <p>
            Mohon tidak menggunakan layanan untuk aktivitas ilegal, spam,
            pelecehan, atau upaya melewati pengamanan. Kami berhak menangguhkan
            akun yang melanggar ketentuan ini.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">5. Batasan Tanggung Jawab</h2>
          <p>
            Layanan disediakan apa adanya tanpa jaminan apa pun. Kami tidak
            bertanggung jawab atas waktu henti, kehilangan data, atau kerugian
            yang timbul akibat penggunaan layanan.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">6. Perubahan</h2>
          <p>
            Ketentuan ini dapat diperbarui sewaktu-waktu. Penggunaan yang
            berlanjut setelah perubahan dianggap sebagai persetujuan terhadap
            ketentuan baru.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
