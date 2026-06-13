import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 font-mono text-xs text-zinc-500">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-zinc-300">
          <Section title="What we store">
            <ul className="list-disc space-y-1 pl-5 text-zinc-400">
              <li>Email address (for auth via magic link).</li>
              <li>SHA-256 hashes of your API keys — never the plaintext.</li>
              <li>
                Per-request usage logs: timestamp, token counts, cost,
                duration, status code, key prefix. We do{" "}
                <strong>not</strong> store request or response bodies.
              </li>
              <li>Credit balance and top-up history.</li>
            </ul>
          </Section>
          <Section title="Upstream">
            <p>
              Requests are forwarded over TLS to{" "}
              <code className="font-mono text-emerald-300">
                hermes.codecrack.dev
              </code>{" "}
              via Cloudflare Tunnel. Hermes processes message content to
              generate responses. We do not retain message content beyond the
              request lifecycle on the gateway.
            </p>
          </Section>
          <Section title="Cookies">
            <p>
              Auth uses Supabase cookies for session management. No third-party
              analytics or advertising cookies.
            </p>
          </Section>
          <Section title="Your rights">
            <p>
              Email{" "}
              <a
                href="mailto:contact@codecrack.dev"
                className="text-emerald-300"
              >
                contact@codecrack.dev
              </a>{" "}
              to export or delete your data. We honor deletion within 30 days
              except where retention is required by law.
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
