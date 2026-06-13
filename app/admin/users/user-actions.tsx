"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setUserRole, setUserStatus, adjustCredits } from "../actions";

interface Props {
  userId: string;
  email: string;
  role: "user" | "admin";
  status: "approved" | "suspended" | "waitlist";
  balance: number;
}

export function UserActions({ userId, email, role, status, balance }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [newBalance, setNewBalance] = useState(String(balance));

  const handleRole = (newRole: "user" | "admin") => {
    setError("");
    startTransition(async () => {
      const r = await setUserRole(userId, newRole);
      if (r.error) setError(r.error);
    });
  };

  const handleStatus = (newStatus: "approved" | "suspended") => {
    setError("");
    startTransition(async () => {
      const r = await setUserStatus(userId, newStatus);
      if (r.error) setError(r.error);
    });
  };

  const handleCredit = () => {
    setError("");
    startTransition(async () => {
      const r = await adjustCredits(userId, parseFloat(newBalance));
      if (r.error) setError(r.error);
      else setShowCreditDialog(false);
    });
  };

  return (
    <div className="inline-flex items-center gap-1.5 justify-end">
      {pending && <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />}
      {error && <span className="text-xs text-red-400 mr-2" title={error}>⚠</span>}

      {/* Role toggle */}
      {role === "admin" ? (
        <button
          onClick={() => handleRole("user")}
          disabled={pending}
          className="text-xs px-2 py-0.5 rounded text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
          title={`Demote ${email} to user`}
        >
          Demote
        </button>
      ) : (
        <button
          onClick={() => handleRole("admin")}
          disabled={pending}
          className="text-xs px-2 py-0.5 rounded text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
          title={`Promote ${email} to admin`}
        >
          Make admin
        </button>
      )}

      {/* Status toggle */}
      {status === "suspended" ? (
        <button
          onClick={() => handleStatus("approved")}
          disabled={pending}
          className="text-xs px-2 py-0.5 rounded text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
        >
          Unsuspend
        </button>
      ) : (
        <button
          onClick={() => handleStatus("suspended")}
          disabled={pending}
          className="text-xs px-2 py-0.5 rounded text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          title={`Suspend ${email}`}
        >
          Suspend
        </button>
      )}

      {/* Credits */}
      {showCreditDialog ? (
        <div className="inline-flex items-center gap-1">
          <input
            type="number"
            step="0.01"
            min="0"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            className="w-20 rounded bg-zinc-900 border border-zinc-700 px-2 py-0.5 text-xs font-mono"
          />
          <button
            onClick={handleCredit}
            disabled={pending}
            className="text-xs px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 disabled:opacity-50"
          >
            Set
          </button>
          <button
            onClick={() => {
              setShowCreditDialog(false);
              setNewBalance(String(balance));
            }}
            className="text-xs px-2 py-0.5 rounded text-zinc-500"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowCreditDialog(true)}
          disabled={pending}
          className="text-xs px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50 disabled:opacity-50"
        >
          Edit $
        </button>
      )}
    </div>
  );
}
