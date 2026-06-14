import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800/60 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} codecrack.dev
          </span>
          <Link
            href="/terms"
            className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            Ketentuan
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            Privasi
          </Link>
        </div>
        <div className="font-mono text-xs text-zinc-600">
          v0.1.0
        </div>
      </div>
    </footer>
  );
}
