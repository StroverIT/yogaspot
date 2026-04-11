import { Skeleton } from "@/components/ui/skeleton";

function StudioCardRowSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-yoga-accent-soft bg-yoga-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none bg-yoga-accent-soft/40" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-full max-w-[200px] bg-yoga-accent-soft/40" />
        <Skeleton className="h-4 w-full bg-yoga-accent-soft/30" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full bg-yoga-accent-soft/40" />
          <Skeleton className="h-5 w-20 rounded-full bg-yoga-accent-soft/40" />
        </div>
      </div>
    </div>
  );
}

export function HomeHeroSectionSkeleton() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-muted/40" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <Skeleton className="h-12 w-full max-w-lg bg-yoga-accent-soft/35" />
            <Skeleton className="h-12 w-4/5 max-w-md bg-yoga-accent-soft/30" />
            <Skeleton className="h-24 w-full max-w-xl bg-yoga-accent-soft/25" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-14 w-full rounded-xl sm:max-w-[220px] bg-yoga-accent-soft/40" />
              <Skeleton className="h-14 w-full rounded-xl sm:max-w-[240px] bg-yoga-accent-soft/30" />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm"
                >
                  <Skeleton className="mb-2 h-5 w-5 rounded bg-yoga-accent-soft/40" />
                  <Skeleton className="mb-2 h-8 w-16 bg-yoga-accent-soft/45" />
                  <Skeleton className="h-4 w-28 bg-yoga-accent-soft/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeNearbyStudiosSectionSkeleton() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <Skeleton className="h-9 w-56 max-w-[70%] bg-yoga-accent-soft/40" />
          <Skeleton className="h-10 w-32 rounded-md bg-yoga-accent-soft/30" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <StudioCardRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeTopStudiosSectionSkeleton() {
  return (
    <section className="bg-card py-20">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <Skeleton className="h-9 w-48 max-w-[60%] bg-yoga-accent-soft/40" />
          <Skeleton className="h-10 w-32 rounded-md bg-yoga-accent-soft/30" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <StudioCardRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
