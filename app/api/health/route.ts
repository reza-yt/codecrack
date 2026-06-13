import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthResponse {
  status: "ok" | "degraded" | "down";
  gateway: { ok: true };
  upstream: { ok: boolean; status?: number; error?: string };
  checked_at: string;
}

export async function GET() {
  const upstream = await checkUpstream();
  const status: HealthResponse["status"] = upstream.ok ? "ok" : "degraded";

  const body: HealthResponse = {
    status,
    gateway: { ok: true },
    upstream,
    checked_at: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: status === "ok" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function checkUpstream(): Promise<HealthResponse["upstream"]> {
  const base = process.env.HERMES_BASE_URL;
  if (!base) {
    return { ok: false, error: "HERMES_BASE_URL not set" };
  }
  // The /v1/models endpoint is cheap and authenticated similarly to chat.
  // We try /health first (Hermes exposes it), then fall back to /v1/models.
  const candidates = [resolveHealthUrl(base), `${stripV1(base)}/health`];

  for (const url of candidates) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(url, {
        method: "GET",
        signal: ctrl.signal,
        headers: process.env.HERMES_API_KEY
          ? { Authorization: `Bearer ${process.env.HERMES_API_KEY}` }
          : undefined,
        cache: "no-store",
      });
      clearTimeout(t);
      if (res.ok) return { ok: true, status: res.status };
      // Hermes /health may return 200 unauthenticated; non-2xx = degraded.
      return { ok: false, status: res.status };
    } catch (err) {
      // Try next candidate.
      if (url === candidates[candidates.length - 1]) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "fetch failed",
        };
      }
    }
  }
  return { ok: false, error: "no upstream candidates reachable" };
}

function resolveHealthUrl(base: string): string {
  // Prefer the unauthenticated /health on the same host.
  // base is typically https://hermes.codecrack.dev/v1
  try {
    const u = new URL(base);
    return `${u.protocol}//${u.host}/health`;
  } catch {
    return `${stripV1(base)}/health`;
  }
}

function stripV1(base: string): string {
  return base.replace(/\/v1\/?$/, "");
}
