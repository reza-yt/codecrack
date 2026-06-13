import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 " +
  "disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-emerald-400 text-zinc-950 hover:bg-emerald-300 shadow-sm shadow-emerald-500/20",
  secondary:
    "bg-zinc-800/80 text-zinc-50 hover:bg-zinc-700 border border-zinc-700/60",
  ghost: "text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/60",
  danger:
    "bg-red-500/90 text-zinc-50 hover:bg-red-500 border border-red-400/30",
  outline:
    "border border-zinc-700/60 text-zinc-100 hover:bg-zinc-800/60 hover:border-zinc-600",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
