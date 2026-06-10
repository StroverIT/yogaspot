import { calculateFinalCustomerAmount, calculateOnlinePaymentFee } from '@/lib/payments';
import { prisma } from '@/lib/prisma';
import { assertStripeConfigured, getStripe } from '@/lib/stripe-server';

type StripeInterval = 'month' | 'year' | 'week' | 'day';

type EnsureStripeCatalogEntryParams = {
  name: string;
  baseAmount: number;
  metadata: Record<string, string>;
  recurringInterval?: StripeInterval;
  recurringIntervalCount?: number;
};

type SyncStudioSubscriptionCatalogParams = {
  name: string;
  baseAmount: number;
  durationMonths: number;
  studioId: string;
  studioSubscriptionId: string;
  stripeAccountId: string;
  existingProductId?: string | null;
  existingPriceId?: string | null;
};

export type StripeCatalogIds = {
  productId: string;
  priceId: string;
};

function toEurCentsFromBgnBase(baseAmountBgn: number): number {
  const finalCharge = calculateFinalCustomerAmount(baseAmountBgn);
  if (!Number.isFinite(finalCharge) || finalCharge <= 0) return 0;
  return Math.round(finalCharge * 100);
}

/** Platform fee as percent of the customer-facing recurring charge (fixed + percent fee blended). */
export function studioSubscriptionApplicationFeePercent(baseAmountBgn: number): number {
  const finalCharge = calculateFinalCustomerAmount(baseAmountBgn);
  const fee = calculateOnlinePaymentFee(baseAmountBgn);
  if (!Number.isFinite(finalCharge) || finalCharge <= 0 || fee <= 0) return 0;
  return Math.round((fee / finalCharge) * 10000) / 100;
}

export async function getConnectAccountIdForStudio(studioId: string): Promise<string | null> {
  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    select: {
      business: {
        select: { stripeConnectAccountId: true },
      },
    },
  });
  return studio?.business.stripeConnectAccountId ?? null;
}

async function createStripeProduct(
  name: string,
  metadata: Record<string, string>,
  stripeAccountId?: string,
): Promise<string> {
  assertStripeConfigured();
  const stripe = getStripe();
  const product = await stripe.products.create(
    { name, metadata },
    stripeAccountId ? { stripeAccount: stripeAccountId } : undefined,
  );
  return product.id;
}

async function createStripePrice(
  productId: string,
  unitAmountCents: number,
  recurringInterval?: StripeInterval,
  recurringIntervalCount?: number,
  stripeAccountId?: string,
): Promise<string> {
  assertStripeConfigured();
  const stripe = getStripe();
  const price = await stripe.prices.create(
    {
      currency: 'eur',
      product: productId,
      unit_amount: unitAmountCents,
      recurring: recurringInterval
        ? {
            interval: recurringInterval,
            ...(recurringIntervalCount && recurringIntervalCount > 1
              ? { interval_count: recurringIntervalCount }
              : {}),
          }
        : undefined,
    },
    stripeAccountId ? { stripeAccount: stripeAccountId } : undefined,
  );
  return price.id;
}

async function archiveStripePrice(priceId: string, stripeAccountId?: string): Promise<void> {
  try {
    assertStripeConfigured();
    const stripe = getStripe();
    await stripe.prices.update(
      priceId,
      { active: false },
      stripeAccountId ? { stripeAccount: stripeAccountId } : undefined,
    );
  } catch (error) {
    console.warn('[stripe catalog] failed to archive price', priceId, error);
  }
}

/** Platform-account catalog sync (classes / schedule). Best-effort; errors are logged by callers. */
export async function ensureStripeCatalogEntry(params: EnsureStripeCatalogEntryParams): Promise<void> {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) return;

  const finalChargeCents = toEurCentsFromBgnBase(params.baseAmount);
  if (finalChargeCents <= 0) return;

  const productId = await createStripeProduct(params.name, params.metadata);
  await createStripePrice(
    productId,
    finalChargeCents,
    params.recurringInterval,
    params.recurringIntervalCount,
  );
}

/** Connected-account catalog for studio subscriptions. Throws on failure. */
export async function syncStudioSubscriptionStripeCatalog(
  params: SyncStudioSubscriptionCatalogParams,
): Promise<StripeCatalogIds> {
  const finalChargeCents = toEurCentsFromBgnBase(params.baseAmount);
  if (finalChargeCents <= 0) {
    throw new Error('Invalid subscription price');
  }

  const metadata = {
    type: 'subscription',
    studioId: params.studioId,
    studioSubscriptionId: params.studioSubscriptionId,
    zennoKind: 'studio_subscription',
  };

  let productId = params.existingProductId ?? null;
  if (!productId) {
    productId = await createStripeProduct(
      `Subscription: ${params.name}`,
      metadata,
      params.stripeAccountId,
    );
  }

  const priceId = await createStripePrice(
    productId,
    finalChargeCents,
    'month',
    params.durationMonths,
    params.stripeAccountId,
  );

  if (params.existingPriceId && params.existingPriceId !== priceId) {
    await archiveStripePrice(params.existingPriceId, params.stripeAccountId);
  }

  return { productId, priceId };
}
