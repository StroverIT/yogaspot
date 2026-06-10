import type Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { runBookingNotifications } from '@/lib/booking-notifications';
import { getStripe } from '@/lib/stripe-server';
import { trackServerEvent } from '@/lib/server-analytics';

function paymentIntentIdFromSession(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent;
  if (typeof pi === 'string') return pi;
  if (pi && typeof pi === 'object' && 'id' in pi && typeof (pi as { id: unknown }).id === 'string') {
    return (pi as { id: string }).id;
  }
  return null;
}

async function refundPaymentIntent(paymentIntentId: string | null | undefined, reason: string): Promise<void> {
  if (!paymentIntentId) return;
  try {
    const stripe = getStripe();
    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      metadata: { reason },
    });
  } catch (err) {
    console.error('[booking checkout] refund failed', reason, err);
  }
}

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

type RetreatLocked = {
  id: string;
  studioId: string;
  enrolled: number;
  maxCapacity: number;
  title: string;
  price: number;
};

export async function fulfillClassBooking(session: Stripe.Checkout.Session, md: Record<string, string>): Promise<void> {
  const amountTotal = session.amount_total;
  if (amountTotal == null || amountTotal <= 0) {
    console.error('[booking checkout] invalid amount_total', session.id);
    return;
  }

  const expectedFromMeta = md.amountCents != null && md.amountCents !== '' ? parseInt(md.amountCents, 10) : NaN;
  if (Number.isFinite(expectedFromMeta) && expectedFromMeta !== amountTotal) {
    console.error('[booking checkout] amount mismatch', { sessionId: session.id, expectedFromMeta, amountTotal });
    await refundPaymentIntent(paymentIntentIdFromSession(session), 'amount_mismatch');
    return;
  }

  if (!md.userId || !md.classId || !md.studioId) {
    console.error('[booking checkout] class checkout missing metadata', session.id);
    return;
  }

  const paymentIntentId = paymentIntentIdFromSession(session);
  let classSnapshot: ClassLocked | null = null;
  let bookingId = '';
  let fulfilled = false;

  try {
    await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<ClassLocked[]>(
        Prisma.sql`
          SELECT id, "studioId", enrolled, "maxCapacity", name, date, "startTime", "endTime", price
          FROM "YogaClass"
          WHERE id = ${md.classId}
          FOR UPDATE
        `,
      );
      const cls = locked[0];
      if (!cls) {
        throw new Error('CLASS_NOT_FOUND');
      }
      classSnapshot = cls;

      const dupAgain = await tx.payment.findUnique({
        where: { stripeCheckoutSessionId: session.id },
        select: { id: true },
      });
      if (dupAgain) return;

      if (cls.studioId !== md.studioId) {
        throw new Error('METADATA_INVALID');
      }
      if (cls.enrolled >= cls.maxCapacity) {
        throw new Error('CLASS_FULL');
      }

      await tx.yogaClass.update({
        where: { id: cls.id },
        data: { enrolled: { increment: 1 } },
      });

      const booking = await tx.booking.create({
        data: { userId: md.userId, yogaClassId: cls.id },
      });
      bookingId = booking.id;

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          status: 'paid',
          amount: amountTotal,
          currency: (session.currency ?? 'eur').toLowerCase(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
        },
      });
      fulfilled = true;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      await refundPaymentIntent(paymentIntentId, 'unique_violation');
      return;
    }
    if (err instanceof Error && (err.message === 'CLASS_FULL' || err.message === 'CLASS_NOT_FOUND' || err.message === 'METADATA_INVALID')) {
      await refundPaymentIntent(paymentIntentId, err.message.toLowerCase());
      return;
    }
    throw err;
  }

  if (fulfilled && classSnapshot && bookingId) {
    await runBookingNotifications({
      kind: 'class',
      paymentMode: 'online',
      userId: md.userId,
      studioId: md.studioId,
      bookingId,
      amountMinor: amountTotal,
      currency: (session.currency ?? 'eur').toLowerCase(),
      classDetail: {
        name: classSnapshot.name,
        date: classSnapshot.date,
        startTime: classSnapshot.startTime,
        endTime: classSnapshot.endTime,
        basePriceBgn: Number(classSnapshot.price) || 0,
      },
    });
    await trackServerEvent({
      eventName: 'booking_completed',
      userId: md.userId,
      studioId: md.studioId,
      metadata: {
        kind: 'class',
        classId: classSnapshot.id,
        paymentMode: 'online',
        checkoutSessionId: session.id,
      },
    });
  }
}

