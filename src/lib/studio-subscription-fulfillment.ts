import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe-server';
import { trackServerEvent } from '@/lib/server-analytics';
import {
  BLOCKING_STUDIO_MEMBERSHIP_STATUSES,
  customerIdFromSubscription,
  mapStripeSubscriptionStatus,
  subscriptionPeriodEnd,
} from '@/lib/studio-membership';
import { runStudioSubscriptionNotifications } from '@/lib/studio-subscription-notifications';

export function isStudioSubscriptionMetadata(md: Record<string, string | undefined>): boolean {
  return md.zennoKind === 'studio_subscription' || md.checkoutKind === 'studio_subscription';
}

async function trackStudioMembershipCompleted(
  userId: string,
  studioId: string,
  stripeSubscriptionId: string,
  studioSubscriptionId: string | undefined,
): Promise<void> {
  await trackServerEvent({
    eventName: 'subscription_completed',
    userId,
    studioId,
    metadata: {
      stripeSubscriptionId,
      studioSubscriptionId: studioSubscriptionId ?? null,
    },
  });
}

export async function upsertStudioMembershipFromStripe(
  subscription: Stripe.Subscription,
  md: Record<string, string>,
): Promise<void> {
  const userId = md.userId ?? subscription.metadata?.userId;
  const studioId = md.studioId ?? subscription.metadata?.studioId;
  const studioSubscriptionId = md.studioSubscriptionId ?? subscription.metadata?.studioSubscriptionId;

  if (!userId || !studioId) {
    console.error('[studio subscription] missing user/studio', subscription.id);
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
      await trackStudioMembershipCompleted(userId, studioId, subscription.id, studioSubscriptionId);
      await runStudioSubscriptionNotifications({
        userId,
        studioId,
        studioSubscriptionId,
      });
    } else {
      console.error(
        '[studio subscription] duplicate membership blocked',
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
  await runStudioSubscriptionNotifications({
    userId,
    studioId,
    studioSubscriptionId,
  });
}

export async function fulfillStudioSubscriptionCheckout(
  session: Stripe.Checkout.Session,
  md: Record<string, string>,
  stripeAccountId?: string | null,
): Promise<void> {
  const subId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!subId) {
    console.error('[studio subscription] checkout missing subscription id', session.id);
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    subId,
    stripeAccountId ? { stripeAccount: stripeAccountId } : undefined,
  );

  await upsertStudioMembershipFromStripe(subscription, md);
}

export async function syncStudioMembershipLifecycle(subscription: Stripe.Subscription): Promise<void> {
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

export async function confirmStudioSubscriptionCheckout(params: {
  checkoutSessionId: string;
  userId: string;
  studioId: string;
  stripeAccountId: string;
}): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(params.checkoutSessionId, {
    stripeAccount: params.stripeAccountId,
  });

  if (session.mode !== 'subscription') {
    return { ok: false, error: 'Invalid checkout session', status: 400 };
  }
  if (session.status !== 'complete') {
    return { ok: false, error: 'Плащането все още не е завършено.', status: 409 };
  }

  const md = (session.metadata ?? {}) as Record<string, string>;
  if (!isStudioSubscriptionMetadata(md)) {
    return { ok: false, error: 'Invalid checkout session', status: 400 };
  }
  if (md.userId !== params.userId || md.studioId !== params.studioId) {
    return { ok: false, error: 'Forbidden', status: 403 };
  }

  await fulfillStudioSubscriptionCheckout(session, md, params.stripeAccountId);
  return { ok: true };
}
