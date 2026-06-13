"use client";

import { useState } from "react";
import { Plus, Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createApiKey } from "./actions";

export function CreateKeyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ fullKey?: string; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const res = await createApiKey(name);
    setResult(res);
    setLoading(false);
  };

  const handleCopy = async () => {
    if (result?.fullKey) {
      await navigator.clipboard.writeText(result.fullKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setName("");
    setResult(null);
    setCopied(false);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="sm">
        <Plus className="w-4 h-4 mr-1.5" />
        New key
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="glass rounded-xl p-6 w-full max-w-md">
        {result?.fullKey ? (
          /* Success state — show key once */
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                Copy this key now. You won&apos;t be able to see it again.
              </p>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/80 border border-zinc-700 mb-4">
              <code className="text-sm font-mono text-emerald-400 break-all flex-1">
                {result.fullKey}
              </code>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-zinc-700 transition-colors flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            </div>
            <Button onClick={handleClose} variant="secondary" className="w-full">
              Done
            </Button>
          </div>
        ) : (
          /* Create form */
          <div>
            <h3 className="text-lg font-semibold text-zinc-50 mb-4">
              Create API Key
            </h3>
            {result?.error && (
              <p className="text-sm text-red-400 mb-3">{result.error}</p>
            )}
            <div className="mb-4">
              <label className="block text-sm text-zinc-300 mb-1.5">
                Key name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. dev-machine, ci-pipeline"
                className="w-full rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleClose}
                variant="ghost"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
