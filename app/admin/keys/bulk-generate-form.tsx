"use client";

import { useState, useTransition } from "react";
import { Loader2, Copy, Check, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulkGenerateKeys } from "../actions";

const QUOTA_PRESETS = [
  { label: "1JT", value: 1_000_000 },
  { label: "5JT", value: 5_000_000 },
  { label: "10JT", value: 10_000_000 },
  { label: "25JT", value: 25_000_000 },
  { label: "50JT", value: 50_000_000 },
];

const DEFAULT_QUOTA = 10_000_000;

export function BulkGenerateForm() {
  const [pending, startTransition] = useTransition();
  const [count, setCount] = useState(5);
  const [tokenQuota, setTokenQuota] = useState(DEFAULT_QUOTA);
  const [namePrefix, setNamePrefix] = useState("resell");
  const [batchLabel, setBatchLabel] = useState("");

  const [result, setResult] = useState<{
    keys?: Array<{ name: string; fullKey: string; tokenQuota: number }>;
    batchLabel?: string;
    error?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setCopied(false);
    const fd = new FormData();
    fd.set("count", String(count));
    fd.set("tokenQuota", String(tokenQuota));
    fd.set("namePrefix", namePrefix);
    fd.set("batchLabel", batchLabel);

    startTransition(async () => {
      const res = await bulkGenerateKeys(fd);
      setResult(res);
    });
  };

  const csvFromResult = () => {
    if (!result?.keys) return "";
    const header = "nama,api_key,kuota_token,batch\n";
    const rows = result.keys
      .map(
        (k) =>
          `${k.name},${k.fullKey},${k.tokenQuota},${result.batchLabel ?? ""}`
      )
      .join("\n");
    return header + rows;
  };

  const handleCopyAll = async () => {
    if (!result?.keys) return;
    await navigator.clipboard.writeText(
      result.keys.map((k) => k.fullKey).join("\n")
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const csv = csvFromResult();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codecrack-keys-${result?.batchLabel ?? "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (result?.keys && result.keys.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-amber-300">
            <p className="font-medium mb-1">
              Simpan key ini sekarang. Key tidak akan ditampilkan kembali.
            </p>
            <p className="text-amber-300/70">
              Batch:{" "}
              <code className="font-mono">{result.batchLabel}</code> · {result.keys.length}{" "}
              key · {result.keys[0].tokenQuota.toLocaleString("id-ID")} token per key
            </p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 max-h-[280px] overflow-y-auto">
          <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all">
{result.keys.map((k) => k.fullKey).join("\n")}
          </pre>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleCopyAll} size="sm" variant="secondary">
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5" /> Tersalin
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" /> Salin semua key
              </>
            )}
          </Button>
          <Button onClick={handleDownloadCSV} size="sm" variant="secondary">
            <Download className="w-4 h-4 mr-1.5" /> Unduh CSV
          </Button>
          <Button
            onClick={() => {
              setResult(null);
              setCopied(false);
            }}
            size="sm"
            variant="ghost"
          >
            Selesai
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-300 mb-1.5">
            Jumlah key
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value || "1", 10))}
            className="w-full rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-300 mb-1.5">
            Kuota token per key
          </label>
          <input
            type="number"
            min={1}
            value={tokenQuota}
            onChange={(e) =>
              setTokenQuota(parseInt(e.target.value || "0", 10))
            }
            className="w-full rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-50 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {QUOTA_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setTokenQuota(p.value)}
                className={`text-xs px-2 py-0.5 rounded font-mono transition-colors ${
                  tokenQuota === p.value
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-transparent"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Default: 10 juta token per key.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-300 mb-1.5">
            Awalan nama
          </label>
          <input
            type="text"
            value={namePrefix}
            onChange={(e) => setNamePrefix(e.target.value)}
            placeholder="resell"
            className="w-full rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Nama key akan menjadi: {namePrefix}-1, {namePrefix}-2, dan seterusnya.
          </p>
        </div>

        <div>
          <label className="block text-sm text-zinc-300 mb-1.5">
            Label batch{" "}
            <span className="text-zinc-500">(opsional)</span>
          </label>
          <input
            type="text"
            value={batchLabel}
            onChange={(e) => setBatchLabel(e.target.value)}
            placeholder="otomatis: batch-YYYY-MM-DD-xxxx"
            className="w-full rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </div>
      </div>

      {result?.error && (
        <p className="text-sm text-red-400">{result.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Membuat {count} key...
          </span>
        ) : (
          `Buat ${count} key`
        )}
      </Button>
    </form>
  );
}
