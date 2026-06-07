import { getHomeRetreats } from '@/lib/home/home-data';
import { pickTopHomeStudioCards } from '@/lib/home/home-studio-card';
import { getPublicCatalogCached } from '@/lib/get-public-catalog';
import NearbyStudiosSectionClient from '@/components/home/nearby-studios-section-client';
import TopStudiosSectionClient from '@/components/home/top-studios-section-client';
import HomeRetreatsSection from '@/views/HomePage/HomeRetreatsSection';

const NEARBY_POOL_SIZE = 12;
const TOP_STUDIOS_SIZE = 6;

export default async function HomeStudiosSectionsServer() {
  const [{ studios, classes }, retreats] = await Promise.all([
    getPublicCatalogCached(),
    getHomeRetreats(5),
  ]);

  const topStudioCards = pickTopHomeStudioCards(studios, classes, TOP_STUDIOS_SIZE);
  const nearbyStudioCards = pickTopHomeStudioCards(studios, classes, NEARBY_POOL_SIZE);

  return (
    <>
      <NearbyStudiosSectionClient studios={nearbyStudioCards} />
      <TopStudiosSectionClient studios={topStudioCards} />
      <HomeRetreatsSection retreats={retreats} />
    </>
  );
}
