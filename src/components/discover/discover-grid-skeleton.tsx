import { Skeleton } from "@/components/ui/skeleton";

function DiscoverStudioCardSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-yoga-accent-soft bg-yoga-surface">
      <Skeleton className="h-48 w-full rounded-none bg-yoga-accent-soft/40" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-full max-w-[220px] bg-yoga-accent-soft/40" />
        <Skeleton className="h-4 w-full bg-yoga-accent-soft/30" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-14 rounded-full bg-yoga-accent-soft/40" />
          <Skeleton className="h-5 w-16 rounded-full bg-yoga-accent-soft/40" />
          <Skeleton className="h-5 w-12 rounded-full bg-yoga-accent-soft/40" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the discover results grid only (inside main column). */
export function DiscoverGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <DiscoverStudioCardSkeleton key={i} />
      ))}
    </div>
  );
}
