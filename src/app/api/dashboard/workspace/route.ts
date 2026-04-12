import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listStudioIdsForActor, requireRole } from '@/lib/api-auth';
import {
  instructorToDto,
  scheduleEntryToDto,
  studioToDto,
  subscriptionToDto,
  yogaClassToDto,
} from '@/lib/public-studio-dto';
import { subscriptionRequestToDto } from '@/lib/subscription-request-dto';
import { getDashboardRecentSignups } from '@/lib/dashboard-recent-signups';

export const runtime = 'nodejs';

/** Aggregated dashboard payload for the logged-in business (or all studios for admin). */
export async function GET() {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const studioIds = await listStudioIdsForActor(gate.user);
  if (studioIds.length === 0) {
    return NextResponse.json({
      studios: [],
      instructors: [],
      classes: [],
      schedule: [],
      subscriptions: [],
      subscriptionRequests: [],
      recentSignups: [],
    });
  }

  const [studios, instructors, classes, schedule, subscriptions, subscriptionRequests, recentSignups] = await Promise.all([
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
  ]);

  return NextResponse.json({
    studios: studios.map(studioToDto),
    instructors: instructors.map(instructorToDto),
    classes: classes.map(yogaClassToDto),
    schedule: schedule.map(scheduleEntryToDto),
    subscriptions: subscriptions.map(subscriptionToDto),
    subscriptionRequests: subscriptionRequests.map(subscriptionRequestToDto),
    recentSignups,
  });
}
