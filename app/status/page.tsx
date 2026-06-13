import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatusPill } from "@/components/status-pill";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Status",
  description: "Live status for codecrack.dev gateway and the Hermes upstream.",
};

// Always render fresh — this hits /api/health.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HealthPayload {
  status: "ok" | "degraded" | "down";
  gateway: { ok: boolean };
  upstream: { ok: boolean; status?: number; error?: string };
  checked_at: string;
}

async function fetchHealth(): Promise<HealthPayload | null> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto =
      h.get("x-forwarded-proto") ??
      (host.startsWith("localhost") ? "http" : "https");
    const res = await fetch(`${proto}://${host}/api/health`, {
      cache: "no-store",
    });
    if (!res.ok && res.status !== 503) return null;
    return (await res.json()) as HealthPayload;
  } catch {
    return null;
  }
}

export default async function StatusPage() {
  const health = await fetchHealth();
  const overall = health?.status ?? "down";
  const tone = overall === "ok" ? "ok" : overall === "degraded" ? "warn" : "down";
  const label =
    overall === "ok"
      ? "all systems operational"
      : overall === "degraded"
        ? "partial outage"
        : "major outage";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          System status
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </h1>

        <div className="mt-6">
          <StatusPill tone={tone}>{label}</StatusPill>
        </div>

        <div className="mt-10 divide-y divide-zinc-800/70 overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/30">
          <Row
            label="Gateway · api.codecrack.dev"
            ok={health?.gateway.ok ?? false}
          />
          <Row
            label="Upstream · hermes.codecrack.dev"
            ok={health?.upstream.ok ?? false}
            extra={
              health?.upstream.error
                ? `error: ${health.upstream.error}`
                : health?.upstream.status
                  ? `HTTP ${health.upstream.status}`
                  : undefined
            }
          />
        </div>

        <p className="mt-6 font-mono text-xs text-zinc-500">
          checked at{" "}
          {health?.checked_at
            ? new Date(health.checked_at).toLocaleString()
            : "—"}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({
  label,
  ok,
  extra,
}: {
  label: string;
  ok: boolean;
  extra?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-sm text-zinc-100">{label}</p>
        {extra && <p className="mt-1 font-mono text-xs text-zinc-500">{extra}</p>}
      </div>
      <StatusPill tone={ok ? "ok" : "down"}>
        {ok ? "operational" : "down"}
      </StatusPill>
    </div>
  );
}
