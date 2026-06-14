import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/owner";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    // Hard-lock: kalau email yang berhasil tukar code bukan owner,
    // langsung sign-out & redirect ke error page. Defense-in-depth
    // selain trigger handle_new_user di Supabase.
    if (!error && data.user) {
      if (!isAdminEmail(data.user.email)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/auth/error?error=forbidden&error_description=${encodeURIComponent(
            "Akses ditolak. Hanya pemilik yang dapat masuk."
          )}`
        );
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
