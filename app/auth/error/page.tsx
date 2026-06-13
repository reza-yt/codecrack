import Link from "next/link";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  const description =
    params.error_description ||
    "Something went wrong during sign-in. The link may have expired or already been used.";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass rounded-xl p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-400 text-xl">!</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-50 mb-2">
          Authentication Error
        </h1>
        <p className="text-zinc-400 mb-2">{description}</p>
        {params.error && (
          <p className="text-xs font-mono text-zinc-600 mb-6">
            code: {params.error}
          </p>
        )}
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-4 py-2 transition-colors"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
