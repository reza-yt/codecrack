import Link from "next/link";

export function SiteFooter() {
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID || "dev";
  return (
    <footer className="mt-20 border-t border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:px-6">
        <div className="font-mono">
          &copy; {new Date().getFullYear()} codecrack.dev — all rights reserved
        </div>
        <div className="flex items-center gap-4 font-mono">
          <Link href="/terms" className="hover:text-zinc-300">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-zinc-300">
            Privacy
          </Link>
          <Link href="/status" className="hover:text-zinc-300">
            Status
          </Link>
          <span className="rounded border border-zinc-800/80 bg-zinc-900/60 px-2 py-0.5 text-[10px] text-zinc-400">
            build {buildId.slice(0, 7)}
          </span>
        </div>
      </div>
    </footer>
  );
}
