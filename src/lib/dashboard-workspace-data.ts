import { cache } from 'react';
import type { Role } from '@prisma/client';
import type {
  Instructor,
  Retreat,
  ScheduleEntry,
  Studio,
  StudioSubscription,
  SubscriptionRequestDto,
  YogaClass,
} from '@/data/mock-data';
import { listStudioIdsForActor, type SessionUser } from '@/lib/api-auth';
import type { PlatformBillingSummary } from '@/lib/business-platform-billing';
import { getSubscriptionSummaryForOwnerUserId } from '@/lib/business-platform-billing';
import { emptyDashboardBookingRevenue, getDashboardBookingRevenueSummary } from '@/lib/dashboard-booking-revenue';
import type { DashboardBookingRevenue } from '@/lib/dashboard-booking-revenue';
import type { DashboardRecentSignup } from '@/lib/dashboard-recent-signups';
import { getDashboardRecentSignups } from '@/lib/dashboard-recent-signups';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';
import { prisma } from '@/lib/prisma';
import {
  instructorToDto,
  retreatToDto,
  scheduleEntryToDto,
  studioToDto,
  subscriptionToDto,
  yogaClassToDto,
} from '@/lib/public-studio-dto';
import type { Studio as PrismaStudio } from '@prisma/client';
import { subscriptionRequestToDto } from '@/lib/subscription-request-dto';

export type DashboardWorkspaceData = {
  studios: Studio[];
  instructors: Instructor[];
  classes: YogaClass[];
  retreats: Retreat[];
  schedule: ScheduleEntry[];
  subscriptions: StudioSubscription[];
  subscriptionRequests: SubscriptionRequestDto[];
  recentSignups: DashboardRecentSignup[];
  bookingRevenue: DashboardBookingRevenue;
  onlinePayments: boolean;
  platformBilling: PlatformBillingSummary | null;
};

type WorkspaceActor = SessionUser & { id: string; role: Role };

function studioToDashboardDto(
  s: PrismaStudio & { business?: { ownerUserId: string } },
): Studio {
  return {
    ...studioToDto(s),
    zoomMeetingUrl: s.zoomMeetingUrl ?? null,
  };
}

export const getDashboardWorkspaceData = cache(async function getDashboardWorkspaceData(
  user: WorkspaceActor,
): Promise<DashboardWorkspaceData> {
  const platformBilling =
    user.role === 'business' ? await getSubscriptionSummaryForOwnerUserId(user.id) : null;

  const studioIds = await listStudioIdsForActor(user);
  if (studioIds.length === 0) {
    return {
      studios: [],
      instructors: [],
      classes: [],
      retreats: [],
      schedule: [],
      subscriptions: [],
      subscriptionRequests: [],
      recentSignups: [],
      bookingRevenue: emptyDashboardBookingRevenue,
      onlinePayments: isOnlinePaymentsEnabled(),
      platformBilling,
    };
  }

  const [
    studios,
    instructors,
    classes,
    retreats,
    schedule,
    subscriptions,
    subscriptionRequests,
    recentSignups,
    bookingRevenue,
  ] = await Promise.all([
    prisma.studio.findMany({
      where: { id: { in: studioIds } },
      orderBy: { createdAt: 'desc' },
      include: { business: { select: { ownerUserId: true } } },
    }),
    prisma.instructor.findMany({
      where: { studioId: { in: studioIds } },
      orderBy: { name: 'asc' },
    }),
    prisma.yogaClass.findMany({
      where: { studioId: { in: studioIds } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.retreat.findMany({
      where: { studioId: { in: studioIds } },
      orderBy: [{ createdAt: 'desc' }, { startDate: 'asc' }],
    }),
    prisma.scheduleEntry.findMany({
      where: { studioId: { in: studioIds } },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.studioSubscription.findMany({
      where: { studioId: { in: studioIds } },
    }),
    prisma.subscriptionRequest.findMany({
      where: { studioId: { in: studioIds } },
      orderBy: { createdAt: 'desc' },
    }),
    getDashboardRecentSignups(studioIds, 20),
    getDashboardBookingRevenueSummary(studioIds),
  ]);

  return {
    studios: studios.map(studioToDashboardDto),
    instructors: instructors.map(instructorToDto),
    classes: classes.map(yogaClassToDto),
    retreats: retreats.map(retreatToDto),
    schedule: schedule.map(scheduleEntryToDto),
    subscriptions: subscriptions.map(subscriptionToDto),
    subscriptionRequests: subscriptionRequests.map(subscriptionRequestToDto),
    recentSignups,
    bookingRevenue,
    onlinePayments: isOnlinePaymentsEnabled(),
    platformBilling,
  };
});
