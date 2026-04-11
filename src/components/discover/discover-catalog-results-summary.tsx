"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { filterDiscoverStudios } from "@/lib/discover-filter-catalog";
import {
  parseDiscoverFiltersFromSearchParams,
  parseUserLocationFromSearchParams,
} from "@/lib/discover-search-params";
import type { Studio, YogaClass } from "@/data/mock-data";

type Props = {
  catalogStudios: Studio[];
  catalogClasses: YogaClass[];
};

export function DiscoverCatalogResultsSummary({ catalogStudios, catalogClasses }: Props) {
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseDiscoverFiltersFromSearchParams(searchParams),
    [searchParams],
  );
  const userLocation = useMemo(
    () => parseUserLocationFromSearchParams(searchParams),
    [searchParams],
  );

  const filteredCount = useMemo(
    () =>
      filterDiscoverStudios(catalogStudios, catalogClasses, filters, userLocation).length,
    [catalogStudios, catalogClasses, filters, userLocation],
  );

  const currentPageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  return (
    <div className="mb-6 flex items-center justify-between">
      <p className="text-yoga-text-soft">
        Намерени <span className="font-semibold text-yoga-text">{filteredCount}</span> студиа
      </p>
      {currentPageFromUrl > 1 && (
        <p className="text-sm text-yoga-text-soft">Страница {currentPageFromUrl}</p>
      )}
    </div>
  );
}
