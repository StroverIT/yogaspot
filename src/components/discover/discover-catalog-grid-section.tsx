import { DiscoverCatalogResultsSummary } from '@/components/discover/discover-catalog-results-summary';
import { DiscoverGridPanelClient } from '@/components/discover/discover-grid-panel-client';
import { applyDiscoverFilters } from '@/lib/discover-filter-catalog';
import { getDiscoverStudiosCached } from '@/lib/get-discover-catalog';
import {
  discoverSearchParamsFromPage,
  parseDiscoverFiltersFromSearchParams,
  parseUserLocationFromSearchParams,
} from '@/lib/discover-search-params';

export const DISCOVER_ITEMS_PER_PAGE = 6;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function DiscoverCatalogGridSection({ searchParams }: Props) {
  const sp = discoverSearchParamsFromPage(await searchParams);
  const filters = parseDiscoverFiltersFromSearchParams(sp);
  const userLocation = parseUserLocationFromSearchParams(sp);
  const urlPage = Math.max(1, parseInt(sp.get('page') || '1', 10));

  const allStudios = await getDiscoverStudiosCached();
  const filteredStudios = applyDiscoverFilters(allStudios, filters, userLocation);
  const displayedStudios = filteredStudios.slice(0, urlPage * DISCOVER_ITEMS_PER_PAGE);
  const hasMore = displayedStudios.length < filteredStudios.length;

  return (
    <>
      <DiscoverCatalogResultsSummary
        filteredCount={filteredStudios.length}
        currentPage={urlPage}
      />
      <DiscoverGridPanelClient
        studios={displayedStudios}
        hasMore={hasMore}
        currentPage={urlPage}
      />
    </>
  );
}
