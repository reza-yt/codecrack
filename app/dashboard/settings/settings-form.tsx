"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateDisplayName } from "./actions";

export function SettingsForm({
  initialName,
}: {
  initialName: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await updateDisplayName(fd);
      setMsg(r);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
          Display name
        </span>
        <input
          name="display_name"
          defaultValue={initialName ?? ""}
          maxLength={80}
          placeholder="how should we call you?"
          className="block w-full max-w-sm rounded-md border border-zinc-800/70 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
        />
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Saving…" : "Save"}
        </Button>
        {msg && (
          <span
            className={`text-sm ${
              msg.ok ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {msg.message}
          </span>
        )}
      </div>
    </form>
  );
}
