"use client";

import { useEffect, useState } from "react";

export function StatusPill() {
  const [status, setStatus] = useState<"operational" | "degraded" | "loading">(
    "loading"
  );

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setStatus(data.status === "ok" ? "operational" : "degraded");
      } catch {
        setStatus("degraded");
      }
    }
    checkHealth();
  }, []);

  if (status === "loading") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-mono text-zinc-500">
        <span className="w-2 h-2 rounded-full bg-zinc-600" />
        memeriksa status...
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-mono ${
        status === "operational" ? "text-emerald-400" : "text-amber-400"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            status === "operational" ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status === "operational" ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
      </span>
      {status === "operational" ? "seluruh sistem operasional" : "performa menurun"}
    </div>
  );
}
