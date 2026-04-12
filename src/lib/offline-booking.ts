import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type ClassSnapshot = {
  studioId: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
};

export type ScheduleSnapshot = {
  studioId: string;
  className: string;
  day: string;
  startTime: string;
  endTime: string;
};

type ClassLocked = ClassSnapshot & {
  id: string;
  enrolled: number;
  maxCapacity: number;
};

type ScheduleLocked = ScheduleSnapshot & {
  id: string;
  enrolled: number;
  maxCapacity: number;
};

/** Creates Booking without Payment; increments YogaClass.enrolled. */
export async function enrollUserInYogaClassOffline(
  userId: string,
  classId: string,
): Promise<{ studioId: string; classDetail: ClassSnapshot }> {
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

  await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<ClassLocked[]>(
      Prisma.sql`
        SELECT id, "studioId", enrolled, "maxCapacity", name, date, "startTime", "endTime"
        FROM "YogaClass"
        WHERE id = ${classId}
        FOR UPDATE
      `,
    );
    const cls = locked[0];
    if (!cls) {
      throw new Error('CLASS_NOT_FOUND');
    }
    if (cls.enrolled >= cls.maxCapacity) {
      throw new Error('CLASS_FULL');
    }

    await tx.yogaClass.update({
      where: { id: cls.id },
      data: { enrolled: { increment: 1 } },
    });

    await tx.booking.create({
      data: { userId, yogaClassId: cls.id },
    });

    snapshot = {
      studioId: cls.studioId,
      name: cls.name,
      date: cls.date,
      startTime: cls.startTime,
      endTime: cls.endTime,
    };
  });

  if (!snapshot) {
    throw new Error('ENROLL_FAILED');
  }

  return { studioId: snapshot.studioId, classDetail: snapshot };
}

/** Creates ScheduleEntryBooking without Payment; increments ScheduleEntry.enrolled. */
export async function enrollUserInScheduleOffline(
  userId: string,
  scheduleEntryId: string,
  studioId: string,
): Promise<{ studioId: string; scheduleDetail: ScheduleSnapshot }> {
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

  await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<ScheduleLocked[]>(
      Prisma.sql`
        SELECT id, "studioId", enrolled, "maxCapacity", "className", day, "startTime", "endTime"
        FROM "ScheduleEntry"
        WHERE id = ${scheduleEntryId} AND "studioId" = ${studioId}
        FOR UPDATE
      `,
    );
    const entry = locked[0];
    if (!entry) {
      throw new Error('ENTRY_NOT_FOUND');
    }
    if (entry.enrolled >= entry.maxCapacity) {
      throw new Error('CLASS_FULL');
    }

    await tx.scheduleEntry.update({
      where: { id: entry.id },
      data: { enrolled: { increment: 1 } },
    });

    await tx.scheduleEntryBooking.create({
      data: { userId, scheduleEntryId: entry.id },
    });

    snapshot = {
      studioId: entry.studioId,
      className: entry.className,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
    };
  });

  if (!snapshot) {
    throw new Error('ENROLL_FAILED');
  }

  return { studioId: snapshot.studioId, scheduleDetail: snapshot };
}
