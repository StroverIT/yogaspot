import { unstable_cache } from 'next/cache';
import { CACHE_TAGS } from '@/lib/app-revalidate';
import { filterPublicBusinessIds } from '@/lib/business-platform-billing';
import { buildDiscoverStudiosFromPayload } from '@/lib/discover-studios';
import { studioToDto, yogaClassToDto } from '@/lib/public-studio-dto';
import { prisma } from '@/lib/prisma';
import type { DiscoverStudio } from '@/types/studio-discovery';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function fetchDiscoverStudios(): Promise<DiscoverStudio[]> {
  const today = startOfToday();

  const [studios, classes] = await Promise.all([
    prisma.studio.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: 'desc' },
      include: { business: { select: { ownerUserId: true } } },
    }),
    prisma.yogaClass.findMany({
      where: {
        date: { gte: today },
        studio: { isHidden: false },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 500,
    }),
  ]);

  const listedBusinessIds = await filterPublicBusinessIds(studios.map((s) => s.businessId));
  const visibleStudios = studios.filter((s) => listedBusinessIds.has(s.businessId));
  const visibleStudioIds = new Set(visibleStudios.map((s) => s.id));

  return buildDiscoverStudiosFromPayload(
    visibleStudios.map(studioToDto),
    classes.filter((c) => visibleStudioIds.has(c.studioId)).map(yogaClassToDto),
  ).filter((s) => !s.isHidden);
}

const getDiscoverStudiosCachedImpl = unstable_cache(fetchDiscoverStudios, ['discover-studios'], {
  tags: [CACHE_TAGS.publicCatalog],
  revalidate: 300,
});

export async function getDiscoverStudiosCached(): Promise<DiscoverStudio[]> {
  return getDiscoverStudiosCachedImpl();
}
