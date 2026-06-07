import { DiscoverGridSkeleton } from '@/components/discover/discover-grid-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function DiscoverLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-yoga-bg">
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 bg-yoga-accent-soft/40" />
          <Skeleton className="mt-2 h-5 w-full max-w-lg bg-yoga-accent-soft/30" />
        </div>

        <div className="flex gap-8">
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-24 space-y-4 rounded-xl border border-yoga-accent-soft bg-yoga-surface p-6">
              <Skeleton className="h-6 w-24 bg-yoga-accent-soft/40" />
              <Skeleton className="h-10 w-full bg-yoga-accent-soft/30" />
              <Skeleton className="h-10 w-full bg-yoga-accent-soft/30" />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <Skeleton className="mb-6 h-10 w-full lg:hidden bg-yoga-accent-soft/30" />
            <Skeleton className="mb-6 h-5 w-48 bg-yoga-accent-soft/30" />
            <DiscoverGridSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
