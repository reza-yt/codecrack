"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullPageSpinner } from "@/components/spinner";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email ?? "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        setDisplayName(profile?.display_name ?? "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || null })
        .eq("id", user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (loading) {
    return <FullPageSpinner label="Loading settings..." />;
  }

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold text-zinc-50 mb-6">Settings</h1>

      {/* Profile */}
      <div className="glass rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-zinc-50 mb-4">Profile</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-zinc-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-600 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : saved ? (
              "Saved!"
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-500/20 p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Account deletion is permanent. All keys, usage data, and remaining
          credits will be lost. Contact{" "}
          <code className="font-mono text-emerald-400">contact@codecrack.dev</code>{" "}
          to request deletion.
        </p>
        <Button variant="danger" size="sm" disabled>
          Delete account (contact support)
        </Button>
      </div>
    </div>
  );
}
