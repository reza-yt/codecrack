import { Skeleton } from "@/components/spinner";

export default function UsageLoading() {
  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32 shimmer" />
        <Skeleton className="h-4 w-20 shimmer" />
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="border-b border-zinc-800/60 px-4 py-3 flex gap-4">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-4 w-16 shimmer" />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="border-b border-zinc-800/40 last:border-0 px-4 py-2 flex gap-4"
          >
            {[0, 1, 2, 3, 4, 5, 6].map((j) => (
              <Skeleton key={j} className="h-3 w-14 shimmer" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
