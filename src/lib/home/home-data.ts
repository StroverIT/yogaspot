import { cache } from "react";
import type { Studio, YogaClass } from "@/data/mock-data";
import { getPublicCatalogCached } from "@/lib/get-public-catalog";

/**
 * Per-request dedupe; all home sections share one `getPublicCatalogCached()` read
 * (same pattern as discover).
 */
export const getHomeStudios = cache(async (): Promise<Studio[]> => {
  const { studios } = await getPublicCatalogCached();
  return studios;
});

export const getHomeClasses = cache(async (): Promise<YogaClass[]> => {
  const { classes } = await getPublicCatalogCached();
  return classes;
});

export function computeTopStudios(studios: Studio[], limit = 6): Studio[] {
  return [...studios]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
}
