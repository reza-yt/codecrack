import { Skeleton } from "@/components/spinner";

/**
 * Dashboard loading skeleton — matches the layout in app/dashboard/page.tsx.
 * Next.js automatically renders this during server-side data fetches.
 */
export default function DashboardLoading() {
  return (
    <div className="fade-in">
      <Skeleton className="h-8 w-40 mb-6 shimmer" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass rounded-xl p-5">
            <Skeleton className="h-4 w-24 mb-3 shimmer" />
            <Skeleton className="h-8 w-20 mb-2 shimmer" />
            <Skeleton className="h-3 w-14 shimmer" />
          </div>
        ))}
      </div>

      {/* Quickstart code block placeholder */}
      <Skeleton className="h-6 w-32 mb-3 shimmer" />
      <Skeleton className="h-48 w-full shimmer" />
    </div>
  );
}
