"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("waitlist").insert({
        email: email.trim().toLowerCase(),
        use_case: useCase.trim() || null,
        source: "website",
      });

      if (error) {
        if (error.code === "23505") {
          setErrorMessage("Email ini udah di-waitlist. Tunggu approval ya.");
        } else {
          setErrorMessage("Something went wrong. Try again.");
        }
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage("Network error. Try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-emerald-400 text-xl">✓</span>
        </div>
        <h2 className="text-lg font-semibold text-zinc-50 mb-2">
          You&apos;re on the list
        </h2>
        <p className="text-sm text-zinc-400">
          Kita review manual — expect an email kalau approved.
          Biasanya 24-48 jam.
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
      <div>
        <label htmlFor="use_case" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Use case <span className="text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="use_case"
          rows={3}
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          placeholder="Mau pakai buat apa? CLI tool, plugin, automation..."
          className="w-full rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <Button type="submit" disabled={status === "loading"} className="w-full">
        {status === "loading" ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
          </span>
        ) : (
          "Join waitlist"
        )}
      </Button>
    </form>
  );
}
