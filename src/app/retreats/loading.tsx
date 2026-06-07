import { RetreatsCatalogSkeleton } from '@/components/retreats/retreats-catalog-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function RetreatsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-yoga-bg">
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 bg-yoga-accent-soft/40" />
          <Skeleton className="mt-2 h-5 w-full max-w-xl bg-yoga-accent-soft/30" />
        </div>
        <RetreatsCatalogSkeleton />
      </main>
    </div>
  );
}
