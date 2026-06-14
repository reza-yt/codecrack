import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="font-mono text-emerald-400 text-sm">/_</span>
            <span className="font-semibold text-zinc-50">codecrack</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/docs"
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
            >
              Dokumentasi
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
            >
              Harga
            </Link>
            <Link
              href="/status"
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
            >
              Status
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-4 py-1.5 text-sm transition-colors"
          >
            Ajukan akses
          </Link>
        </div>
      </div>
    </header>
  );
}
