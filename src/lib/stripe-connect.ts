import { randomUUID } from 'crypto';
import { cache } from 'react';
import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { assertStripeConfigured, getPublicAppBaseUrl, getStripe } from '@/lib/stripe-server';

export type StripeConnectSummary = {
  accountId: string | null;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  isReady: boolean;
};

export type ConnectOAuthStart = {
  url: string;
  state: string;
};

const OAUTH_STATE_COOKIE = 'stripe_oauth_state';
const OAUTH_STATE_MAX_AGE_SEC = 600;

export function getStripeConnectOAuthStateCookieName(): string {
  return OAUTH_STATE_COOKIE;
}

export function getStripeConnectOAuthStateMaxAgeSec(): number {
  return OAUTH_STATE_MAX_AGE_SEC;
}

export function isStripeConnectReady(summary: StripeConnectSummary | null | undefined): boolean {
  if (!summary) return false;
  return summary.isReady;
}

function assertConnectClientIdConfigured(): string {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error('STRIPE_CONNECT_CLIENT_ID is not set');
  }
  return clientId;
}

export function getStripeConnectOAuthRedirectUri(): string {
  const appUrl = getPublicAppBaseUrl();
  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL or NEXTAUTH_URL is not set');
  }
  return `${appUrl}/api/dashboard/stripe-connect/callback`;
}

function toSummary(row: {
  stripeConnectAccountId: string | null;
  stripeConnectChargesEnabled: boolean;
  stripeConnectDetailsSubmitted: boolean;
}): StripeConnectSummary {
  const chargesEnabled = row.stripeConnectChargesEnabled;
  const detailsSubmitted = row.stripeConnectDetailsSubmitted;
  return {
    accountId: row.stripeConnectAccountId,
    chargesEnabled,
    detailsSubmitted,
    isReady: Boolean(row.stripeConnectAccountId && chargesEnabled && detailsSubmitted),
  };
}

export async function syncConnectAccountFromStripe(account: Stripe.Account): Promise<void> {
  if (!account.id) return;
  await prisma.business.updateMany({
    where: { stripeConnectAccountId: account.id },
    data: {
      stripeConnectChargesEnabled: account.charges_enabled ?? false,
      stripeConnectDetailsSubmitted: account.details_submitted ?? false,
    },
  });
}

async function refreshConnectAccountFromStripe(accountId: string): Promise<StripeConnectSummary | null> {
  try {
    assertStripeConfigured();
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(accountId);
    await syncConnectAccountFromStripe(account);
    const biz = await prisma.business.findFirst({
      where: { stripeConnectAccountId: accountId },
      select: {
        stripeConnectAccountId: true,
        stripeConnectChargesEnabled: true,
        stripeConnectDetailsSubmitted: true,
      },
    });
    return biz ? toSummary(biz) : null;
  } catch (error) {
    console.error('[stripe connect] failed to refresh account', accountId, error);
    return null;
  }
}

export const getStripeConnectSummaryForOwnerUserId = cache(async function getStripeConnectSummaryForOwnerUserId(
  ownerUserId: string,
  options?: { refresh?: boolean },
): Promise<StripeConnectSummary | null> {
  const biz = await prisma.business.findUnique({
    where: { ownerUserId },
    select: {
      stripeConnectAccountId: true,
      stripeConnectChargesEnabled: true,
      stripeConnectDetailsSubmitted: true,
    },
  });
  if (!biz) return null;

  if (options?.refresh && biz.stripeConnectAccountId) {
    const refreshed = await refreshConnectAccountFromStripe(biz.stripeConnectAccountId);
    if (refreshed) return refreshed;
  }

  return toSummary(biz);
});

/** Build Stripe Connect OAuth authorize URL (Standard / existing account linking). */
export function createConnectOAuthStart(): ConnectOAuthStart {
  assertStripeConfigured();
  const clientId = assertConnectClientIdConfigured();
  const redirectUri = getStripeConnectOAuthRedirectUri();
  const state = randomUUID();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'read_write',
    redirect_uri: redirectUri,
    state,
  });

  return {
    state,
    url: `https://connect.stripe.com/oauth/authorize?${params.toString()}`,
  };
}

/** Exchange OAuth authorization code for connected account ID and persist on Business. */
export async function completeConnectOAuth(
  ownerUserId: string,
  code: string,
): Promise<StripeConnectSummary> {
  assertStripeConfigured();
  const stripe = getStripe();

  const biz = await prisma.business.findUnique({
    where: { ownerUserId },
    select: { id: true },
  });
  if (!biz) {
    throw new Error('Business not found');
  }

  const tokenResponse = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code,
  });

  const accountId = tokenResponse.stripe_user_id;
  if (!accountId) {
    throw new Error('Stripe OAuth response missing stripe_user_id');
  }

  await prisma.business.update({
    where: { id: biz.id },
    data: { stripeConnectAccountId: accountId },
  });

  const account = await stripe.accounts.retrieve(accountId);
  await syncConnectAccountFromStripe(account);

  const summary = await getStripeConnectSummaryForOwnerUserId(ownerUserId, { refresh: true });
  if (!summary) {
    throw new Error('Failed to load connect summary after OAuth');
  }
  return summary;
}
