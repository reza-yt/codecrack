import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LoginForm } from "./login-form";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sp = await searchParams;

  if (user) {
    redirect(sp.next || "/dashboard");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          Log in
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          We&apos;ll email you a magic link. No passwords, ever.
        </p>

        <div className="mt-10 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-6 sm:p-8">
          <LoginForm next={sp.next} />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Tidak punya akun?{" "}
          <Link
            href="/waitlist"
            className="text-emerald-300 hover:text-emerald-200"
          >
            Request access
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
