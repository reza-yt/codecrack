import Link from "next/link";
import { Activity, Download } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatInt, formatTime, formatUsd } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const RANGE_PRESETS = ["24h", "7d", "30d", "all"] as const;
type RangePreset = (typeof RANGE_PRESETS)[number];

interface UsageRow {
  id: string;
  created_at: string;
  request_id: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  status_code: number;
  duration_ms: number | null;
  streaming: boolean;
  api_key_id: string | null;
  api_keys: { name: string | null; key_prefix: string | null } | null;
}

function rangeToSince(r: RangePreset): string | null {
  const now = Date.now();
  switch (r) {
    case "24h":
      return new Date(now - 24 * 60 * 60 * 1000).toISOString();
    case "7d":
      return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    case "30d":
      return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    case "all":
    default:
      return null;
  }
}

export default async function UsagePage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    key?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const range: RangePreset = (RANGE_PRESETS as readonly string[]).includes(
    sp.range ?? "",
  )
    ? (sp.range as RangePreset)
    : "30d";
  const keyFilter = sp.key && sp.key !== "all" ? sp.key : null;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const since = rangeToSince(range);

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  // Available keys for the filter dropdown.
  const { data: keysList } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  let query = supabase
    .from("usage_logs")
    .select(
      "id, created_at, request_id, prompt_tokens, completion_tokens, total_tokens, cost_usd, status_code, duration_ms, streaming, api_key_id, api_keys(name, key_prefix)",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (since) query = query.gte("created_at", since);
  if (keyFilter) query = query.eq("api_key_id", keyFilter);

  const { data, count } = await query;
  const rows = (data ?? []) as unknown as UsageRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const csvHref = `/api/dashboard/usage.csv?range=${range}${
    keyFilter ? `&key=${keyFilter}` : ""
  }`;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
            Usage
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Request log
          </h1>
        </div>
        <a
          href={csvHref}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-700/60 px-3 py-1.5 text-xs text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-900/60"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <form
        method="GET"
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-4"
      >
        <Field label="Range">
          <select
            name="range"
            defaultValue={range}
            className="rounded-md border border-zinc-800/70 bg-zinc-950/50 px-2.5 py-1.5 text-sm text-zinc-100 focus:border-emerald-400/50 focus:outline-none"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </Field>
        <Field label="API key">
          <select
            name="key"
            defaultValue={keyFilter ?? "all"}
            className="rounded-md border border-zinc-800/70 bg-zinc-950/50 px-2.5 py-1.5 text-sm text-zinc-100 focus:border-emerald-400/50 focus:outline-none"
          >
            <option value="all">All keys</option>
            {(keysList ?? []).map((k) => (
              <option key={k.id} value={k.id}>
                {k.name} · {k.key_prefix}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="submit"
          className="rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-emerald-300"
        >
          Apply
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/30">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/50 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Key</th>
                  <th className="px-4 py-3 font-medium text-right">In</th>
                  <th className="px-4 py-3 font-medium text-right">Out</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-right">Cost</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Dur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {rows.map((r) => (
                  <tr key={r.id} className="text-zinc-200">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400">
                      {formatTime(r.created_at)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                      {r.api_keys?.key_prefix ?? "—"}
                      {r.streaming && (
                        <span className="ml-2 rounded border border-zinc-700/60 px-1 py-0.5 text-[9px] uppercase tracking-wider text-zinc-500">
                          stream
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {formatInt(r.prompt_tokens)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {formatInt(r.completion_tokens)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-zinc-100">
                      {formatInt(r.total_tokens)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-zinc-100">
                      ${formatUsd(r.cost_usd)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      <StatusBadge code={r.status_code} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-zinc-400">
                      {r.duration_ms != null ? `${r.duration_ms}ms` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800/60 px-4 py-3 text-xs text-zinc-500">
            <span>
              Page {page} of {totalPages} · {formatInt(count ?? 0)} requests
            </span>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={buildHref({
                    range,
                    key: keyFilter,
                    page: page - 1,
                  })}
                  className="rounded border border-zinc-800/70 px-2 py-1 hover:bg-zinc-900/60 hover:text-zinc-200"
                >
                  ← Prev
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildHref({
                    range,
                    key: keyFilter,
                    page: page + 1,
                  })}
                  className="rounded border border-zinc-800/70 px-2 py-1 hover:bg-zinc-900/60 hover:text-zinc-200"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatusBadge({ code }: { code: number }) {
  const ok = code >= 200 && code < 300;
  const cls = ok
    ? "border-emerald-500/20 bg-emerald-400/10 text-emerald-300"
    : "border-red-500/20 bg-red-500/10 text-red-300";
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 ${cls}`}
    >
      {code}
    </span>
  );
}

function buildHref({
  range,
  key,
  page,
}: {
  range: string;
  key: string | null;
  page: number;
}): string {
  const params = new URLSearchParams();
  params.set("range", range);
  if (key) params.set("key", key);
  if (page > 1) params.set("page", String(page));
  return `/dashboard/usage?${params.toString()}`;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-emerald-400">
        <Activity className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-zinc-100">
        No requests yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-400">
        Once you send your first request, it&apos;ll show up here within a few
        seconds.
      </p>
    </div>
  );
}
