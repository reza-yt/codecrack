import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function Spinner({ size = "sm", className, label }: SpinnerProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Loader2
        className={cn("animate-spin text-emerald-400", sizeMap[size])}
        aria-hidden="true"
      />
      {label && <span className="text-sm text-zinc-400">{label}</span>}
      <span className="sr-only">Loading</span>
    </span>
  );
}

interface FullPageSpinnerProps {
  label?: string;
}

export function FullPageSpinner({ label = "Loading..." }: FullPageSpinnerProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 fade-in">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}

/**
 * Skeleton block — shows animated shimmer for content that's loading.
 * Pair with width/height utility classes.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded bg-zinc-800/60 animate-pulse",
        className,
      )}
    />
  );
}
