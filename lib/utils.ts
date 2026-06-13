import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a USD number with up to 4 decimals; no currency symbol. */
export function formatUsd(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  if (!isFinite(v as number)) return "0.00";
  const num = v as number;
  // For tiny values show more precision.
  const decimals = Math.abs(num) < 0.01 ? 6 : Math.abs(num) < 1 ? 4 : 2;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format an integer count with thousands separators. */
export function formatInt(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "0";
  return Math.round(n).toLocaleString("en-US");
}

/** Format an ISO timestamp as a short, locale-stable string. */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Relative "x ago" — falls back to absolute on > 30 days. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const d = new Date(iso).getTime();
  if (!d) return "never";
  const diff = Date.now() - d;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatTime(iso);
}
