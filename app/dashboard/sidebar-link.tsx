"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  compact?: boolean;
}

export function SidebarLink({
  href,
  icon,
  children,
  compact,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname?.startsWith(href);

  if (compact) {
    return (
      <Link
        href={href}
        className={cn(
          "shrink-0 rounded-md px-3 py-1.5 font-medium transition-colors",
          isActive
            ? "bg-zinc-800/60 text-zinc-50"
            : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100",
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-zinc-800/60 text-zinc-50"
          : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100",
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
