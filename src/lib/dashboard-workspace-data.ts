import { cache } from 'react';
import type { Role } from '@prisma/client';
import type {
  Instructor,
  Retreat,
  ScheduleEntry,
  Studio,
  StudioSubscription,
  SubscriptionRequestDto,
  SubscriptionVideo,
  YogaClass,
} from '@/data/mock-data';
import { listStudioIdsForActor, type SessionUser } from '@/lib/api-auth';
import type { PlatformBillingSummary } from '@/lib/business-platform-billing';
import { getSubscriptionSummaryForOwnerUserId } from '@/lib/business-platform-billing';
import { getStripeConnectSummaryForOwnerUserId, type StripeConnectSummary } from '@/lib/stripe-connect';
import { emptyDashboardBookingRevenue, getDashboardBookingRevenueSummary } from '@/lib/dashboard-booking-revenue';
import type { DashboardBookingRevenue } from '@/lib/dashboard-booking-revenue';
import {
  emptyDashboardMonthlyRevenue,
  getDashboardAllTimeSubscriptionRevenueBgn,
  getDashboardMonthlyRevenue,
  type DashboardMonthlyRevenuePoint,
} from '@/lib/dashboard-monthly-revenue';
import type { DashboardRecentSignup } from '@/lib/dashboard-recent-signups';
import { getDashboardRecentSignups } from '@/lib/dashboard-recent-signups';
import { getDashboardSubscribers, type DashboardSubscriber } from '@/lib/dashboard-subscribers';
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
import { subscriptionVideoToDto } from '@/lib/subscription-video-dto';

export type DashboardWorkspaceData = {
  studios: Studio[];
  instructors: Instructor[];
  classes: YogaClass[];
  retreats: Retreat[];
  schedule: ScheduleEntry[];
  subscriptions: StudioSubscription[];
  subscriptionVideos: SubscriptionVideo[];
  subscriptionRequests: SubscriptionRequestDto[];
  recentSignups: DashboardRecentSignup[];
  bookingRevenue: DashboardBookingRevenue;
  monthlyRevenue: DashboardMonthlyRevenuePoint[];
  allTimeSubscriptionRevenueBgn: number;
  subscribers: DashboardSubscriber[];
  platformBilling: PlatformBillingSummary | null;
  stripeConnect: StripeConnectSummary | null;
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
  const [platformBilling, stripeConnect] =
    user.role === 'business'
      ? await Promise.all([
        getSubscriptionSummaryForOwnerUserId(user.id),
        getStripeConnectSummaryForOwnerUserId(user.id),
      ])
      : [null, null];

  const studioIds = await listStudioIdsForActor(user);
  if (studioIds.length === 0) {
    return {
      studios: [],
      instructors: [],
      classes: [],
      retreats: [],
      schedule: [],
      subscriptions: [],
      subscriptionVideos: [],
      subscriptionRequests: [],
      recentSignups: [],
      bookingRevenue: emptyDashboardBookingRevenue,
      monthlyRevenue: emptyDashboardMonthlyRevenue,
      allTimeSubscriptionRevenueBgn: 0,
      subscribers: [],
      platformBilling,
      stripeConnect,
    };
  }

  const [
    studios,
    instructors,
    classes,
    retreats,
    schedule,
    subscriptions,
    subscriptionVideos,
    subscriptionRequests,
    recentSignups,
    bookingRevenue,
    monthlyRevenue,
    allTimeSubscriptionRevenueBgn,
    subscribers,
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
    prisma.subscriptionVideo.findMany({
      where: { studioId: { in: studioIds } },
      include: { subscriptions: { select: { studioSubscriptionId: true } } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.subscriptionRequest.findMany({
      where: { studioId: { in: studioIds } },
      orderBy: { createdAt: 'desc' },
    }),
    getDashboardRecentSignups(studioIds, 20),
    getDashboardBookingRevenueSummary(studioIds),
    getDashboardMonthlyRevenue(studioIds),
    getDashboardAllTimeSubscriptionRevenueBgn(studioIds),
    getDashboardSubscribers(studioIds),
  ]);

  return {
    studios: studios.map(studioToDashboardDto),
    instructors: instructors.map(instructorToDto),
    classes: classes.map(yogaClassToDto),
    retreats: retreats.map(retreatToDto),
    schedule: schedule.map(scheduleEntryToDto),
    subscriptions: subscriptions.map(subscriptionToDto),
    subscriptionVideos: subscriptionVideos.map(subscriptionVideoToDto),
    subscriptionRequests: subscriptionRequests.map(subscriptionRequestToDto),
    recentSignups,
    bookingRevenue,
    monthlyRevenue,
    allTimeSubscriptionRevenueBgn,
    subscribers,
    platformBilling,
    stripeConnect,
  };
});
