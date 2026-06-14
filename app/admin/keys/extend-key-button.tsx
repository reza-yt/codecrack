"use client";

import { useState, useTransition } from "react";
import { Loader2, CalendarPlus, Check } from "lucide-react";
import { extendApiKey } from "../actions";

const PRESETS = [
  { label: "+7", days: 7 },
  { label: "+30", days: 30 },
  { label: "+90", days: 90 },
  { label: "+365", days: 365 },
  { label: "Permanen", days: 0 },
];

export function ExtendKeyButton({
  keyId,
  currentExpiresAt,
}: {
  keyId: string;
  currentExpiresAt: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = (days: number) => {
    setError(null);
    startTransition(async () => {
      const res = await extendApiKey(keyId, days);
      if (res.error) {
        setError(res.error);
        return;
      }
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setOpen(false);
      }, 1200);
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
      >
        <CalendarPlus className="w-3 h-3" />
        Perpanjang
      </button>
    );
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <div className="inline-flex items-center gap-1 flex-wrap justify-end">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => onPick(p.days)}
            disabled={pending || done}
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
              done
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : pending
                ? "opacity-60 cursor-not-allowed border-transparent text-zinc-500"
                : "border-zinc-800 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30"
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={pending}
          className="text-[10px] px-1.5 py-0.5 text-zinc-500 hover:text-zinc-300"
        >
          ✕
        </button>
      </div>
      {pending && (
        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
          <Loader2 className="w-3 h-3 animate-spin" /> Menyimpan
        </span>
      )}
      {done && (
        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
          <Check className="w-3 h-3" /> Tersimpan
        </span>
      )}
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
