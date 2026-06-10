import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import type { Instructor, Review, ScheduleEntry, Studio, StudioSubscription, YogaClass } from '@/data/mock-data';
import { getSessionUser } from '@/lib/api-auth';
import { CACHE_TAGS, getPublicStudioTag } from '@/lib/app-revalidate';
import {
  instructorToDto,
  reviewToDto,
  scheduleEntryToDto,
  studioToDto,
  subscriptionToDto,
  yogaClassToDto,
} from '@/lib/public-studio-dto';
import { prisma } from '@/lib/prisma';
import { studioAcceptsMultisport } from '@/lib/multisport';
import { teachingModeFromPrisma } from '@/lib/teaching-mode';
import { trackServerEvent } from '@/lib/server-analytics';
import { isActiveStudioMembershipStatus } from '@/lib/studio-membership';

export type PublicStudioCorePayload = {
  studio: Studio;
  instructors: Instructor[];
  schedule: ScheduleEntry[];
  subscription: StudioSubscription | null;
  myBookings: { classIds: string[]; scheduleEntryIds: string[]; hasActiveMembership: boolean };
  eventsCount: number;
  hasMultisport: boolean;
};

export type PublicStudioExtras = {
  classes: YogaClass[];
  reviews: Review[];
};

export type PublicStudioPayload = PublicStudioCorePayload & PublicStudioExtras;

type LoadedStudioCore = {
  payload: PublicStudioCorePayload;
  userId?: string;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function fetchPublicStudioCore(id: string): Promise<Omit<PublicStudioCorePayload, 'myBookings'> | null> {
  const today = startOfToday();

  const studio = await prisma.studio.findUnique({
    where: { id },
    include: {
      business: { select: { ownerUserId: true } },
      instructors: { orderBy: { name: 'asc' } },
      schedule: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] },
      subscription: true,
      _count: {
        select: {
          classes: { where: { date: { gte: today } } },
        },
      },
    },
  });

  if (!studio) {
    return null;
  }

  const schedule = studio.schedule.map(scheduleEntryToDto);
  const multisportClassCount =
    teachingModeFromPrisma(studio.teachingMode) !== 'online'
      ? await prisma.yogaClass.count({
        where: { studioId: id, date: { gte: today }, acceptsMultisport: true },
      })
      : 0;

  return {
    studio: studioToDto(studio),
    instructors: studio.instructors.map(instructorToDto),
    schedule,
    subscription: studio.subscription ? subscriptionToDto(studio.subscription) : null,
    eventsCount: studio._count.classes,
    hasMultisport:
      studioAcceptsMultisport(studioToDto(studio), schedule)
      || multisportClassCount > 0,
  };
}

async function fetchPublicStudioExtras(id: string): Promise<PublicStudioExtras | null> {
  const today = startOfToday();
  const studio = await prisma.studio.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!studio) {
    return null;
  }

  const [classes, reviews] = await Promise.all([
    prisma.yogaClass.findMany({
      where: { studioId: id, date: { gte: today } },
      orderBy: { date: 'asc' },
      take: 80,
    }),
    prisma.review.findMany({
      where: { targetType: 'studio', targetId: id },
      orderBy: { date: 'desc' },
      take: 50,
      include: { author: { select: { image: true, name: true } } },
    }),
  ]);

  return {
    classes: classes.map(yogaClassToDto),
    reviews: reviews.map(reviewToDto),
  };
}

function getCachedPublicStudioCore(id: string) {
  return unstable_cache(
    async () => fetchPublicStudioCore(id),
    ['public-studio-core', id],
    {
      tags: [CACHE_TAGS.publicStudio, getPublicStudioTag(id)],
      revalidate: 120,
    },
  )();
}

function getCachedPublicStudioExtras(id: string) {
  return unstable_cache(
    async () => fetchPublicStudioExtras(id),
    ['public-studio-extras', id],
    {
      tags: [CACHE_TAGS.publicStudio, getPublicStudioTag(id)],
      revalidate: 120,
    },
  )();
}

async function loadMyBookings(
  userId: string,
  studioId: string,
): Promise<PublicStudioCorePayload['myBookings']> {
  const [classRows, scheduleRows, activeMembership] = await Promise.all([
    prisma.booking.findMany({
      where: { userId, yogaClass: { studioId } },
      select: { yogaClassId: true },
    }),
    prisma.scheduleEntryBooking.findMany({
      where: { userId, scheduleEntry: { studioId } },
      select: { scheduleEntryId: true },
    }),
    prisma.studioMembership.findFirst({
      where: { userId, studioId },
      select: { id: true, status: true },
    }),
  ]);

  return {
    classIds: classRows.map((r) => r.yogaClassId),
    scheduleEntryIds: scheduleRows.map((r) => r.scheduleEntryId),
    hasActiveMembership: Boolean(
      activeMembership && isActiveStudioMembershipStatus(activeMembership.status),
    ),
  };
}

const loadPublicStudioCore = cache(async (id: string): Promise<LoadedStudioCore | null> => {
  const [core, sessionUser] = await Promise.all([getCachedPublicStudioCore(id), getSessionUser()]);

  if (!core) {
    return null;
  }

  const myBookings =
    sessionUser?.id != null
      ? await loadMyBookings(sessionUser.id, core.studio.id)
      : { classIds: [], scheduleEntryIds: [], hasActiveMembership: false };

  return {
    payload: { ...core, myBookings },
    userId: sessionUser?.id,
  };
});

export async function getPublicStudioCorePayload(
  id: string,
  options?: { trackView?: boolean },
): Promise<PublicStudioCorePayload | null> {
  const loaded = await loadPublicStudioCore(id);
  if (!loaded) {
    return null;
  }

  if (options?.trackView) {
    const studioId = loaded.payload.studio.id;
    const userId = loaded.userId;
    const scheduleEntries = loaded.payload.schedule.length;
    void (async () => {
      await trackServerEvent({ eventName: 'studio_view', userId, studioId });
      await trackServerEvent({
        eventName: 'schedule_view',
        userId,
        studioId,
        metadata: { scheduleEntries },
      });
    })();
  }

  return loaded.payload;
}

export async function getPublicStudioExtras(id: string): Promise<PublicStudioExtras | null> {
  return getCachedPublicStudioExtras(id);
}

export async function getPublicStudioPayload(
  id: string,
  options?: { trackView?: boolean },
): Promise<PublicStudioPayload | null> {
  const [core, extras] = await Promise.all([
    getPublicStudioCorePayload(id, options),
    getPublicStudioExtras(id),
  ]);

  if (!core || !extras) {
    return null;
  }

  return { ...core, ...extras };
}
