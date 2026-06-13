import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Home, Key, Activity, Wallet, Settings, BookOpen, ShieldAlert } from "lucide-react";
import { LogoutButton } from "./logout-button";

const baseNav = [
  { href: "/dashboard", icon: Home, label: "Ringkasan" },
  { href: "/dashboard/keys", icon: Key, label: "API Key" },
  { href: "/dashboard/usage", icon: Activity, label: "Pemakaian" },
  { href: "/dashboard/billing", icon: Wallet, label: "Tagihan" },
  { href: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
  { href: "/docs", icon: BookOpen, label: "Dokumentasi" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Surface admin link only if the user is an admin (one extra round-trip,
  // negligible compared to the page render itself).
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  const navItems = isAdmin
    ? [
        ...baseNav,
        { href: "/admin", icon: ShieldAlert, label: "Admin" },
      ]
    : baseNav;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-zinc-800/60 bg-zinc-950">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-zinc-800/60">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="font-mono text-emerald-400 text-sm">/_</span>
              <span className="font-semibold text-zinc-50">codecrack</span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="p-3 border-t border-zinc-800/60">
            <p className="text-xs text-zinc-500 font-mono truncate px-3 mb-2">
              {user.email}
            </p>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="font-mono text-emerald-400 text-sm">/_</span>
            <span className="font-semibold text-zinc-50">codecrack</span>
          </Link>
          <span className="text-xs text-zinc-500 font-mono truncate max-w-[150px]">
            {user.email}
          </span>
        </div>
        <nav className="flex items-center gap-1 px-3 pb-2 overflow-x-auto">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50 rounded-lg transition-colors whitespace-nowrap"
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="pt-[88px] md:pt-0 p-6 md:p-8 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
