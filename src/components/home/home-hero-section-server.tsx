import HeroSection from '@/views/HomePage/HeroSection';
import { getHomeHeroStats } from '@/lib/home/home-hero-stats';

export default async function HomeHeroSectionServer() {
  const stats = await getHomeHeroStats();

  return (
    <HeroSection
      studioCount={stats.studioCount}
      classCount={stats.classCount}
      totalEnrolled={stats.totalEnrolled}
      avgRating={stats.avgRating}
      totalReviews={stats.totalReviews}
      yogaStylesCount={stats.yogaStylesCount}
    />
  );
}
