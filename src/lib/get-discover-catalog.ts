import { unstable_cache } from 'next/cache';

import { buildDiscoverStudiosFromPayload } from '@/lib/discover-studios';
import { getPublicCatalogCached } from '@/lib/get-public-catalog';
import { prisma } from '@/lib/prisma';
import { CACHE_TAGS } from '@/lib/app-revalidate';
import type { DiscoverStudio } from '@/types/studio-discovery';

async function fetchScheduleMultisportByStudio(
  studioIds: string[],
): Promise<Map<string, { acceptsMultisport?: boolean }[]>> {
  if (studioIds.length === 0) return new Map();

  const entries = await prisma.scheduleEntry.findMany({
    where: { studioId: { in: studioIds } },
    select: { studioId: true, acceptsMultisport: true },
  });

  const scheduleByStudio = new Map<string, { acceptsMultisport?: boolean }[]>();
  for (const entry of entries) {
    const list = scheduleByStudio.get(entry.studioId) ?? [];
    list.push({ acceptsMultisport: entry.acceptsMultisport });
    scheduleByStudio.set(entry.studioId, list);
  }

  return scheduleByStudio;
}

async function getDiscoverStudiosImpl(): Promise<DiscoverStudio[]> {
  const { studios, classes } = await getPublicCatalogCached();
  const scheduleByStudio = await fetchScheduleMultisportByStudio(studios.map((s) => s.id));
  return buildDiscoverStudiosFromPayload(studios, classes, scheduleByStudio).filter((s) => !s.isHidden);
}

const getDiscoverStudiosCachedImpl = unstable_cache(getDiscoverStudiosImpl, ['discover-studios'], {
  tags: [CACHE_TAGS.publicCatalog],
  revalidate: 300,
});

/** Same catalog cache as home + `/api/public/studios` — avoids stale discover-only results. */
export async function getDiscoverStudiosCached(): Promise<DiscoverStudio[]> {
  return getDiscoverStudiosCachedImpl();
}
