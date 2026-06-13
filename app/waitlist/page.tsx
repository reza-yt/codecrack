import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WaitlistForm } from "./waitlist-form";

export default function WaitlistPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-50 mb-2">
              Request Access
            </h1>
            <p className="text-zinc-400 text-sm">
              codecrack.dev is invite-only. Masukin email dan use case lo,
              kita review manual.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
