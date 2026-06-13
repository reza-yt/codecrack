import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hermesUrl = process.env.HERMES_BASE_URL;
  const hermesKey = process.env.HERMES_API_KEY;

  if (!hermesUrl) {
    return NextResponse.json({
      status: "degraded",
      upstream: "not_configured",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const start = Date.now();
    const res = await fetch(`${hermesUrl.replace(/\/v1$/, "")}/health`, {
      headers: hermesKey ? { Authorization: `Bearer ${hermesKey}` } : {},
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;

    if (res.ok) {
      return NextResponse.json({
        status: "ok",
        upstream: "healthy",
        latency_ms: latency,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: "degraded",
      upstream: `unhealthy (${res.status})`,
      latency_ms: latency,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "degraded",
      upstream: "unreachable",
      error: err?.message ?? "timeout",
      timestamp: new Date().toISOString(),
    });
  }
}
