import { NextResponse } from 'next/server';
import { jsonError, requireSession } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { assertStripeConfigured } from '@/lib/stripe-server';
import { isStripeConnectReady } from '@/lib/stripe-connect';
import { confirmStudioSubscriptionCheckout } from '@/lib/studio-subscription-fulfillment';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  let body: { sessionId?: string; studioId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
  const studioId = typeof body.studioId === 'string' ? body.studioId.trim() : '';
  if (!sessionId || !studioId) {
    return jsonError('Missing sessionId or studioId', 400);
  }

  try {
    assertStripeConfigured();
  } catch {
    return jsonError('Stripe is not configured', 503);
  }

  const studio = await prisma.studio.findUnique({
    where: { id: studioId, isHidden: false },
    select: {
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

  try {
    const result = await confirmStudioSubscriptionCheckout({
      checkoutSessionId: sessionId,
      userId: gate.user.id,
      studioId,
      stripeAccountId: connectSummary.accountId,
    });

    if (!result.ok) {
      return jsonError(result.error, result.status);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[studio subscription confirm]', sessionId, error);
    return jsonError('Неуспешно потвърждаване на абонамента.', 502);
  }
}
