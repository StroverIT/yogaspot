import { NextResponse } from 'next/server';
import { jsonError, requireSession } from '@/lib/api-auth';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';
import { prisma } from '@/lib/prisma';
import { assertStripeConfigured, classPriceToStripeUnitAmountEurCents, getPublicAppBaseUrl, getStripe } from '@/lib/stripe-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  if (!isOnlinePaymentsEnabled()) {
    return jsonError('Онлайн плащанията са изключени за този сайт.', 403);
  }

  let body: { classId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const classId = typeof body.classId === 'string' ? body.classId.trim() : '';
  if (!classId) return jsonError('Missing classId', 400);

  const appUrl = getPublicAppBaseUrl();
  if (!appUrl) {
    return jsonError('Server misconfiguration: set NEXT_PUBLIC_APP_URL or NEXTAUTH_URL', 500);
  }

  try {
    assertStripeConfigured();
  } catch {
    return jsonError('Stripe is not configured', 503);
  }

  const yogaClass = await prisma.yogaClass.findUnique({
    where: { id: classId },
    select: {
      id: true,
      studioId: true,
      name: true,
      price: true,
      enrolled: true,
      maxCapacity: true,
    },
  });

  if (!yogaClass) return jsonError('Class not found', 404);

  if (yogaClass.enrolled >= yogaClass.maxCapacity) {
    return jsonError('Class is full', 409);
  }

  const existing = await prisma.booking.findUnique({
    where: {
      userId_yogaClassId: { userId: gate.user.id, yogaClassId: classId },
    },
    select: { id: true },
  });
  if (existing) {
    return jsonError('You already booked this class', 409);
  }

  const unitAmount = classPriceToStripeUnitAmountEurCents(yogaClass.price);
  if (unitAmount <= 0) {
    return jsonError('Class has no payable price', 400);
  }

  const metaBase = {
    checkoutKind: 'class',
    userId: gate.user.id,
    classId: yogaClass.id,
    studioId: yogaClass.studioId,
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
            name: yogaClass.name,
            metadata: {
              classId: yogaClass.id,
              studioId: yogaClass.studioId,
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
    cancel_url: `${appUrl}/studio/${encodeURIComponent(yogaClass.studioId)}?tab=events`,
  });

  if (!session.url) {
    return jsonError('Checkout session missing URL', 500);
  }

  return NextResponse.json({ url: session.url });
}
