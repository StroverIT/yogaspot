import { Skeleton } from "@/components/ui/skeleton";

function SectionHeadSkeleton() {
  return (
    <div className="mb-10 text-center">
      <Skeleton className="mx-auto h-8 w-64 max-w-[80%] md:h-9" />
      <Skeleton className="mx-auto mt-3 h-5 w-96 max-w-[90%]" />
    </div>
  );
}

export function StudioOfferModeContentSkeleton() {
  return (
    <>
      <section className="border-b border-border py-16 md:py-20">
        <div className="container mx-auto px-4">
          <SectionHeadSkeleton />
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2 md:gap-6">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-muted/30 p-6">
                <Skeleton className="mb-4 h-6 w-32" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <SectionHeadSkeleton />
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="rounded-2xl border border-border p-5 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-5">
                  <Skeleton className="mb-3 h-11 w-11 rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                  <Skeleton className="mt-3 h-16 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <SectionHeadSkeleton />
          <div className="grid gap-8 md:grid-cols-4 md:gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex gap-4 md:block md:text-center">
                <Skeleton className="h-12 w-12 shrink-0 rounded-2xl md:mx-auto md:mb-5 md:h-20 md:w-20" />
                <div className="min-w-0 flex-1 space-y-2 md:pt-0">
                  <Skeleton className="h-5 w-32 md:mx-auto" />
                  <Skeleton className="h-4 w-full md:mx-auto" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="mx-auto mt-12 h-4 w-full max-w-2xl" />
        </div>
      </section>

      <section className="border-t border-border bg-background py-16 md:py-20 lg:py-24">
        <div className="container mx-auto max-w-2xl px-4 lg:max-w-3xl xl:max-w-4xl">
          <div className="mb-8 text-center lg:mb-10">
            <Skeleton className="mx-auto h-8 w-56 md:h-9" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="border-b border-border py-4">
                <Skeleton className="h-5 w-full max-w-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-gradient-to-r from-primary/10 via-primary/5 to-sage/15 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="w-full space-y-3 text-center md:max-w-md md:text-left">
              <Skeleton className="mx-auto h-8 w-72 md:mx-0 md:h-9" />
              <Skeleton className="mx-auto h-4 w-full md:mx-0" />
              <Skeleton className="mx-auto h-4 w-4/5 md:mx-0" />
            </div>
            <Skeleton className="h-14 w-full shrink-0 rounded-xl md:w-64" />
          </div>
        </div>
      </section>
    </>
  );
}
