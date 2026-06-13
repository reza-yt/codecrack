"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { sendMagicLink } from "./actions";
import { Button } from "@/components/ui/button";

export function LoginForm({ next }: { next?: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await sendMagicLink(fd);
      setResult(r);
    });
  }

  if (result?.ok) {
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-100">
              Check your inbox
            </p>
            <p className="mt-1 text-xs text-emerald-200/70">
              We sent a magic link. It expires in 1 hour. You can close this
              tab.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@domain.dev"
          className="block w-full rounded-md border border-zinc-800/70 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
        />
      </label>
      {next && <input type="hidden" name="next" value={next} />}

      {result && !result.ok && (
        <p className="text-sm text-red-300">{result.message}</p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Sending…" : "Send magic link"}
      </Button>
    </form>
  );
}
