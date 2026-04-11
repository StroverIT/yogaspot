import { Suspense } from "react";
import { DiscoverCatalogGridSection } from "@/components/discover/discover-catalog-grid-section";
import { DiscoverGridSkeleton } from "@/components/discover/discover-grid-skeleton";

/** SSR catalog + grid — only this region suspends (grid skeleton, not aside). */
export function DiscoverMainContent() {
  return (
    <Suspense fallback={<DiscoverGridSkeleton />}>
      <DiscoverCatalogGridSection />
    </Suspense>
  );
}
