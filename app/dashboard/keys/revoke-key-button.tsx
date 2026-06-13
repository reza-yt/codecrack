"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { revokeApiKey } from "./actions";

export function RevokeKeyButton({ keyId }: { keyId: string }) {
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle");

  const handleClick = async () => {
    if (step === "idle") {
      setStep("confirm");
      // Auto-reset after 3 seconds if not confirmed
      setTimeout(() => setStep("idle"), 3000);
      return;
    }

    if (step === "confirm") {
      setStep("loading");
      await revokeApiKey(keyId);
      setStep("idle");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={step === "loading"}
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors ${
        step === "confirm"
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : step === "loading"
          ? "opacity-60 text-zinc-500 cursor-not-allowed"
          : "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
      }`}
    >
      {step === "loading" && (
        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
      )}
      {step === "confirm"
        ? "Confirm revoke?"
        : step === "loading"
        ? "Revoking"
        : "Revoke"}
    </button>
  );
}
