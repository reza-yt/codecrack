"use client";

import { useState } from "react";
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
      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
        step === "confirm"
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : step === "loading"
          ? "opacity-50 text-zinc-500"
          : "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
      }`}
    >
      {step === "confirm"
        ? "Confirm revoke?"
        : step === "loading"
        ? "Revoking..."
        : "Revoke"}
    </button>
  );
}
