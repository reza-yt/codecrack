"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { joinWaitlist } from "./actions";
import { Button } from "@/components/ui/button";

export function WaitlistForm() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await joinWaitlist(formData);
      setResult(r);
    });
  }

  if (result?.ok) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-100">
              {result.message}
            </p>
            <p className="mt-1 text-xs text-emerald-200/70">
              We approve in waves. Watch your inbox.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@domain.dev"
        required
        autoComplete="email"
      />
      <Field
        label="Use case"
        name="use_case"
        placeholder="What are you building? (optional)"
        textarea
      />
      <input type="hidden" name="source" value="landing" />

      {result && !result.ok && (
        <p className="text-sm text-red-300">{result.message}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className="w-full sm:w-auto"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Submitting…" : "Request access"}
      </Button>

      <p className="text-xs text-zinc-500">
        We&apos;ll email you once your account is approved. No spam, no
        marketing.
      </p>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  textarea?: boolean;
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
  textarea,
}: FieldProps) {
  const inputClasses =
    "block w-full rounded-md border border-zinc-800/70 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/30";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={3}
          className={inputClasses}
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={inputClasses}
        />
      )}
    </label>
  );
}
