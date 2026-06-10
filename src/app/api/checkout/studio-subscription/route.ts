import { NextResponse } from 'next/server';
import { jsonError, requireSession } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { trackServerEvent } from '@/lib/server-analytics';
import { isStripeConnectReady } from '@/lib/stripe-connect';
import {
  studioSubscriptionApplicationFeePercent,
  studioSubscriptionStripePriceMatchesCatalog,
  syncStudioSubscriptionStripeCatalog,
} from '@/lib/stripe-catalog';
import { assertStripeConfigured, getPublicAppBaseUrl, getStripe } from '@/lib/stripe-server';
import { blockingStudioSubscriptionWhere } from '@/lib/studio-membership';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  let body: { studioId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const studioId = typeof body.studioId === 'string' ? body.studioId.trim() : '';
  if (!studioId) return jsonError('Missing studioId', 400);

  const appUrl = getPublicAppBaseUrl();
  if (!appUrl) {
    return jsonError('Server misconfiguration: set NEXT_PUBLIC_APP_URL or NEXTAUTH_URL', 500);
  }

  try {
    assertStripeConfigured();
  } catch {
    return jsonError('Stripe is not configured', 503);
  }

  const studio = await prisma.studio.findUnique({
    where: { id: studioId, isHidden: false },
    select: {
      id: true,
      subscription: {
        select: {
          id: true,
          name: true,
          hasMonthlySubscription: true,
          monthlyPrice: true,
          durationMonths: true,
          stripePriceId: true,
          stripeProductId: true,
        },
      },
      business: {
        select: {
          stripeConnectAccountId: true,
          stripeConnectChargesEnabled: true,
          stripeConnectDetailsSubmitted: true,
        },
      },
    },
  });

  if (!studio) return jsonError('Studio not found', 404);

  const sub = studio.subscription;
  if (!sub?.hasMonthlySubscription || !sub.stripePriceId || sub.monthlyPrice == null) {
    return jsonError('Това студио няма активен абонаментен план.', 404);
  }

  const connectSummary = studio.business
    ? {
        accountId: studio.business.stripeConnectAccountId,
        chargesEnabled: studio.business.stripeConnectChargesEnabled,
        detailsSubmitted: studio.business.stripeConnectDetailsSubmitted,
        isReady: Boolean(
          studio.business.stripeConnectAccountId &&
            studio.business.stripeConnectChargesEnabled &&
            studio.business.stripeConnectDetailsSubmitted,
        ),
      }
    : null;

  if (!isStripeConnectReady(connectSummary) || !connectSummary?.accountId) {
    return jsonError('Студиото все още не приема онлайн абонаменти.', 503);
  }

  const existingMembership = await prisma.studioMembership.findFirst({
    where: blockingStudioSubscriptionWhere(gate.user.id, sub.id),
    select: { id: true },
  });
  if (existingMembership) {
    return jsonError('Вече имате активен абонамент за този план.', 409);
  }

  let stripePriceId = sub.stripePriceId;
  const priceMatches = await studioSubscriptionStripePriceMatchesCatalog({
    stripePriceId,
    baseAmount: sub.monthlyPrice,
    stripeAccountId: connectSummary.accountId,
  });
  if (!priceMatches) {
    try {
      const catalog = await syncStudioSubscriptionStripeCatalog({
        name: sub.name ?? 'Абонамент',
        baseAmount: sub.monthlyPrice,
        durationMonths: sub.durationMonths ?? 1,
        studioId,
        studioSubscriptionId: sub.id,
        stripeAccountId: connectSummary.accountId,
        existingProductId: sub.stripeProductId,
        existingPriceId: sub.stripePriceId,
      });
      stripePriceId = catalog.priceId;
      await prisma.studioSubscription.update({
        where: { id: sub.id },
        data: {
          stripeProductId: catalog.productId,
          stripePriceId: catalog.priceId,
        },
      });
    } catch (error) {
      console.error('Stripe subscription price resync failed', studioId, error);
      return jsonError('Неуспешно синхронизиране на цената. Опитайте отново.', 502);
    }
  }

  const applicationFeePercent = studioSubscriptionApplicationFeePercent(sub.monthlyPrice);
  const metaBase = {
    checkoutKind: 'studio_subscription',
    userId: gate.user.id,
    studioId,
    studioSubscriptionId: sub.id,
    zennoKind: 'studio_subscription',
  } as const;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'subscription',
      customer_email: gate.user.email ?? undefined,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      subscription_data: {
        application_fee_percent: applicationFeePercent > 0 ? applicationFeePercent : undefined,
        metadata: { ...metaBase },
      },
      metadata: { ...metaBase },
      success_url: `${appUrl}/studio/${encodeURIComponent(studioId)}?tab=schedule&subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/studio/${encodeURIComponent(studioId)}?tab=schedule`,
    },
    { stripeAccount: connectSummary.accountId },
  );

  if (!session.url) {
    return jsonError('Checkout session missing URL', 500);
  }

  await trackServerEvent({
    eventName: 'subscription_checkout_started',
    userId: gate.user.id,
    studioId,
    metadata: {
      checkoutSessionId: session.id,
      studioSubscriptionId: sub.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
