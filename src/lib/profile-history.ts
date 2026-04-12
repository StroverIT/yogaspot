import { prisma } from '@/lib/prisma';
import { instructorToDto, studioToDto, yogaClassToDto } from '@/lib/public-studio-dto';
import type { Instructor, Studio, YogaClass } from '@/data/mock-data';

export type ProfileHistoryActiveSubscription = {
  studioId: string;
  studioName: string;
  monthlyPrice: number;
  note: string;
};

export type ProfileConfirmedReservation = {
  id: string;
  source: 'class' | 'schedule';
  paymentOrigin: 'online' | 'offline';
  bookedAt: string;
  title: string;
  subtitle: string;
  studioId: string;
  studioName: string;
  amountMinor: number;
  currency: string;
};

export type ProfileHistoryPayload = {
  attendedClasses: { classId: string; attendedDate: string }[];
  classes: YogaClass[];
  instructors: Instructor[];
  studios: Studio[];
  activeSubscriptions: ProfileHistoryActiveSubscription[];
  confirmedReservations: ProfileConfirmedReservation[];
};

export async function getProfileHistoryPayload(userId: string): Promise<ProfileHistoryPayload> {
  const attendances = await prisma.userClassAttendance.findMany({
    where: { userId },
    orderBy: { attendedAt: 'desc' },
    include: {
      yogaClass: {
        include: {
          studio: { include: { business: { select: { ownerUserId: true } } } },
          instructor: true,
        },
      },
    },
  });

  const attendedClasses = attendances.map((a) => ({
    classId: a.yogaClass.id,
    attendedDate: a.attendedAt.toISOString().slice(0, 10),
  }));

  const classMap = new Map<string, YogaClass>();
  const instructorMap = new Map<string, Instructor>();
  const studioMap = new Map<string, Studio>();

  for (const row of attendances) {
    const c = row.yogaClass;
    classMap.set(c.id, yogaClassToDto(c));
    instructorMap.set(c.instructor.id, instructorToDto(c.instructor));
    studioMap.set(c.studio.id, studioToDto(c.studio));
  }

  const [paidClassBookings, paidScheduleBookings, offlineClassBookings, offlineScheduleBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { userId, payment: { status: 'paid' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        payment: true,
        yogaClass: {
          include: {
            studio: { include: { business: { select: { ownerUserId: true } } } },
            instructor: true,
          },
        },
      },
    }),
    prisma.scheduleEntryBooking.findMany({
      where: { userId, payment: { status: 'paid' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        payment: true,
        scheduleEntry: {
          include: {
            studio: { include: { business: { select: { ownerUserId: true } } } },
          },
        },
      },
    }),
    prisma.booking.findMany({
      where: { userId, payment: { is: null } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        yogaClass: {
          include: {
            studio: { include: { business: { select: { ownerUserId: true } } } },
            instructor: true,
          },
        },
      },
    }),
    prisma.scheduleEntryBooking.findMany({
      where: { userId, payment: { is: null } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        scheduleEntry: {
          include: {
            studio: { include: { business: { select: { ownerUserId: true } } } },
          },
        },
      },
    }),
  ]);

  const confirmedReservations: ProfileConfirmedReservation[] = [];

  for (const b of paidClassBookings) {
    const c = b.yogaClass;
    classMap.set(c.id, yogaClassToDto(c));
    instructorMap.set(c.instructor.id, instructorToDto(c.instructor));
    studioMap.set(c.studio.id, studioToDto(c.studio));
    const paidAt = b.payment?.createdAt ?? b.createdAt;
    confirmedReservations.push({
      id: `class-${b.id}`,
      source: 'class',
      paymentOrigin: 'online',
      bookedAt: paidAt.toISOString(),
      title: c.name,
      subtitle: `${c.date.toISOString().slice(0, 10)} · ${c.startTime}–${c.endTime}`,
      studioId: c.studio.id,
      studioName: c.studio.name,
      amountMinor: b.payment?.amount ?? 0,
      currency: b.payment?.currency ?? 'eur',
    });
  }

  for (const b of paidScheduleBookings) {
    const e = b.scheduleEntry;
    studioMap.set(e.studio.id, studioToDto(e.studio));
    const paidAt = b.payment?.createdAt ?? b.createdAt;
    confirmedReservations.push({
      id: `schedule-${b.id}`,
      source: 'schedule',
      paymentOrigin: 'online',
      bookedAt: paidAt.toISOString(),
      title: e.className,
      subtitle: `${e.day} · ${e.startTime}–${e.endTime} (разписание)`,
      studioId: e.studio.id,
      studioName: e.studio.name,
      amountMinor: b.payment?.amount ?? 0,
      currency: b.payment?.currency ?? 'eur',
    });
  }

  for (const b of offlineClassBookings) {
    const c = b.yogaClass;
    classMap.set(c.id, yogaClassToDto(c));
    instructorMap.set(c.instructor.id, instructorToDto(c.instructor));
    studioMap.set(c.studio.id, studioToDto(c.studio));
    confirmedReservations.push({
      id: `class-${b.id}`,
      source: 'class',
      paymentOrigin: 'offline',
      bookedAt: b.createdAt.toISOString(),
      title: c.name,
      subtitle: `${c.date.toISOString().slice(0, 10)} · ${c.startTime}–${c.endTime}`,
      studioId: c.studio.id,
      studioName: c.studio.name,
      amountMinor: 0,
      currency: 'eur',
    });
  }

  for (const b of offlineScheduleBookings) {
    const e = b.scheduleEntry;
    studioMap.set(e.studio.id, studioToDto(e.studio));
    confirmedReservations.push({
      id: `schedule-${b.id}`,
      source: 'schedule',
      paymentOrigin: 'offline',
      bookedAt: b.createdAt.toISOString(),
      title: e.className,
      subtitle: `${e.day} · ${e.startTime}–${e.endTime} (разписание)`,
      studioId: e.studio.id,
      studioName: e.studio.name,
      amountMinor: 0,
      currency: 'eur',
    });
  }

  confirmedReservations.sort((a, b) => (a.bookedAt < b.bookedAt ? 1 : -1));

  const favoriteStudioIds = (
    await prisma.favorite.findMany({
      where: { userId },
      select: { studioId: true },
    })
  ).map((f) => f.studioId);

  const subscriptionRows =
    favoriteStudioIds.length === 0
      ? []
      : await prisma.studioSubscription.findMany({
          where: {
            studioId: { in: favoriteStudioIds },
            hasMonthlySubscription: true,
          },
          include: { studio: { select: { id: true, name: true } } },
        });

  const activeSubscriptions: ProfileHistoryActiveSubscription[] = subscriptionRows.map((sub) => ({
    studioId: sub.studioId,
    studioName: sub.studio.name,
    monthlyPrice: sub.monthlyPrice ?? 0,
    note: sub.subscriptionNote ?? '',
  }));

  return {
    attendedClasses,
    classes: [...classMap.values()],
    instructors: [...instructorMap.values()],
    studios: [...studioMap.values()],
    activeSubscriptions,
    confirmedReservations,
  };
}
