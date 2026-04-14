import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { runBookingNotifications } from '@/lib/booking-notifications';
import { getStripe } from '@/lib/stripe-server';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';
import { trackServerEvent } from '@/lib/server-analytics';

export const runtime = 'nodejs';

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
    console.error('[stripe webhook] refund failed', reason, err);
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

async function fulfillClassBooking(session: Stripe.Checkout.Session, md: Record<string, string>): Promise<void> {
  const amountTotal = session.amount_total;
  if (amountTotal == null || amountTotal <= 0) {
    console.error('[stripe webhook] invalid amount_total', session.id);
    return;
  }

  const expectedFromMeta = md.amountCents != null && md.amountCents !== '' ? parseInt(md.amountCents, 10) : NaN;
  if (Number.isFinite(expectedFromMeta) && expectedFromMeta !== amountTotal) {
    console.error('[stripe webhook] amount mismatch', { sessionId: session.id, expectedFromMeta, amountTotal });
    await refundPaymentIntent(paymentIntentIdFromSession(session), 'amount_mismatch');
    return;
  }

  if (!md.userId || !md.classId || !md.studioId) {
    console.error('[stripe webhook] class checkout missing metadata', session.id);
    return;
  }

  const paymentIntentId = paymentIntentIdFromSession(session);
  let classSnapshot: ClassLocked | null = null;
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

  if (fulfilled && classSnapshot) {
    await runBookingNotifications({
      kind: 'class',
      paymentMode: 'online',
      userId: md.userId,
      studioId: md.studioId,
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

async function fulfillScheduleBooking(session: Stripe.Checkout.Session, md: Record<string, string>): Promise<void> {
  const amountTotal = session.amount_total;
  if (amountTotal == null || amountTotal <= 0) {
    console.error('[stripe webhook] invalid amount_total', session.id);
    return;
  }

  const expectedFromMeta = md.amountCents != null && md.amountCents !== '' ? parseInt(md.amountCents, 10) : NaN;
  if (Number.isFinite(expectedFromMeta) && expectedFromMeta !== amountTotal) {
    await refundPaymentIntent(paymentIntentIdFromSession(session), 'amount_mismatch');
    return;
  }

  if (!md.userId || !md.scheduleEntryId || !md.studioId) {
    console.error('[stripe webhook] schedule checkout missing metadata', session.id);
    return;
  }

  const paymentIntentId = paymentIntentIdFromSession(session);
  let entrySnapshot: ScheduleLocked | null = null;
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

  if (fulfilled && entrySnapshot) {
    await runBookingNotifications({
      kind: 'schedule',
      paymentMode: 'online',
      userId: md.userId,
      studioId: md.studioId,
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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const existing = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId: session.id },
    select: { id: true },
  });
  if (existing) return;

  const md = (session.metadata ?? {}) as Record<string, string>;

  if (md.checkoutKind === 'schedule') {
    await fulfillScheduleBooking(session, md);
    return;
  }

  if (md.classId) {
    await fulfillClassBooking(session, md);
    return;
  }

  console.error('[stripe webhook] unknown checkout metadata', session.id);
}

export async function POST(request: Request) {
  if (!isOnlinePaymentsEnabled()) {
    return NextResponse.json({ received: true, onlinePayments: false });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, 500);
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, 400);
  }

  let event: Stripe.Event;
  const rawBody = await request.text();
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'payment') {
          await handleCheckoutSessionCompleted(session);
        }
        break;
      }
      case 'checkout.session.async_payment_failed':
      case 'payment_intent.payment_failed': {
        console.warn('[stripe webhook]', event.type, (event.data.object as { id?: string }).id);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[stripe webhook] handler error', event.type, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, 500);
  }

  return NextResponse.json({ received: true });
}
