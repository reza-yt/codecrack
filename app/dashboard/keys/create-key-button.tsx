"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createApiKey } from "./actions";

export function CreateKeyButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{
    full: string;
    prefix: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setOpen(false);
    setError(null);
    setCreated(null);
    setCopied(false);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await createApiKey(fd);
      if (!r.ok) {
        setError(r.message ?? "Something went wrong.");
        return;
      }
      setCreated({ full: r.full!, prefix: r.prefix! });
    });
  }

  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="h-4 w-4" />
        New key
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => !pending && reset()}
        >
          <div
            className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={reset}
              className="absolute right-4 top-4 rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {!created ? (
              <form onSubmit={onSubmit} className="p-6">
                <h2 className="text-lg font-semibold text-zinc-50">
                  Create API key
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Give this key a name so you can recognize it later. The
                  full key value will be shown <strong>once</strong> after
                  creation.
                </p>

                <label className="mt-6 block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Name
                  </span>
                  <input
                    name="name"
                    required
                    autoFocus
                    maxLength={80}
                    placeholder="laptop · cli"
                    className="block w-full rounded-md border border-zinc-800/70 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  />
                </label>

                {error && (
                  <p className="mt-4 text-sm text-red-300">{error}</p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={reset}
                    disabled={pending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {pending ? "Creating…" : "Create key"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-zinc-50">
                  Save your key now
                </h2>
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <p>
                    This is the only time we&apos;ll show the full key. Copy it
                    now — we store only a hash and cannot recover it later.
                  </p>
                </div>

                <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                  <pre className="overflow-x-auto whitespace-nowrap font-mono text-sm text-emerald-300">
                    {created.full}
                  </pre>
                </div>

                <Button
                  onClick={copy}
                  className="mt-4 w-full"
                  variant={copied ? "secondary" : "primary"}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy key
                    </>
                  )}
                </Button>

                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" onClick={reset}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
