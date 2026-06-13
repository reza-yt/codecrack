import { Skeleton } from "@/components/spinner";

export default function KeysLoading() {
  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32 shimmer" />
        <Skeleton className="h-9 w-24 shimmer" />
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="border-b border-zinc-800/60 px-4 py-3">
          <div className="flex gap-6">
            <Skeleton className="h-4 w-16 shimmer" />
            <Skeleton className="h-4 w-24 shimmer" />
            <Skeleton className="h-4 w-20 shimmer" />
            <Skeleton className="h-4 w-20 shimmer" />
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="border-b border-zinc-800/40 last:border-0 px-4 py-3"
          >
            <div className="flex gap-6">
              <Skeleton className="h-4 w-32 shimmer" />
              <Skeleton className="h-4 w-40 shimmer" />
              <Skeleton className="h-4 w-16 shimmer" />
              <Skeleton className="h-4 w-16 shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
