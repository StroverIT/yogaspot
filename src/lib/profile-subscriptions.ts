import type { StudioMembershipStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ACTIVE_STUDIO_MEMBERSHIP_STATUSES } from '@/lib/studio-membership';

export type ProfileActiveSubscription = {
  id: string;
  studioId: string;
  studioName: string;
  subscriptionName: string;
  monthlyPrice: number;
  durationMonths: number;
  includes: string;
  status: StudioMembershipStatus;
  currentPeriodEnd: string | null;
};

export async function getProfileActiveSubscriptions(userId: string): Promise<ProfileActiveSubscription[]> {
  const memberships = await prisma.studioMembership.findMany({
    where: {
      userId,
      status: { in: [...ACTIVE_STUDIO_MEMBERSHIP_STATUSES] },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      studio: { select: { id: true, name: true } },
      studioSubscription: {
        select: {
          name: true,
          monthlyPrice: true,
          durationMonths: true,
          includes: true,
          subscriptionNote: true,
        },
      },
    },
  });

  return memberships.map((membership) => {
    const plan = membership.studioSubscription;
    const includes = plan?.includes?.trim() || plan?.subscriptionNote?.trim() || '';

    return {
      id: membership.id,
      studioId: membership.studioId,
      studioName: membership.studio.name,
      subscriptionName: plan?.name?.trim() || 'Абонамент',
      monthlyPrice: plan?.monthlyPrice ?? 0,
      durationMonths: plan?.durationMonths ?? 1,
      includes,
      status: membership.status,
      currentPeriodEnd: membership.currentPeriodEnd?.toISOString() ?? null,
    };
  });
}
