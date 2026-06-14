"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

interface HealthData {
  status: string;
  upstream: string;
  latency_ms?: number;
  timestamp: string;
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth({
          status: "error",
          upstream: "unreachable",
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-50 mb-2">Status sistem</h1>
        <p className="text-zinc-400 mb-8">
          Status real-time gateway codecrack.dev dan layanan model AI.
        </p>

        {loading ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-zinc-400 font-mono text-sm">Memeriksa status...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gateway */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
                  </span>
                  <div>
                    <p className="font-medium text-zinc-50">Gateway</p>
                    <p className="text-xs text-zinc-500 font-mono">api.codecrack.dev</p>
                  </div>
                </div>
                <span className="text-sm font-mono text-emerald-400">operasional</span>
              </div>
            </div>

            {/* Model AI */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        health?.status === "ok" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 ${
                        health?.status === "ok" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                  </span>
                  <div>
                    <p className="font-medium text-zinc-50">Model AI</p>
                    <p className="text-xs text-zinc-500 font-mono">codecrack</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-mono ${
                    health?.status === "ok" ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {health?.status === "ok" ? "operasional" : "performa menurun"}
                </span>
              </div>
              {health?.latency_ms && (
                <p className="text-xs text-zinc-500 font-mono mt-3 pl-6">
                  latensi: {health.latency_ms}ms
                </p>
              )}
            </div>

            {/* Timestamp */}
            <p className="text-xs text-zinc-500 font-mono text-center mt-6">
              Pemeriksaan terakhir: {health?.timestamp ? new Date(health.timestamp).toLocaleString("id-ID") : "—"}
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
