import { prisma } from '@/lib/prisma';

type DateRangeInput = {
  from?: Date;
  to?: Date;
};

export type AdminAnalyticsQuery = DateRangeInput & {
  studioId?: string;
};

type TimeSeriesPoint = {
  date: string;
  bookings: number;
  signups: number;
};

export type AdminAnalyticsPayload = {
  overview: {
    totalUsers: number;
    totalBookings: number;
    conversionRate: number;
  };
  userFunnel: {
    signupCompleted: number;
    searchPerformed: number;
    bookingStarted: number;
    bookingCompleted: number;
  };
  studioActivation: {
    totalStudios: number;
    studiosWithProfileCompleted: number;
    studiosWithClass: number;
    profileCompletionRate: number;
    classActivationRate: number;
  };
  businessOnboarding: {
    totalBusinessAccounts: number;
    completedOnboarding: number;
    completionRate: number;
  };
  timeSeries: TimeSeriesPoint[];
  topPerformingStudios: Array<{
    studioId: string;
    bookings: number;
  }>;
};

function asUtcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultDateRange(): Required<DateRangeInput> {
  const to = new Date();
  to.setUTCHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 6);
  from.setUTCHours(0, 0, 0, 0);
  return { from, to };
}

function percentage(part: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((part / total) * 100).toFixed(2));
}

export async function getAdminAnalytics(query: AdminAnalyticsQuery = {}): Promise<AdminAnalyticsPayload> {
  const { from, to } = query.from && query.to ? { from: query.from, to: query.to } : defaultDateRange();

  const eventWhere = {
    ...(query.studioId ? { studio_id: query.studioId } : {}),
    created_at: {
      gte: from,
      lte: to,
    },
  };

  const [totalUsers, classBookings, scheduleBookings, totalStudios, totalBusinessAccounts, businessStudios, userFunnelGrouped, studioProfileEvents, bookingsByDay, signupsByDay, studiosWithClassRows, topPerformingStudios] =
    await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.scheduleEntryBooking.count(),
      prisma.studio.count(),
      prisma.user.count({
        where: { role: 'business' },
      }),
      prisma.business.findMany({
        where: query.studioId ? { studios: { some: { id: query.studioId } } } : { studios: { some: {} } },
        select: { ownerUserId: true },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['event_name'],
        where: {
          ...eventWhere,
          event_name: {
            in: ['signup_completed', 'search_performed', 'booking_started', 'booking_completed'],
          },
        },
        _count: {
          _all: true,
        },
      }),
      prisma.analyticsEvent.findMany({
        where: {
          ...eventWhere,
          event_name: 'studio_profile_completed',
          studio_id: { not: null },
        },
        select: {
          studio_id: true,
        },
      }),
      prisma.analyticsEvent.findMany({
        where: {
          ...eventWhere,
          event_name: 'booking_completed',
        },
        select: {
          created_at: true,
        },
      }),
      prisma.analyticsEvent.findMany({
        where: {
          ...eventWhere,
          event_name: 'signup_completed',
        },
        select: {
          created_at: true,
        },
      }),
      prisma.yogaClass.findMany({
        where: query.studioId ? { studioId: query.studioId } : undefined,
        distinct: ['studioId'],
        select: { studioId: true },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['studio_id'],
        where: {
          ...eventWhere,
          event_name: 'booking_completed',
          studio_id: { not: null },
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            studio_id: 'desc',
          },
        },
        take: 5,
      }),
    ]);

  const funnelMap = new Map(userFunnelGrouped.map((row) => [row.event_name, row._count._all]));

  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(from);
    d.setUTCDate(from.getUTCDate() + idx);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  });

  const bookingByDateMap = new Map<string, number>();
  bookingsByDay.forEach((row) => {
    const key = asUtcDayKey(row.created_at);
    bookingByDateMap.set(key, (bookingByDateMap.get(key) ?? 0) + 1);
  });

  const signupByDateMap = new Map<string, number>();
  signupsByDay.forEach((row) => {
    const key = asUtcDayKey(row.created_at);
    signupByDateMap.set(key, (signupByDateMap.get(key) ?? 0) + 1);
  });

  const timeSeries = days.map((d) => {
    const key = asUtcDayKey(d);
    return {
      date: key,
      bookings: bookingByDateMap.get(key) ?? 0,
      signups: signupByDateMap.get(key) ?? 0,
    };
  });

  const totalBookings = classBookings + scheduleBookings;
  const completedOnboarding = new Set(businessStudios.map((row) => row.ownerUserId)).size;
  const studiosWithProfileCompleted = new Set(studioProfileEvents.map((row) => row.studio_id).filter(Boolean)).size;
  const studiosWithClass = new Set(studiosWithClassRows.map((row) => row.studioId)).size;

  return {
    overview: {
      totalUsers,
      totalBookings,
      conversionRate: percentage(totalBookings, totalUsers),
    },
    userFunnel: {
      signupCompleted: funnelMap.get('signup_completed') ?? 0,
      searchPerformed: funnelMap.get('search_performed') ?? 0,
      bookingStarted: funnelMap.get('booking_started') ?? 0,
      bookingCompleted: funnelMap.get('booking_completed') ?? 0,
    },
    studioActivation: {
      totalStudios,
      studiosWithProfileCompleted,
      studiosWithClass,
      profileCompletionRate: percentage(studiosWithProfileCompleted, totalStudios),
      classActivationRate: percentage(studiosWithClass, totalStudios),
    },
    businessOnboarding: {
      totalBusinessAccounts,
      completedOnboarding,
      completionRate: percentage(completedOnboarding, totalBusinessAccounts),
    },
    timeSeries,
    topPerformingStudios: topPerformingStudios
      .filter((row): row is typeof row & { studio_id: string } => Boolean(row.studio_id))
      .map((row) => ({
        studioId: row.studio_id,
        bookings: row._count._all,
      })),
  };
}
