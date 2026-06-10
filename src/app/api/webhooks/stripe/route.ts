import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { runBookingNotifications } from '@/lib/booking-notifications';
import { getStripe } from '@/lib/stripe-server';
import {
  handlePlatformInvoicePaid,
  handlePlatformInvoicePaymentFailed,
  syncSubscriptionFromStripe,
} from '@/lib/business-platform-billing';
import { syncConnectAccountFromStripe } from '@/lib/stripe-connect';
import {
  BLOCKING_STUDIO_MEMBERSHIP_STATUSES,
  customerIdFromSubscription,
  mapStripeSubscriptionStatus,
  subscriptionPeriodEnd,
} from '@/lib/studio-membership';
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

function isStudioSubscriptionMetadata(md: Record<string, string | undefined>): boolean {
  return md.zennoKind === 'studio_subscription' || md.checkoutKind === 'studio_subscription';
}

async function upsertStudioMembershipFromStripe(
  subscription: Stripe.Subscription,
  md: Record<string, string>,
): Promise<void> {
  const userId = md.userId ?? subscription.metadata?.userId;
  const studioId = md.studioId ?? subscription.metadata?.studioId;
  const studioSubscriptionId = md.studioSubscriptionId ?? subscription.metadata?.studioSubscriptionId;

  if (!userId || !studioId) {
    console.error('[stripe webhook] studio subscription missing user/studio', subscription.id);
    return;
  }

  const existing = await prisma.studioMembership.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true },
  });

  const data = {
    userId,
    studioId,
    studioSubscriptionId: studioSubscriptionId || null,
    stripeCustomerId: customerIdFromSubscription(subscription),
    status: mapStripeSubscriptionStatus(subscription.status),
    currentPeriodEnd: subscriptionPeriodEnd(subscription),
  };

  if (existing) {
    await prisma.studioMembership.update({
      where: { stripeSubscriptionId: subscription.id },
      data,
    });
    return;
  }

  const duplicateBlocking = await prisma.studioMembership.findFirst({
    where: {
      userId,
      studioId,
      ...(studioSubscriptionId ? { studioSubscriptionId } : {}),
      status: { in: [...BLOCKING_STUDIO_MEMBERSHIP_STATUSES] },
      NOT: { stripeSubscriptionId: subscription.id },
    },
    select: { id: true, status: true },
  });

  if (duplicateBlocking) {
    if (duplicateBlocking.status === 'incomplete') {
      await prisma.studioMembership.update({
        where: { id: duplicateBlocking.id },
        data: {
          ...data,
          stripeSubscriptionId: subscription.id,
        },
      });
      await trackServerEvent({
        eventName: 'subscription_completed',
        userId,
        studioId,
        metadata: {
          stripeSubscriptionId: subscription.id,
          studioSubscriptionId: studioSubscriptionId ?? null,
        },
      });
    } else {
      console.error(
        '[stripe webhook] duplicate studio membership blocked',
        subscription.id,
        userId,
        studioId,
        studioSubscriptionId ?? null,
      );
    }
    return;
  }

  await prisma.studioMembership.create({
    data: {
      ...data,
      stripeSubscriptionId: subscription.id,
    },
  });

  await trackStudioMembershipCompleted(userId, studioId, subscription.id, studioSubscriptionId);
}

function trackStudioMembershipCompleted(
  userId: string,
  studioId: string,
  stripeSubscriptionId: string,
  studioSubscriptionId: string | undefined,
): Promise<void> {
  return trackServerEvent({
    eventName: 'subscription_completed',
    userId,
    studioId,
    metadata: {
      stripeSubscriptionId,
      studioSubscriptionId: studioSubscriptionId ?? null,
    },
  });
}

async function fulfillStudioSubscriptionCheckout(
  session: Stripe.Checkout.Session,
  md: Record<string, string>,
  stripeAccountId?: string | null,
): Promise<void> {
  const subId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!subId) {
    console.error('[stripe webhook] studio subscription checkout missing subscription id', session.id);
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    subId,
    stripeAccountId ? { stripeAccount: stripeAccountId } : undefined,
  );

  await upsertStudioMembershipFromStripe(subscription, md);
}

async function syncStudioMembershipLifecycle(
  subscription: Stripe.Subscription,
): Promise<void> {
  if (!isStudioSubscriptionMetadata(subscription.metadata ?? {})) return;

  const existing = await prisma.studioMembership.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true },
  });
  if (!existing) {
    const md = (subscription.metadata ?? {}) as Record<string, string>;
    if (md.userId && md.studioId) {
      await upsertStudioMembershipFromStripe(subscription, md);
    }
    return;
  }

  await prisma.studioMembership.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: mapStripeSubscriptionStatus(subscription.status),
      currentPeriodEnd: subscriptionPeriodEnd(subscription),
      stripeCustomerId: customerIdFromSubscription(subscription),
    },
  });
}

async function handleStudioSubscriptionInvoiceFailed(invoice: Stripe.Invoice): Promise<void> {
  const subId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subId) return;

  const membership = await prisma.studioMembership.findUnique({
    where: { stripeSubscriptionId: subId },
    select: { id: true },
  });
  if (!membership) return;

  await prisma.studioMembership.update({
    where: { stripeSubscriptionId: subId },
    data: { status: 'past_due' },
  });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripeAccountId?: string | null,
): Promise<void> {
  const md = (session.metadata ?? {}) as Record<string, string>;

  if (session.mode === 'subscription' && isStudioSubscriptionMetadata(md)) {
    await fulfillStudioSubscriptionCheckout(session, md, stripeAccountId);
    return;
  }

  const existing = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId: session.id },
    select: { id: true },
  });
  if (existing) return;

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
        const connectAccountId = typeof event.account === 'string' ? event.account : null;
        if (session.mode === 'payment' || session.mode === 'subscription') {
          await handleCheckoutSessionCompleted(session, connectAccountId);
        }
        break;
      }
      case 'checkout.session.async_payment_failed':
      case 'payment_intent.payment_failed': {
        console.warn('[stripe webhook]', event.type, (event.data.object as { id?: string }).id);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.metadata?.zennoKind === 'platform_subscription') {
          await syncSubscriptionFromStripe(subscription);
        } else if (isStudioSubscriptionMetadata(subscription.metadata ?? {})) {
          await syncStudioMembershipLifecycle(subscription);
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.metadata?.zennoKind === 'platform_subscription' || invoice.subscription) {
          const subId =
            typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
          if (subId) {
            const stripe = getStripe();
            const sub = await stripe.subscriptions.retrieve(subId);
            if (sub.metadata?.zennoKind === 'platform_subscription') {
              await handlePlatformInvoicePaid(invoice);
              await syncSubscriptionFromStripe(sub, invoice);
            }
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (subId) {
          const connectAccountId = typeof event.account === 'string' ? event.account : undefined;
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(
            subId,
            connectAccountId ? { stripeAccount: connectAccountId } : undefined,
          );
          if (sub.metadata?.zennoKind === 'platform_subscription') {
            await handlePlatformInvoicePaymentFailed(invoice);
            await syncSubscriptionFromStripe(sub, invoice);
          } else if (isStudioSubscriptionMetadata(sub.metadata ?? {})) {
            await handleStudioSubscriptionInvoiceFailed(invoice);
          }
        }
        break;
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        if (account.metadata?.zennoKind === 'connect_seller' || account.id) {
          await syncConnectAccountFromStripe(account);
        }
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
