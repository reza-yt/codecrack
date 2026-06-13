"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setErrorMessage("Network error. Try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-emerald-400 text-xl">✉</span>
        </div>
        <h2 className="text-lg font-semibold text-zinc-50 mb-2">
          Check your email
        </h2>
        <p className="text-sm text-zinc-400">
          Magic link sent to{" "}
          <span className="font-mono text-zinc-300">{email}</span>.
          Click it to sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <Button type="submit" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Sending..." : "Send magic link"}
      </Button>
    </form>
  );
}
