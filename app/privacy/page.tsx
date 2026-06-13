import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-50 mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 text-sm leading-relaxed">
          <p>Last updated: January 2025</p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">1. Data We Collect</h2>
          <p>
            We collect your email address (for authentication), API usage metadata
            (token counts, timestamps, status codes), and optional use case description
            from the waitlist form.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">2. What We Don&apos;t Store</h2>
          <p>
            We do not store the content of your messages or Hermes responses.
            Request bodies are proxied in real-time and not logged. API keys are
            stored as SHA-256 hashes only.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">3. How We Use Data</h2>
          <p>
            Email: authentication and service communications. Usage data: billing
            calculations and system monitoring. We do not sell your data to third parties.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">4. Data Security</h2>
          <p>
            All data is stored in Supabase (Postgres) with Row Level Security enabled.
            API keys are hashed before storage. All traffic is encrypted via TLS.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">5. Data Retention</h2>
          <p>
            Usage logs are retained indefinitely for billing purposes. You may request
            account deletion by contacting contact@codecrack.dev.
          </p>

          <h2 className="text-lg font-semibold text-zinc-50 mt-8">6. Contact</h2>
          <p>
            For privacy-related inquiries, email{" "}
            <code className="font-mono text-emerald-400">contact@codecrack.dev</code>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
