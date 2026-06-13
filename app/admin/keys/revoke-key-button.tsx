"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { revokeAdminKey } from "../actions";

export function RevokeKeyButton({ keyId }: { keyId: string }) {
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"idle" | "confirm">("idle");

  const handleClick = () => {
    if (step === "idle") {
      setStep("confirm");
      setTimeout(() => setStep("idle"), 3000);
      return;
    }
    startTransition(async () => {
      await revokeAdminKey(keyId);
      setStep("idle");
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors ${
        step === "confirm"
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : pending
          ? "opacity-60 text-zinc-500 cursor-not-allowed"
          : "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
      }`}
    >
      {pending && <Loader2 className="w-3 h-3 animate-spin" />}
      {step === "confirm" ? "Confirm?" : pending ? "Revoking" : "Revoke"}
    </button>
  );
}
