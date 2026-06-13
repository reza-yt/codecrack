import { KeyRound } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { CreateKeyButton } from "./create-key-button";
import { RevokeKeyButton } from "./revoke-key-button";
import { formatTime, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface KeyRow {
  id: string;
  name: string;
  key_prefix: string;
  revoked: boolean;
  last_used_at: string | null;
  created_at: string;
}

export default async function KeysPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, revoked, last_used_at, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const keys: KeyRow[] = (data ?? []) as KeyRow[];

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
            API keys
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Keys
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Limit: 10 active keys. Revoked keys stay listed for audit.
          </p>
        </div>
        <CreateKeyButton />
      </div>

      {error && (
        <p className="text-sm text-red-300">
          Failed to load keys: {error.message}
        </p>
      )}

      {keys.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/30">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/50 text-left text-[11px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Key prefix</th>
                <th className="px-4 py-3 font-medium">Last used</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {keys.map((k) => (
                <tr key={k.id} className="text-zinc-200">
                  <td className="px-4 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                    {k.key_prefix}
                    <span className="text-zinc-600">{"•".repeat(28)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {k.last_used_at ? timeAgo(k.last_used_at) : "never"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {formatTime(k.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {k.revoked ? (
                      <span className="inline-flex items-center rounded-full border border-zinc-700/70 bg-zinc-900/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                        revoked
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                        active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!k.revoked && <RevokeKeyButton keyId={k.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-emerald-400">
        <KeyRound className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-zinc-100">
        No keys yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-400">
        Create your first key to start sending requests through the gateway.
        We&apos;ll show the value once.
      </p>
    </div>
  );
}
