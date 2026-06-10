import { NextResponse } from 'next/server';
import { jsonError, requireBusinessWriteAccess, requireRole } from '@/lib/api-auth';
import {
  createConnectOAuthStart,
  getStripeConnectOAuthStateCookieName,
  getStripeConnectOAuthStateMaxAgeSec,
} from '@/lib/stripe-connect';

export const runtime = 'nodejs';

export async function POST() {
  const gate = await requireRole(['business']);
  if (!gate.ok) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  try {
    const { url, state } = createConnectOAuthStart();
    const res = NextResponse.json({ url });
    res.cookies.set(getStripeConnectOAuthStateCookieName(), state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getStripeConnectOAuthStateMaxAgeSec(),
      path: '/',
    });
    return res;
  } catch (error) {
    console.error('[stripe connect] OAuth authorize URL failed', error);
    const message = error instanceof Error && error.message.includes('STRIPE_CONNECT_CLIENT_ID')
      ? 'Stripe Connect не е конфигуриран (липсва STRIPE_CONNECT_CLIENT_ID).'
      : 'Неуспешно стартиране на Stripe свързване.';
    return jsonError(message, 500);
  }
}
