import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AlertTriangle } from "lucide-react";

export const metadata = { title: "Auth error" };

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-4 py-20 sm:px-6">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <h1 className="text-base font-semibold text-red-100">
                Sign-in failed
              </h1>
              <p className="mt-1 text-sm text-red-200/80">
                {sp.reason
                  ? `Reason: ${sp.reason}`
                  : "Your magic link may have expired or been used already."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-md bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-300"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-zinc-700/60 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-600 hover:bg-zinc-900/60"
          >
            Back home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
