import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  BookOpen,
  Home,
  KeyRound,
  Settings,
  Terminal,
  Wallet,
} from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { SidebarLink } from "./sidebar-link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  // Pull profile for status; if missing, the trigger should have made one,
  // but tolerate the race.
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const status = profile?.status ?? "waitlist";
  const displayEmail = profile?.email ?? user.email ?? "";

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-950/80 lg:flex">
        <div className="flex h-14 items-center border-b border-zinc-800/60 px-5">
          <Link
            href="/"
            className="group flex items-center gap-2 font-mono text-sm font-medium text-zinc-100"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-emerald-400">
              <Terminal className="h-3.5 w-3.5" />
            </span>
            <span>
              <span className="text-emerald-400">/_</span>codecrack
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <SidebarLink href="/dashboard" icon={<Home className="h-4 w-4" />}>
            Overview
          </SidebarLink>
          <SidebarLink
            href="/dashboard/keys"
            icon={<KeyRound className="h-4 w-4" />}
          >
            API keys
          </SidebarLink>
          <SidebarLink
            href="/dashboard/usage"
            icon={<Activity className="h-4 w-4" />}
          >
            Usage
          </SidebarLink>
          <SidebarLink
            href="/dashboard/billing"
            icon={<Wallet className="h-4 w-4" />}
          >
            Billing
          </SidebarLink>
          <SidebarLink
            href="/dashboard/settings"
            icon={<Settings className="h-4 w-4" />}
          >
            Settings
          </SidebarLink>
          <div className="my-3 border-t border-zinc-800/60" />
          <SidebarLink href="/docs" icon={<BookOpen className="h-4 w-4" />}>
            Docs
          </SidebarLink>
        </nav>

        <div className="border-t border-zinc-800/60 px-4 py-3">
          <p className="truncate font-mono text-xs text-zinc-300">
            {displayEmail}
          </p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            status: {status}
          </p>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800/60 bg-zinc-950/80 px-4 backdrop-blur lg:hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-mono text-sm text-zinc-100"
          >
            <span className="text-emerald-400">/_</span>codecrack
          </Link>
          <LogoutButton />
        </div>

        {/* Mobile nav strip */}
        <nav className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800/60 bg-zinc-950 px-3 py-2 text-xs lg:hidden">
          <SidebarLink href="/dashboard" compact>
            Overview
          </SidebarLink>
          <SidebarLink href="/dashboard/keys" compact>
            Keys
          </SidebarLink>
          <SidebarLink href="/dashboard/usage" compact>
            Usage
          </SidebarLink>
          <SidebarLink href="/dashboard/billing" compact>
            Billing
          </SidebarLink>
          <SidebarLink href="/dashboard/settings" compact>
            Settings
          </SidebarLink>
        </nav>

        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-10">
          {status === "suspended" && (
            <Banner tone="danger">
              Your account is suspended. Contact{" "}
              <a
                href="mailto:contact@codecrack.dev"
                className="underline underline-offset-2"
              >
                contact@codecrack.dev
              </a>
              .
            </Banner>
          )}
          {status === "waitlist" && (
            <Banner tone="warn">
              You&apos;re on the waitlist. The dashboard works for review, but
              gateway requests will return{" "}
              <code className="font-mono">403</code> until you&apos;re approved.
            </Banner>
          )}
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "warn" | "danger";
  children: React.ReactNode;
}) {
  const styles =
    tone === "warn"
      ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
      : "border-red-400/30 bg-red-500/10 text-red-100";
  return (
    <div
      className={`mx-auto mb-6 w-full max-w-5xl rounded-lg border px-4 py-3 text-sm ${styles}`}
    >
      {children}
    </div>
  );
}
