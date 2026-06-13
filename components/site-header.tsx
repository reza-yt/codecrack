import Link from "next/link";
import { Terminal } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-mono text-sm font-medium text-zinc-100"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-emerald-400 transition-colors group-hover:border-emerald-500/40">
            <Terminal className="h-3.5 w-3.5" />
          </span>
          <span className="tracking-tight">
            <span className="text-emerald-400">/_</span>codecrack
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-zinc-400 sm:flex">
          <Link
            href="/docs"
            className="rounded px-3 py-1.5 hover:bg-zinc-900/60 hover:text-zinc-100"
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="rounded px-3 py-1.5 hover:bg-zinc-900/60 hover:text-zinc-100"
          >
            Pricing
          </Link>
          <Link
            href="/status"
            className="rounded px-3 py-1.5 hover:bg-zinc-900/60 hover:text-zinc-100"
          >
            Status
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-md px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-50 sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex items-center rounded-md bg-emerald-400 px-3 py-1.5 text-sm font-medium text-zinc-950 shadow-sm shadow-emerald-500/20 transition-colors hover:bg-emerald-300"
          >
            Get access
          </Link>
        </div>
      </div>
    </header>
  );
}
