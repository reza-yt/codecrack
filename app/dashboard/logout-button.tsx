"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-50 transition-colors w-full px-3 py-2 rounded-lg hover:bg-zinc-800/50"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  );
}
