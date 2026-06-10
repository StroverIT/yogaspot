import { calculateFinalCustomerAmount } from '@/lib/payments';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';

type StripeInterval = 'month' | 'year' | 'week' | 'day';

type EnsureStripeCatalogEntryParams = {
  name: string;
  baseAmount: number;
  metadata: Record<string, string>;
  recurringInterval?: StripeInterval;
  recurringIntervalCount?: number;
};

function getStripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return key ? key : null;
}

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

async function createStripeProduct(secretKey: string, name: string, metadata: Record<string, string>): Promise<string> {
  const form = new URLSearchParams();
  form.append('name', name);
  Object.entries(metadata).forEach(([key, value]) => {
    form.append(`metadata[${key}]`, value);
  });

  const response = await fetch('https://api.stripe.com/v1/products', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Stripe product creation failed (${response.status}): ${body}`);
  }
  const data = (await response.json()) as { id: string };
  return data.id;
}

async function createStripePrice(
  secretKey: string,
  productId: string,
  unitAmount: number,
  recurringInterval?: StripeInterval,
  recurringIntervalCount?: number,
): Promise<string> {
  const form = new URLSearchParams();
  form.append('currency', 'eur');
  form.append('product', productId);
  form.append('unit_amount', String(unitAmount));
  if (recurringInterval) {
    form.append('recurring[interval]', recurringInterval);
    if (recurringIntervalCount && recurringIntervalCount > 1) {
      form.append('recurring[interval_count]', String(recurringIntervalCount));
    }
  }

  const response = await fetch('https://api.stripe.com/v1/prices', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Stripe price creation failed (${response.status}): ${body}`);
  }
  const data = (await response.json()) as { id: string };
  return data.id;
}

export async function ensureStripeCatalogEntry(params: EnsureStripeCatalogEntryParams): Promise<void> {
  if (!isOnlinePaymentsEnabled()) return;

  const secretKey = getStripeSecretKey();
  if (!secretKey) return;

  const finalCharge = calculateFinalCustomerAmount(params.baseAmount);
  const finalChargeCents = toCents(finalCharge);
  if (finalChargeCents <= 0) return;

  const productId = await createStripeProduct(secretKey, params.name, params.metadata);
  await createStripePrice(
    secretKey,
    productId,
    finalChargeCents,
    params.recurringInterval,
    params.recurringIntervalCount,
  );
}
