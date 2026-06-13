"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { revokeApiKey } from "./actions";
import { cn } from "@/lib/utils";

export function RevokeKeyButton({ keyId }: { keyId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    if (!confirming) {
      setConfirming(true);
      // Auto-reset after 4s if user doesn't follow through.
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    startTransition(async () => {
      const r = await revokeApiKey(keyId);
      if (!r.ok) {
        setError(r.message ?? "Failed");
        setConfirming(false);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
          confirming
            ? "border-red-400/40 bg-red-500/15 text-red-200 hover:bg-red-500/25"
            : "border-zinc-700/60 text-zinc-400 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200",
        )}
      >
        {pending && <Loader2 className="h-3 w-3 animate-spin" />}
        {pending
          ? "Revoking…"
          : confirming
            ? "Confirm revoke?"
            : "Revoke"}
      </button>
      {error && <p className="text-[10px] text-red-300">{error}</p>}
    </div>
  );
}
