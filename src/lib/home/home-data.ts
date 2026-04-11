import { cache } from "react";
import { mockStudios, mockClasses, type Studio, type YogaClass } from "@/data/mock-data";

/** Per-request dedupe when multiple home sections load the same lists. */
export const getHomeStudios = cache(async (): Promise<Studio[]> => mockStudios);

export const getHomeClasses = cache(async (): Promise<YogaClass[]> => mockClasses);

export function computeTopStudios(studios: Studio[], limit = 6): Studio[] {
  return [...studios]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
}
