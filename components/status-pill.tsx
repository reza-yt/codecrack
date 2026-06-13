import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "down" | "muted";

const toneStyles: Record<Tone, { dot: string; text: string; ring: string }> = {
  ok: {
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    ring: "ring-emerald-400/30",
  },
  warn: {
    dot: "bg-amber-400",
    text: "text-amber-300",
    ring: "ring-amber-400/30",
  },
  down: { dot: "bg-red-400", text: "text-red-300", ring: "ring-red-400/30" },
  muted: { dot: "bg-zinc-500", text: "text-zinc-400", ring: "ring-zinc-500/30" },
};

export function StatusPill({
  tone = "ok",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const t = toneStyles[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-zinc-900/60 px-3 py-1 text-xs",
        "border border-zinc-800/80 ring-1",
        t.ring,
        t.text,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-70",
            t.dot,
            "animate-pulse-dot",
          )}
        />
        <span
          className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", t.dot)}
        />
      </span>
      <span className="font-mono tracking-tight">{children}</span>
    </span>
  );
}
