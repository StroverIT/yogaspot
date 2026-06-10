import type { StudioMembershipStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ACTIVE_STUDIO_MEMBERSHIP_STATUSES } from '@/lib/studio-membership';

export type DashboardSubscriber = {
  id: string;
  userName: string;
  userEmail: string | null;
  studioId: string;
  studioName: string;
  subscriptionName: string;
  monthlyPrice: number;
  status: StudioMembershipStatus;
  subscribedAt: string;
};

export async function getDashboardSubscribers(studioIds: string[]): Promise<DashboardSubscriber[]> {
  if (studioIds.length === 0) return [];

  const memberships = await prisma.studioMembership.findMany({
    where: {
      studioId: { in: studioIds },
      status: { in: [...ACTIVE_STUDIO_MEMBERSHIP_STATUSES] },
    },
    orderBy: [{ studio: { name: 'asc' } }, { createdAt: 'desc' }],
    include: {
      user: { select: { name: true, email: true } },
      studio: { select: { id: true, name: true } },
      studioSubscription: {
        select: { name: true, monthlyPrice: true },
      },
    },
  });

  return memberships.map((membership) => ({
    id: membership.id,
    userName: membership.user.name?.trim() || membership.user.email?.trim() || 'Клиент',
    userEmail: membership.user.email,
    studioId: membership.studioId,
    studioName: membership.studio.name,
    subscriptionName: membership.studioSubscription?.name?.trim() || 'Абонамент',
    monthlyPrice: membership.studioSubscription?.monthlyPrice ?? 0,
    status: membership.status,
    subscribedAt: membership.createdAt.toISOString(),
  }));
}
