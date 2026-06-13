import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950",
      secondary:
        "bg-zinc-800 hover:bg-zinc-700 text-zinc-50 border border-zinc-700",
      ghost: "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-50",
      danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
