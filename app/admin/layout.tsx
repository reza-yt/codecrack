import Link from "next/link";
import { Key, Users, Activity, Home, BookOpen, ShieldAlert } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { LogoutButton } from "@/app/dashboard/logout-button";

const adminNav = [
  { href: "/admin", icon: Home, label: "Ringkasan" },
  { href: "/admin/keys", icon: Key, label: "API Key" },
  { href: "/admin/users", icon: Users, label: "Pengguna" },
  { href: "/admin/usage", icon: Activity, label: "Pemakaian" },
  { href: "/dashboard", icon: BookOpen, label: "← Kembali ke dasbor" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-zinc-800/60 bg-zinc-950">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-zinc-800/60">
            <Link href="/admin" className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-zinc-50">codecrack admin</span>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {adminNav.map((item) => (
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

          <div className="p-3 border-t border-zinc-800/60">
            <p className="text-xs text-zinc-500 font-mono truncate px-3 mb-1">
              {user.email}
            </p>
            <p className="text-[10px] text-amber-400 font-mono px-3 mb-2 uppercase tracking-wider">
              Admin
            </p>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60">
        <div className="flex items-center justify-between p-4">
          <Link href="/admin" className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-zinc-50">admin</span>
          </Link>
          <span className="text-xs text-zinc-500 font-mono truncate max-w-[150px]">
            {user.email}
          </span>
        </div>
        <nav className="flex items-center gap-1 px-3 pb-2 overflow-x-auto">
          {adminNav.slice(0, 4).map((item) => (
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

      <main className="flex-1 overflow-auto">
        <div className="pt-[88px] md:pt-0 p-6 md:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
