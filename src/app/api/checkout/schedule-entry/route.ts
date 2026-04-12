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

  let body: { scheduleEntryId?: string; studioId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const scheduleEntryId = typeof body.scheduleEntryId === 'string' ? body.scheduleEntryId.trim() : '';
  const studioId = typeof body.studioId === 'string' ? body.studioId.trim() : '';
  if (!scheduleEntryId) return jsonError('Missing scheduleEntryId', 400);
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

  const entry = await prisma.scheduleEntry.findFirst({
    where: { id: scheduleEntryId, studioId },
    select: {
      id: true,
      studioId: true,
      className: true,
      price: true,
      enrolled: true,
      maxCapacity: true,
    },
  });

  if (!entry) return jsonError('Schedule entry not found', 404);

  if (entry.enrolled >= entry.maxCapacity) {
    return jsonError('This time slot is full', 409);
  }

  const existing = await prisma.scheduleEntryBooking.findUnique({
    where: {
      userId_scheduleEntryId: { userId: gate.user.id, scheduleEntryId: entry.id },
    },
    select: { id: true },
  });
  if (existing) {
    return jsonError('You already booked this time slot', 409);
  }

  const unitAmount = classPriceToStripeUnitAmountEurCents(entry.price);
  if (unitAmount <= 0) {
    return jsonError('Entry has no payable price', 400);
  }

  const metaBase = {
    checkoutKind: 'schedule',
    userId: gate.user.id,
    scheduleEntryId: entry.id,
    studioId: entry.studioId,
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
            name: `${entry.className} (разписание)`,
            metadata: {
              scheduleEntryId: entry.id,
              studioId: entry.studioId,
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
    cancel_url: `${appUrl}/studio/${encodeURIComponent(entry.studioId)}?tab=schedule`,
  });

  if (!session.url) {
    return jsonError('Checkout session missing URL', 500);
  }

  return NextResponse.json({ url: session.url });
}
