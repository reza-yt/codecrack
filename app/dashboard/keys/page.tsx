import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Key } from "lucide-react";
import { CreateKeyButton } from "./create-key-button";
import { RevokeKeyButton } from "./revoke-key-button";
import { formatRelativeTime } from "@/lib/utils";

export default async function KeysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: keys } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const activeKeys = keys?.filter((k) => !k.revoked) ?? [];
  const revokedKeys = keys?.filter((k) => k.revoked) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">API Keys</h1>
        <CreateKeyButton />
      </div>

      {activeKeys.length === 0 && revokedKeys.length === 0 ? (
        /* Empty state */
        <div className="glass rounded-xl p-12 text-center">
          <Key className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">No API keys yet</p>
          <p className="text-xs text-zinc-500">
            Create a key to start using the gateway.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active keys */}
          {activeKeys.length > 0 && (
            <div className="glass rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left px-4 py-3 text-zinc-400 font-normal">Name</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-normal">Key</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-normal hidden sm:table-cell">Last used</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-normal hidden sm:table-cell">Created</th>
                    <th className="text-right px-4 py-3 text-zinc-400 font-normal">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeKeys.map((key) => (
                    <tr key={key.id} className="border-b border-zinc-800/40 last:border-0">
                      <td className="px-4 py-3 text-zinc-300">{key.name}</td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs text-zinc-400">
                          {key.key_prefix}...
                        </code>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell">
                        {key.last_used_at ? formatRelativeTime(key.last_used_at) : "Never"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell">
                        {formatRelativeTime(key.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RevokeKeyButton keyId={key.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Revoked keys */}
          {revokedKeys.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-3">
                Revoked ({revokedKeys.length})
              </h3>
              <div className="glass rounded-xl overflow-hidden opacity-60">
                <table className="w-full text-sm">
                  <tbody>
                    {revokedKeys.map((key) => (
                      <tr key={key.id} className="border-b border-zinc-800/40 last:border-0">
                        <td className="px-4 py-2 text-zinc-500">{key.name}</td>
                        <td className="px-4 py-2">
                          <code className="font-mono text-xs text-zinc-600 line-through">
                            {key.key_prefix}...
                          </code>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="text-xs text-zinc-600">revoked</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
