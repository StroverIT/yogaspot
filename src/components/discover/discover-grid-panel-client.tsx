"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DiscoverGrid } from "@/components/discover/discover-grid";
import { filterDiscoverStudios } from "@/lib/discover-filter-catalog";
import {
  parseDiscoverFiltersFromSearchParams,
  parseUserLocationFromSearchParams,
} from "@/lib/discover-search-params";
import type { Studio, YogaClass } from "@/data/mock-data";

const ITEMS_PER_PAGE = 6;

type Props = {
  catalogStudios: Studio[];
  catalogClasses: YogaClass[];
};

export function DiscoverGridPanelClient({ catalogStudios, catalogClasses }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const filters = useMemo(
    () => parseDiscoverFiltersFromSearchParams(searchParams),
    [searchParams],
  );
  const userLocation = useMemo(
    () => parseUserLocationFromSearchParams(searchParams),
    [searchParams],
  );
  const urlPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const filteredStudios = useMemo(
    () => filterDiscoverStudios(catalogStudios, catalogClasses, filters, userLocation),
    [catalogStudios, catalogClasses, filters, userLocation],
  );

  const displayedStudios = useMemo(
    () => filteredStudios.slice(0, urlPage * ITEMS_PER_PAGE),
    [filteredStudios, urlPage],
  );

  const hasMore = displayedStudios.length < filteredStudios.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(urlPage + 1));
      router.replace(`${pathname}?${params}`, { scroll: false });
      setIsLoading(false);
    }, 500);
  }, [hasMore, isLoading, pathname, router, searchParams, urlPage]);

  return (
    <DiscoverGrid
      studios={displayedStudios}
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={loadMore}
    />
  );
}