export async function fulfillScheduleBooking(session: Stripe.Checkout.Session, md: Record<string, string>): Promise<void> {
  const amountTotal = session.amount_total;
  if (amountTotal == null || amountTotal <= 0) {
    console.error('[booking checkout] invalid amount_total', session.id);
    return;
  }

  const expectedFromMeta = md.amountCents != null && md.amountCents !== '' ? parseInt(md.amountCents, 10) : NaN;
  if (Number.isFinite(expectedFromMeta) && expectedFromMeta !== amountTotal) {
    await refundPaymentIntent(paymentIntentIdFromSession(session), 'amount_mismatch');
    return;
  }

  if (!md.userId || !md.scheduleEntryId || !md.studioId) {
    console.error('[booking checkout] schedule checkout missing metadata', session.id);
    return;
  }

  const paymentIntentId = paymentIntentIdFromSession(session);
  let entrySnapshot: ScheduleLocked | null = null;
  let bookingId = '';
  let fulfilled = false;

  try {
    await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<ScheduleLocked[]>(
        Prisma.sql`
          SELECT id, "studioId", enrolled, "maxCapacity", "className", day, "startTime", "endTime", price
          FROM "ScheduleEntry"
          WHERE id = ${md.scheduleEntryId}
          FOR UPDATE
        `,
      );
      const entry = locked[0];
      if (!entry) {
        throw new Error('ENTRY_NOT_FOUND');
      }
      entrySnapshot = entry;

      const dupAgain = await tx.payment.findUnique({
        where: { stripeCheckoutSessionId: session.id },
        select: { id: true },
      });
      if (dupAgain) return;

      if (entry.studioId !== md.studioId) {
        throw new Error('METADATA_INVALID');
      }
      if (entry.enrolled >= entry.maxCapacity) {
        throw new Error('CLASS_FULL');
      }

      await tx.scheduleEntry.update({
        where: { id: entry.id },
        data: { enrolled: { increment: 1 } },
      });

      const booking = await tx.scheduleEntryBooking.create({
        data: { userId: md.userId, scheduleEntryId: entry.id },
      });
      bookingId = booking.id;

      await tx.payment.create({
        data: {
          scheduleEntryBookingId: booking.id,
          status: 'paid',
          amount: amountTotal,
          currency: (session.currency ?? 'eur').toLowerCase(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
        },
      });
      fulfilled = true;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      await refundPaymentIntent(paymentIntentId, 'unique_violation');
      return;
    }
    if (err instanceof Error && (err.message === 'CLASS_FULL' || err.message === 'ENTRY_NOT_FOUND' || err.message === 'METADATA_INVALID')) {
      await refundPaymentIntent(paymentIntentId, err.message.toLowerCase());
      return;
    }
    throw err;
  }

  if (fulfilled && entrySnapshot && bookingId) {
    await runBookingNotifications({
      kind: 'schedule',
      paymentMode: 'online',
      userId: md.userId,
      studioId: md.studioId,
      bookingId,
      amountMinor: amountTotal,
      currency: (session.currency ?? 'eur').toLowerCase(),
      scheduleDetail: {
        className: entrySnapshot.className,
        day: entrySnapshot.day,
        startTime: entrySnapshot.startTime,
        endTime: entrySnapshot.endTime,
        basePriceBgn: Number(entrySnapshot.price) || 0,
      },
    });
    await trackServerEvent({
      eventName: 'booking_completed',
      userId: md.userId,
      studioId: md.studioId,
      metadata: {
        kind: 'schedule',
        scheduleEntryId: entrySnapshot.id,
        paymentMode: 'online',
        checkoutSessionId: session.id,
      },
    });
  }
}

