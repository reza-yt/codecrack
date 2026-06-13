import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 font-mono text-xs text-zinc-500">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>

        <div className="prose prose-invert mt-10 space-y-6 text-sm leading-relaxed text-zinc-300">
          <Section title="1. Service">
            <p>
              codecrack.dev (&quot;the Service&quot;) provides an
              OpenAI-compatible HTTP API that proxies requests to a
              persona-locked AI agent named Hermes. By using the Service you
              agree to these Terms.
            </p>
          </Section>
          <Section title="2. Account & access">
            <p>
              The Service is invite-only during the MVP period. We may approve,
              suspend, or revoke access at our discretion. You are responsible
              for keeping your API keys secret. Anyone holding a valid key can
              spend your balance.
            </p>
          </Section>
          <Section title="3. Acceptable use">
            <p>
              You agree not to use the Service to generate content that is
              illegal, harms others, infringes on intellectual property, or
              attempts to bypass safety controls in the underlying agent. We
              may revoke access without refund for misuse.
            </p>
          </Section>
          <Section title="4. Billing">
            <p>
              Pricing is published at{" "}
              <a href="/pricing" className="text-emerald-300">
                /pricing
              </a>
              . Top-ups are non-refundable for tokens already consumed. Unused
              balance carries forward indefinitely while your account is
              active.
            </p>
          </Section>
          <Section title="5. Liability">
            <p>
              The Service is provided &quot;as is&quot; without warranties.
              Liability is limited to the amount paid in the prior 30 days. We
              are not liable for indirect or consequential damages, including
              losses from generated content.
            </p>
          </Section>
          <Section title="6. Termination">
            <p>
              You may close your account at any time. We may suspend the
              Service for legal, security, or operational reasons. Upon
              termination, remaining unused balance is forfeit unless required
              by law.
            </p>
          </Section>
          <Section title="7. Contact">
            <p>
              Questions:{" "}
              <a
                href="mailto:contact@codecrack.dev"
                className="text-emerald-300"
              >
                contact@codecrack.dev
              </a>
              .
            </p>
          </Section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
      <div className="mt-2 text-zinc-400">{children}</div>
    </section>
  );
}
