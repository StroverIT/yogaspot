import type { TeachingMode } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/** Infers teaching mode for users who onboarded before the choice was stored. */
export async function inferDashboardOnboardingTeachingMode(
  ownerUserId: string,
): Promise<TeachingMode | null> {
  const business = await prisma.business.findUnique({
    where: { ownerUserId },
    select: {
      studios: { select: { teachingMode: true } },
    },
  });

  if (!business || business.studios.length === 0) {
    return null;
  }

  if (business.studios.some(s => s.teachingMode === 'PHYSICAL')) {
    return 'PHYSICAL';
  }

  if (business.studios.some(s => s.teachingMode === 'ONLINE')) {
    return 'ONLINE';
  }

  return null;
}
