import { NextResponse } from 'next/server';
import { jsonError, requireSession } from '@/lib/api-auth';
import { effectivePaymentMode, includesOnlinePayment } from '@/lib/booking-payment-mode';
import { prisma } from '@/lib/prisma';
import { trackServerEvent } from '@/lib/server-analytics';
import { assertStripeConfigured, classPriceToStripeUnitAmountEurCents, getPublicAppBaseUrl, getStripe } from '@/lib/stripe-server';
import { isFreeClassPrice } from '@/lib/yoga-class-limits';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  let body: { retreatId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const retreatId = typeof body.retreatId === 'string' ? body.retreatId.trim() : '';
  if (!retreatId) return jsonError('Missing retreatId', 400);

  const appUrl = getPublicAppBaseUrl();
  if (!appUrl) {
    return jsonError('Server misconfiguration: set NEXT_PUBLIC_APP_URL or NEXTAUTH_URL', 500);
  }

  try {
    assertStripeConfigured();
  } catch {
    return jsonError('Stripe is not configured', 503);
  }

  const retreat = await prisma.retreat.findUnique({
    where: { id: retreatId },
    select: {
      id: true,
      studioId: true,
      title: true,
      price: true,
      paymentMode: true,
      enrolled: true,
      maxCapacity: true,
      isPublished: true,
      isHidden: true,
    },
  });

  if (!retreat || retreat.isHidden || !retreat.isPublished) {
    return jsonError('Рийтрийтът не е намерен.', 404);
  }

  const mode = effectivePaymentMode(retreat.price, retreat.paymentMode);
  if (!includesOnlinePayment(mode)) {
    return jsonError('Този рийтрийт приема само плащане на място.', 400);
  }

  if (retreat.enrolled >= retreat.maxCapacity) {
    return jsonError('Няма свободни места.', 409);
  }

  if (isFreeClassPrice(retreat.price)) {
    return jsonError('Този рийтрийт е безплатен — използвайте директно записване.', 400);
  }

  const existing = await prisma.retreatBooking.findUnique({
    where: {
      retreatId_userId: { retreatId, userId: gate.user.id },
    },
    select: { id: true },
  });
  if (existing) {
    return jsonError('Вече сте записани за този рийтрийт.', 409);
  }

  const unitAmount = classPriceToStripeUnitAmountEurCents(retreat.price);
  if (unitAmount <= 0) {
    return jsonError('Retreat has no payable price', 400);
  }

  const metaBase = {
    checkoutKind: 'retreat',
    userId: gate.user.id,
    retreatId: retreat.id,
    studioId: retreat.studioId,
    amountCents: String(unitAmount),
  } as const;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: unitAmount,
          product_data: {
            name: retreat.title,
            metadata: {
              retreatId: retreat.id,
              studioId: retreat.studioId,
            },
          },
        },
      },
    ],
    metadata: { ...metaBase },
    payment_intent_data: {
      metadata: { ...metaBase },
    },
    success_url: `${appUrl}/profile/history?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/retreats/${encodeURIComponent(retreat.id)}`,
  });

  if (!session.url) {
    return jsonError('Checkout session missing URL', 500);
  }

  await trackServerEvent({
    eventName: 'booking_started',
    userId: gate.user.id,
    studioId: retreat.studioId,
    metadata: {
      kind: 'retreat',
      retreatId: retreat.id,
      checkoutSessionId: session.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
