import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CsvRow {
  created_at: string;
  request_id: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  status_code: number;
  duration_ms: number | null;
  streaming: boolean;
  api_keys: { key_prefix: string | null; name: string | null } | null;
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";
  const keyId = searchParams.get("key");

  const since = (() => {
    const now = Date.now();
    if (range === "24h") return new Date(now - 24 * 3600 * 1000).toISOString();
    if (range === "7d") return new Date(now - 7 * 24 * 3600 * 1000).toISOString();
    if (range === "30d") return new Date(now - 30 * 24 * 3600 * 1000).toISOString();
    return null;
  })();

  let query = supabase
    .from("usage_logs")
    .select(
      "created_at, request_id, prompt_tokens, completion_tokens, total_tokens, cost_usd, status_code, duration_ms, streaming, api_keys(name, key_prefix)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10000);
  if (since) query = query.gte("created_at", since);
  if (keyId && keyId !== "all") query = query.eq("api_key_id", keyId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as CsvRow[];
  const header = [
    "created_at",
    "request_id",
    "key_name",
    "key_prefix",
    "prompt_tokens",
    "completion_tokens",
    "total_tokens",
    "cost_usd",
    "status_code",
    "duration_ms",
    "streaming",
  ].join(",");

  const lines = rows.map((r) =>
    [
      r.created_at,
      escapeCsv(r.request_id ?? ""),
      escapeCsv(r.api_keys?.name ?? ""),
      escapeCsv(r.api_keys?.key_prefix ?? ""),
      r.prompt_tokens,
      r.completion_tokens,
      r.total_tokens,
      r.cost_usd,
      r.status_code,
      r.duration_ms ?? "",
      r.streaming,
    ].join(","),
  );

  const csv = [header, ...lines].join("\n");
  const filename = `codecrack-usage-${range}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
