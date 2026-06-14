"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogle = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Force re-prompt akun chooser supaya kalau user salah pilih
          // gmail bisa ganti tanpa logout dulu.
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }
      // signInWithOAuth bakal redirect, jadi state loading bertahan sampai
      // page navigate ke Google.
    } catch {
      setErrorMessage("Terjadi gangguan jaringan. Silakan coba lagi.");
      setStatus("error");
    }
  };

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <p className="text-sm text-zinc-400 text-center">
        codecrack.dev hanya dapat diakses oleh pemilik. Akun Google selain
        pemilik akan otomatis ditolak setelah login.
      </p>

      <Button
        type="button"
        onClick={handleGoogle}
        disabled={status === "loading"}
        variant="secondary"
        className="w-full"
      >
        {status === "loading" ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Mengarahkan ke Google...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <GoogleIcon className="w-4 h-4" /> Masuk dengan Google
          </span>
        )}
      </Button>

      {status === "error" && (
        <p className="text-sm text-red-400 text-center">{errorMessage}</p>
      )}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.5-1.7 4.4-5.5 4.4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.7 14.5 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}
