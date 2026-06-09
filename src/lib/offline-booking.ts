import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isClassAtCapacity } from '@/lib/yoga-class-limits';

export type ClassSnapshot = {
  studioId: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  /** List price in BGN (same unit as dashboard / Stripe base). */
  basePriceBgn: number;
};

export type ScheduleSnapshot = {
  studioId: string;
  className: string;
  day: string;
  startTime: string;
  endTime: string;
  basePriceBgn: number;
};

type ClassLocked = {
  id: string;
  studioId: string;
  enrolled: number;
  maxCapacity: number;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
};

type ScheduleLocked = {
  id: string;
  studioId: string;
  enrolled: number;
  maxCapacity: number;
  className: string;
  day: string;
  startTime: string;
  endTime: string;
  price: number;
};

/** Creates Booking without Payment; increments YogaClass.enrolled. */
export async function enrollUserInYogaClassOffline(
  userId: string,
  classId: string,
): Promise<{ studioId: string; bookingId: string; classDetail: ClassSnapshot }> {
  const existing = await prisma.booking.findUnique({
    where: { userId_yogaClassId: { userId, yogaClassId: classId } },
    select: { id: true },
  });
  if (existing) {
    const err = new Error('ALREADY_BOOKED');
    err.name = 'BookingConflict';
    throw err;
  }

  let snapshot: ClassSnapshot | null = null;
  let bookingId = '';

  await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<ClassLocked[]>(
      Prisma.sql`
        SELECT id, "studioId", enrolled, "maxCapacity", name, date, "startTime", "endTime", price
        FROM "YogaClass"
        WHERE id = ${classId}
        FOR UPDATE
      `,
    );
    const cls = locked[0];
    if (!cls) {
      throw new Error('CLASS_NOT_FOUND');
    }
    if (isClassAtCapacity(cls.enrolled, cls.maxCapacity)) {
      throw new Error('CLASS_FULL');
    }

    await tx.yogaClass.update({
      where: { id: cls.id },
      data: { enrolled: { increment: 1 } },
    });

    const booking = await tx.booking.create({
      data: { userId, yogaClassId: cls.id },
    });
    bookingId = booking.id;

    snapshot = {
      studioId: cls.studioId,
      name: cls.name,
      date: cls.date,
      startTime: cls.startTime,
      endTime: cls.endTime,
      basePriceBgn: Number(cls.price) || 0,
    };
  });

  if (!snapshot) {
    throw new Error('ENROLL_FAILED');
  }

  return { studioId: snapshot.studioId, bookingId, classDetail: snapshot };
}

/** Creates ScheduleEntryBooking without Payment; increments ScheduleEntry.enrolled. */
export async function enrollUserInScheduleOffline(
  userId: string,
  scheduleEntryId: string,
  studioId: string,
): Promise<{ studioId: string; bookingId: string; scheduleDetail: ScheduleSnapshot }> {
  const existing = await prisma.scheduleEntryBooking.findUnique({
    where: { userId_scheduleEntryId: { userId, scheduleEntryId } },
    select: { id: true },
  });
  if (existing) {
    const err = new Error('ALREADY_BOOKED');
    err.name = 'BookingConflict';
    throw err;
  }

  let snapshot: ScheduleSnapshot | null = null;
  let bookingId = '';

  await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<ScheduleLocked[]>(
      Prisma.sql`
        SELECT id, "studioId", enrolled, "maxCapacity", "className", day, "startTime", "endTime", price
        FROM "ScheduleEntry"
        WHERE id = ${scheduleEntryId} AND "studioId" = ${studioId}
        FOR UPDATE
      `,
    );
    const entry = locked[0];
    if (!entry) {
      throw new Error('ENTRY_NOT_FOUND');
    }
    if (isClassAtCapacity(entry.enrolled, entry.maxCapacity)) {
      throw new Error('CLASS_FULL');
    }

    await tx.scheduleEntry.update({
      where: { id: entry.id },
      data: { enrolled: { increment: 1 } },
    });

    const booking = await tx.scheduleEntryBooking.create({
      data: { userId, scheduleEntryId: entry.id },
    });
    bookingId = booking.id;

    snapshot = {
      studioId: entry.studioId,
      className: entry.className,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      basePriceBgn: Number(entry.price) || 0,
    };
  });

  if (!snapshot) {
    throw new Error('ENROLL_FAILED');
  }

  return { studioId: snapshot.studioId, bookingId, scheduleDetail: snapshot };
}
