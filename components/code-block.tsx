"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "bash", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800/60">
          <span className="text-xs font-mono text-zinc-500">{filename}</span>
          <span className="text-xs font-mono text-zinc-600">{language}</span>
        </div>
      )}
      <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/60 rounded-xl overflow-hidden">
        {filename && (
          <div className="absolute inset-0 rounded-xl" style={{ borderRadius: 0 }} />
        )}
        <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-300">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-all"
          aria-label="Salin kode"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
