import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-50 mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 text-sm leading-relaxed">
          <p>Last updated: January 2025</p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">1. Service Description</h2>
          <p>
            codecrack.dev provides an OpenAI-compatible API gateway to the Hermes Agent.
            Access is invite-only and subject to approval.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">2. Account & Access</h2>
          <p>
            You must be approved to use the service. You are responsible for safeguarding
            your API keys. Do not share keys publicly or embed them in client-side code.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">3. Billing</h2>
          <p>
            Credits are prepaid and non-refundable. Token usage is billed per request
            based on actual consumption. Pricing may change with 7 days notice.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">4. Acceptable Use</h2>
          <p>
            Do not use the service for illegal activities, spam, harassment, or to bypass
            safety measures. We reserve the right to suspend accounts that violate these terms.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">5. Limitation of Liability</h2>
          <p>
            The service is provided &ldquo;as is&rdquo; without warranty. We are not liable for
            downtime, data loss, or damages arising from use of the service.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">6. Changes</h2>
          <p>
            We may update these terms at any time. Continued use after changes
            constitutes acceptance.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
