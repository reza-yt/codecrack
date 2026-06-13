import { createServerSupabase } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, display_name, status, created_at")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Account</h1>
      </div>

      <div className="space-y-8">
        <Section title="Profile" description="Public display details.">
          <SettingsForm initialName={profile?.display_name ?? null} />
        </Section>

        <Section title="Account info" description="Read-only.">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Row label="Email" value={profile?.email ?? user!.email ?? "—"} />
            <Row label="Status" value={profile?.status ?? "waitlist"} />
            <Row
              label="Member since"
              value={
                profile?.created_at
                  ? new Date(profile.created_at).toISOString().slice(0, 10)
                  : "—"
              }
            />
            <Row label="User ID" value={user!.id} mono />
          </dl>
        </Section>

        <Section
          title="Danger zone"
          description="These actions affect access to your account."
        >
          <div className="rounded-lg border border-red-400/30 bg-red-500/5 p-4 text-sm text-red-100/90">
            Need to delete your account or refund your balance? Email{" "}
            <a
              href="mailto:contact@codecrack.dev"
              className="text-red-200 underline underline-offset-2"
            >
              contact@codecrack.dev
            </a>{" "}
            and we&apos;ll process it within 30 days.
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </dt>
      <dd
        className={`mt-1 break-all text-sm text-zinc-200 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
