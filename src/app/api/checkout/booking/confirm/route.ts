import { NextResponse } from 'next/server';
import { jsonError, requireSession } from '@/lib/api-auth';
import { confirmBookingCheckout } from '@/lib/booking-checkout-fulfillment';
import { assertStripeConfigured } from '@/lib/stripe-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  let body: { sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
  if (!sessionId) {
    return jsonError('Missing sessionId', 400);
  }

  try {
    assertStripeConfigured();
  } catch {
    return jsonError('Stripe is not configured', 503);
  }

  try {
    const result = await confirmBookingCheckout({
      checkoutSessionId: sessionId,
      userId: gate.user.id,
    });

    if (!result.ok) {
      return jsonError(result.error, result.status);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[booking checkout confirm]', sessionId, error);
    return jsonError('Неуспешно потвърждаване на записването.', 502);
  }
}
