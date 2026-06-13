"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  copyable?: boolean;
  caption?: string;
}

export function CodeBlock({
  code,
  language,
  className,
  copyable = true,
  caption,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable; ignore */
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-950/60",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-800/70 bg-zinc-900/40 px-4 py-2 text-[11px] uppercase tracking-widest text-zinc-500">
        <div className="flex items-center gap-2 font-mono">
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          <span>{caption ?? language ?? "shell"}</span>
        </div>
        {copyable && (
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded border border-transparent px-2 py-1 text-zinc-400 transition-colors hover:border-zinc-700/70 hover:text-zinc-100"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono text-[10px]">copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="font-mono text-[10px]">copy</span>
              </>
            )}
          </button>
        )}
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
