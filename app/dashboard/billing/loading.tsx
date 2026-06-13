import { Skeleton } from "@/components/spinner";

export default function BillingLoading() {
  return (
    <div className="fade-in">
      <Skeleton className="h-8 w-32 mb-6 shimmer" />

      {/* Big balance card */}
      <div className="glass rounded-xl p-8 mb-8 text-center">
        <Skeleton className="h-4 w-32 mx-auto mb-3 shimmer" />
        <Skeleton className="h-12 w-48 mx-auto shimmer" />
      </div>

      {/* Top-up box */}
      <div className="glass rounded-xl p-6 mb-8">
        <Skeleton className="h-6 w-24 mb-3 shimmer" />
        <Skeleton className="h-32 w-full shimmer" />
      </div>

      <Skeleton className="h-6 w-40 mb-3 shimmer" />
      <div className="glass rounded-xl overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-b border-zinc-800/40 last:border-0 px-4 py-2 flex justify-between"
          >
            <Skeleton className="h-3 w-24 shimmer" />
            <Skeleton className="h-3 w-16 shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