export async function fulfillRetreatBooking(session: Stripe.Checkout.Session, md: Record<string, string>): Promise<void> {
  const amountTotal = session.amount_total;
  if (amountTotal == null || amountTotal <= 0) {
    console.error('[booking checkout] invalid amount_total', session.id);
    return;
  }

  const expectedFromMeta = md.amountCents != null && md.amountCents !== '' ? parseInt(md.amountCents, 10) : NaN;
  if (Number.isFinite(expectedFromMeta) && expectedFromMeta !== amountTotal) {
    await refundPaymentIntent(paymentIntentIdFromSession(session), 'amount_mismatch');
    return;
  }

  if (!md.userId || !md.retreatId || !md.studioId) {
    console.error('[booking checkout] retreat checkout missing metadata', session.id);
    return;
  }

  const paymentIntentId = paymentIntentIdFromSession(session);
  let retreatSnapshot: RetreatLocked | null = null;
  let bookingId = '';
  let fulfilled = false;

  try {
    await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<RetreatLocked[]>(
        Prisma.sql`
          SELECT id, "studioId", enrolled, "maxCapacity", title, price
          FROM "Retreat"
          WHERE id = ${md.retreatId}
          FOR UPDATE
        `,
      );
      const retreat = locked[0];
      if (!retreat) {
        throw new Error('RETREAT_NOT_FOUND');
      }
      retreatSnapshot = retreat;

      const dupAgain = await tx.payment.findUnique({
        where: { stripeCheckoutSessionId: session.id },
        select: { id: true },
      });
      if (dupAgain) return;

      if (retreat.studioId !== md.studioId) {
        throw new Error('METADATA_INVALID');
      }
      if (retreat.enrolled >= retreat.maxCapacity) {
        throw new Error('RETREAT_FULL');
      }

      await tx.retreat.update({
        where: { id: retreat.id },
        data: { enrolled: { increment: 1 } },
      });

      const booking = await tx.retreatBooking.create({
        data: { userId: md.userId, retreatId: retreat.id },
      });
      bookingId = booking.id;

      await tx.payment.create({
        data: {
          retreatBookingId: booking.id,
          status: 'paid',
          amount: amountTotal,
          currency: (session.currency ?? 'eur').toLowerCase(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
        },
      });
      fulfilled = true;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      await refundPaymentIntent(paymentIntentId, 'unique_violation');
      return;
    }
    if (
      err instanceof Error
      && (err.message === 'RETREAT_FULL' || err.message === 'RETREAT_NOT_FOUND' || err.message === 'METADATA_INVALID')
    ) {
      await refundPaymentIntent(paymentIntentId, err.message.toLowerCase());
      return;
    }
    throw err;
  }

  if (fulfilled && retreatSnapshot && bookingId) {
    await trackServerEvent({
      eventName: 'booking_completed',
      userId: md.userId,
      studioId: md.studioId,
      metadata: {
        kind: 'retreat',
        retreatId: retreatSnapshot.id,
        paymentMode: 'online',
        checkoutSessionId: session.id,
      },
    });
  }
}

export async function fulfillPaidBookingCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const md = (session.metadata ?? {}) as Record<string, string>;

  const existing = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId: session.id },
    select: { id: true },
  });
  if (existing) return;

  if (md.checkoutKind === 'schedule') {
    await fulfillScheduleBooking(session, md);
    return;
  }

  if (md.checkoutKind === 'retreat') {
    await fulfillRetreatBooking(session, md);
    return;
  }

  if (md.classId || md.checkoutKind === 'class') {
    await fulfillClassBooking(session, md);
    return;
  }

  console.error('[booking checkout] unknown checkout metadata', session.id);
}

export async function confirmBookingCheckout(params: {
  checkoutSessionId: string;
  userId: string;
}): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(params.checkoutSessionId);

  if (session.mode !== 'payment') {
    return { ok: false, error: 'Invalid checkout session', status: 400 };
  }
  if (session.status !== 'complete' || session.payment_status !== 'paid') {
    return { ok: false, error: 'Плащането все още не е завършено.', status: 409 };
  }

  const md = (session.metadata ?? {}) as Record<string, string>;
  if (!md.userId || md.userId !== params.userId) {
    return { ok: false, error: 'Forbidden', status: 403 };
  }

  await fulfillPaidBookingCheckout(session);
  return { ok: true };
}
