import { Suspense } from 'react';
import { DiscoverCatalogGridSection } from '@/components/discover/discover-catalog-grid-section';
import { DiscoverGridSkeleton } from '@/components/discover/discover-grid-skeleton';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** SSR catalog + grid - only this region suspends (grid skeleton, not aside). */
export function DiscoverMainContent({ searchParams }: Props) {
  return (
    <Suspense fallback={<DiscoverGridSkeleton />}>
      <DiscoverCatalogGridSection searchParams={searchParams} />
    </Suspense>
  );
}
