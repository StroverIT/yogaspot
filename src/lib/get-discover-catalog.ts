import { unstable_cache } from 'next/cache';
import { CACHE_TAGS } from '@/lib/app-revalidate';
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

  return buildDiscoverStudiosFromPayload(
    studios.map(studioToDto),
    classes.map(yogaClassToDto),
  ).filter((s) => !s.isHidden);
}

const getDiscoverStudiosCachedImpl = unstable_cache(fetchDiscoverStudios, ['discover-studios'], {
  tags: [CACHE_TAGS.publicCatalog],
  revalidate: 300,
});

export async function getDiscoverStudiosCached(): Promise<DiscoverStudio[]> {
  return getDiscoverStudiosCachedImpl();
}
