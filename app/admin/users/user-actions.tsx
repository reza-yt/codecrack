"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setUserRole, setUserStatus } from "../actions";

interface Props {
  userId: string;
  email: string;
  role: "user" | "admin";
  status: "approved" | "suspended" | "waitlist";
}

export function UserActions({ userId, email, role, status }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

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
          title={`Turunkan ${email} menjadi pengguna biasa`}
        >
          Turunkan
        </button>
      ) : (
        <button
          onClick={() => handleRole("admin")}
          disabled={pending}
          className="text-xs px-2 py-0.5 rounded text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
          title={`Jadikan ${email} sebagai admin`}
        >
          Jadikan admin
        </button>
      )}

      {/* Status toggle */}
      {status === "suspended" ? (
        <button
          onClick={() => handleStatus("approved")}
          disabled={pending}
          className="text-xs px-2 py-0.5 rounded text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
        >
          Pulihkan
        </button>
      ) : (
        <button
          onClick={() => handleStatus("suspended")}
          disabled={pending}
          className="text-xs px-2 py-0.5 rounded text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          title={`Tangguhkan ${email}`}
        >
          Tangguhkan
        </button>
      )}
    </div>
  );
}
