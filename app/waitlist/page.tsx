import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WaitlistForm } from "./waitlist-form";

export const metadata: Metadata = {
  title: "Request access",
  description: "Join the codecrack.dev waitlist for invite-only access.",
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          Waitlist
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Request access
        </h1>
        <p className="mt-3 text-zinc-400">
          codecrack is invite-only during MVP. Drop your email and we&apos;ll
          ping you when a slot opens. Approval biasanya 1-3 hari kerja.
        </p>

        <div className="mt-10 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-6 sm:p-8">
          <WaitlistForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
