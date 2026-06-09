import { Skeleton } from "@/components/ui/skeleton";
import { StudioOfferModeContentSkeleton } from "@/views/StudioOfferPage/StudioOfferModeContentSkeleton";

function HeroSectionSkeleton() {
  return (
    <section className="relative overflow-hidden border-b border-border py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-yoga-bg to-sage/10" />
      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full max-w-lg md:h-14" />
            <Skeleton className="h-10 w-4/5 max-w-md md:h-12" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full max-w-xl" />
              <Skeleton className="h-5 w-full max-w-xl" />
              <Skeleton className="h-5 w-3/4 max-w-lg" />
            </div>
            <Skeleton className="h-14 w-full max-w-xs rounded-xl" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur-sm"
                >
                  <Skeleton className="h-7 w-12" />
                  <Skeleton className="mt-2 h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              <Skeleton className="h-10 w-full rounded-none" />
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
            </div>
            <Skeleton className="mx-auto mt-3 h-3 w-64" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ModeToggleSkeleton() {
  return (
    <section className="border-b border-border bg-background py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Skeleton className="mx-auto h-7 w-48 md:h-8" />
          <Skeleton className="mx-auto mt-2 h-5 w-72 max-w-full" />
          <div className="mt-6 inline-flex w-full max-w-md rounded-2xl border border-border bg-muted/40 p-1.5">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSectionSkeleton() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-sage/15 px-6 py-10 text-center md:px-12 md:py-14">
          <Skeleton className="mx-auto h-4 w-40" />
          <Skeleton className="mx-auto mt-4 h-16 w-24 md:h-20" />
          <Skeleton className="mx-auto mt-3 h-6 w-64 max-w-full" />
          <Skeleton className="mx-auto mt-3 h-5 w-56 max-w-full" />
          <Skeleton className="mx-auto mt-8 h-14 w-full max-w-xs rounded-xl" />
        </div>
      </div>
    </section>
  );
}

export function StudioOfferPageSkeleton() {
  return (
    <div className="font-body bg-yoga-bg">
      <HeroSectionSkeleton />
      <ModeToggleSkeleton />
      <StudioOfferModeContentSkeleton />
      <PricingSectionSkeleton />
    </div>
  );
}
