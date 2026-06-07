import { cache } from 'react';
import { getPublicCatalogCached } from '@/lib/get-public-catalog';

export type HomeHeroStats = {
  studioCount: number;
  classCount: number;
  totalEnrolled: number;
  avgRating: string;
  totalReviews: number;
  yogaStylesCount: number;
};

export const getHomeHeroStats = cache(async (): Promise<HomeHeroStats> => {
  const { studios, classes } = await getPublicCatalogCached();
  const totalEnrolled = classes.reduce((sum, yogaClass) => sum + yogaClass.enrolled, 0);
  const totalReviews = studios.reduce((sum, studio) => sum + studio.reviewCount, 0);
  const avgRating =
    totalReviews > 0
      ? (studios.reduce((acc, studio) => acc + studio.rating * studio.reviewCount, 0) / totalReviews).toFixed(1)
      : studios.length > 0
        ? (studios.reduce((acc, studio) => acc + studio.rating, 0) / studios.length).toFixed(1)
        : '0';

  return {
    studioCount: studios.length,
    classCount: classes.length,
    totalEnrolled,
    avgRating,
    totalReviews,
    yogaStylesCount: new Set(classes.map((yogaClass) => yogaClass.yogaType)).size,
  };
});
