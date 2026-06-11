import { buildDiscoverStudiosFromPayload } from '@/lib/discover-studios';
import { getPublicCatalogCached } from '@/lib/get-public-catalog';
import type { DiscoverStudio } from '@/types/studio-discovery';

/** Same catalog cache as home + `/api/public/studios` — avoids stale discover-only results. */
export async function getDiscoverStudiosCached(): Promise<DiscoverStudio[]> {
  const { studios, classes } = await getPublicCatalogCached();
  return buildDiscoverStudiosFromPayload(studios, classes).filter((s) => !s.isHidden);
}
