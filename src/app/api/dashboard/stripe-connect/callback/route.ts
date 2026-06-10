import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import { getPublicAppBaseUrl } from '@/lib/stripe-server';
import {
  completeConnectOAuth,
  getStripeConnectOAuthStateCookieName,
} from '@/lib/stripe-connect';

export const runtime = 'nodejs';

function subscriptionsRedirect(query: string): NextResponse {
  const appUrl = getPublicAppBaseUrl();
  const base = appUrl ? `${appUrl}/dashboard/subscriptions` : '/dashboard/subscriptions';
  return NextResponse.redirect(`${base}?${query}`);
}

export async function GET(request: Request) {
  const gate = await requireRole(['business']);
  if (!gate.ok) {
    return subscriptionsRedirect('stripe_connect=error&reason=unauthorized');
  }

  const url = new URL(request.url);
  const oauthError = url.searchParams.get('error');
  if (oauthError) {
    console.warn('[stripe connect] OAuth denied', oauthError, url.searchParams.get('error_description'));
    return subscriptionsRedirect('stripe_connect=denied');
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(getStripeConnectOAuthStateCookieName())?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return subscriptionsRedirect('stripe_connect=error&reason=invalid_state');
  }

  try {
    await completeConnectOAuth(gate.user.id, code);
    const res = subscriptionsRedirect('stripe_connect=return');
    res.cookies.delete(getStripeConnectOAuthStateCookieName());
    return res;
  } catch (error) {
    console.error('[stripe connect] OAuth token exchange failed', error);
    const res = subscriptionsRedirect('stripe_connect=error');
    res.cookies.delete(getStripeConnectOAuthStateCookieName());
    return res;
  }
}
