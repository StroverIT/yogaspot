import { Skeleton } from '@/components/ui/skeleton';

function RetreatCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <Skeleton className="aspect-[16/10] w-full rounded-none bg-muted/60" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-3/4 bg-muted/50" />
        <Skeleton className="h-4 w-full bg-muted/40" />
        <Skeleton className="h-4 w-5/6 bg-muted/40" />
        <Skeleton className="h-10 w-full bg-muted/50" />
      </div>
    </div>
  );
}

export function RetreatsCatalogSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-full max-w-sm rounded-full bg-muted/40" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <RetreatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
