import type {
  BusinessPlatformPayment,
  BusinessPlatformPaymentStatus,
  BusinessPlatformSubscription,
  BusinessPlatformSubscriptionStatus,
} from '@prisma/client';
import type Stripe from 'stripe';
import { cache } from 'react';
import { invalidateAfterCatalogChange } from '@/lib/app-revalidate';
import { prisma } from '@/lib/prisma';
import { getPublicAppBaseUrl, getStripe } from '@/lib/stripe-server';

export const EARLY_ADOPTER_LIMIT = 20;
export const TRIAL_DAYS = 30;
export const GRACE_DAYS = 3;
export const MONTHLY_PRICE_EUR = 10;

export type PlatformBillingSummary = {
  hasSubscription: boolean;
  stripeConnected: boolean;
  status: BusinessPlatformSubscriptionStatus | null;
  isEarlyAdopter: boolean;
  trialDaysRemaining: number | null;
  nextPaymentDueAt: string | null;
  graceDaysRemaining: number | null;
  isBlocked: boolean;
  monthlyAmountEur: number;
  payments: PlatformPaymentDto[];
};

export type PlatformPaymentDto = {
  id: string;
  amountEur: number;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  paidAt: string | null;
  status: BusinessPlatformPaymentStatus;
};

export type BusinessOfferDto = {
  slotsRemaining: number;
  trialDays: number;
  monthlyPriceEur: number;
  earlyAdopterLimit: number;
};

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Trial ends TRIAL_DAYS after the business owner account was created. */
export function computeTrialEndsAt(accountCreatedAt: Date): Date {
  return new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

type SubscriptionWithOwnerCreatedAt = BusinessPlatformSubscription & {
  business?: { owner: { createdAt: Date } };
};

function resolveTrialEndsAt(subscription: SubscriptionWithOwnerCreatedAt): Date | null {
  if (!subscription.isEarlyAdopter) return subscription.trialEndsAt;
  const accountCreatedAt = subscription.business?.owner?.createdAt;
  if (!accountCreatedAt) return subscription.trialEndsAt;
  return computeTrialEndsAt(accountCreatedAt);
}

function toPaymentDto(p: BusinessPlatformPayment): PlatformPaymentDto {
  return {
    id: p.id,
    amountEur: p.amountEur,
    periodStart: p.periodStart.toISOString(),
    periodEnd: p.periodEnd.toISOString(),
    dueDate: p.dueDate.toISOString(),
    paidAt: p.paidAt?.toISOString() ?? null,
    status: p.status,
  };
}

export async function getBusinessCount(): Promise<number> {
  return prisma.business.count();
}

export async function getEarlyAdopterSlotsRemaining(): Promise<number> {
  const count = await getBusinessCount();
  return Math.max(0, EARLY_ADOPTER_LIMIT - count);
}

export async function getBusinessOffer(): Promise<BusinessOfferDto> {
  return {
    slotsRemaining: await getEarlyAdopterSlotsRemaining(),
    trialDays: TRIAL_DAYS,
    monthlyPriceEur: MONTHLY_PRICE_EUR,
    earlyAdopterLimit: EARLY_ADOPTER_LIMIT,
  };
}

export function getPlatformPriceId(): string | null {
  const id = process.env.STRIPE_PLATFORM_PRICE_ID?.trim();
  return id || null;
}

async function ensurePlatformStripePriceId(): Promise<string> {
  const existing = getPlatformPriceId();
  if (existing) return existing;

  const stripe = getStripe();
  const products = await stripe.products.list({ limit: 100, active: true });
  let product = products.data.find((p) => p.metadata?.zennoKind === 'platform_subscription');

  if (!product) {
    product = await stripe.products.create({
      name: 'Zenno платформен абонамент',
      metadata: { zennoKind: 'platform_subscription' },
    });
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  let price = prices.data.find(
    (p) =>
      p.currency === 'eur' &&
      p.recurring?.interval === 'month' &&
      p.unit_amount === Math.round(MONTHLY_PRICE_EUR * 100),
  );

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: 'eur',
      unit_amount: Math.round(MONTHLY_PRICE_EUR * 100),
      recurring: { interval: 'month' },
      metadata: { zennoKind: 'platform_subscription' },
    });
  }

  return price.id;
}

function mapStripeSubscriptionStatus(
  stripeSub: Stripe.Subscription,
  local: BusinessPlatformSubscription,
): BusinessPlatformSubscriptionStatus {
  if (stripeSub.status === 'trialing') return 'trial';
  if (stripeSub.status === 'active') return 'active';
  if (stripeSub.status === 'past_due' || stripeSub.status === 'unpaid') {
    if (local.gracePeriodEndsAt && new Date() > local.gracePeriodEndsAt) return 'blocked';
    return 'past_due';
  }
  if (stripeSub.status === 'canceled' || stripeSub.status === 'incomplete_expired') return 'blocked';
  return local.status;
}

/** Read-only access resolution; Stripe webhooks restore `active` after successful payment. */
export function resolvePlatformAccessStatus(
  subscription: SubscriptionWithOwnerCreatedAt,
  now: Date = new Date(),
): BusinessPlatformSubscriptionStatus {
  const effectiveTrialEndsAt = resolveTrialEndsAt(subscription);

  if (subscription.status === 'past_due' && subscription.gracePeriodEndsAt && now > subscription.gracePeriodEndsAt) {
    return 'blocked';
  }

  if (subscription.status === 'trial' && effectiveTrialEndsAt && now >= effectiveTrialEndsAt) {
    return 'blocked';
  }

  return subscription.status;
}

export async function evaluateAndPersistAccess(
  subscription: SubscriptionWithOwnerCreatedAt,
): Promise<BusinessPlatformSubscription> {
  const now = new Date();
  const effectiveTrialEndsAt = resolveTrialEndsAt(subscription);
  const resolvedStatus = resolvePlatformAccessStatus(subscription, now);

  const data: {
    status?: BusinessPlatformSubscriptionStatus;
    trialEndsAt?: Date;
  } = {};

  if (resolvedStatus !== subscription.status) {
    data.status = resolvedStatus;
  }

  if (
    effectiveTrialEndsAt &&
    subscription.trialEndsAt?.getTime() !== effectiveTrialEndsAt.getTime()
  ) {
    data.trialEndsAt = effectiveTrialEndsAt;
  }

  if (Object.keys(data).length === 0) return subscription;

  return prisma.businessPlatformSubscription.update({
    where: { id: subscription.id },
    data,
  });
}

export function isPlatformAccessBlocked(status: BusinessPlatformSubscriptionStatus | null | undefined): boolean {
  return status === 'blocked';
}

function buildBlockedBillingSummary(
  overrides: Partial<PlatformBillingSummary> = {},
): PlatformBillingSummary {
  return {
    hasSubscription: false,
    stripeConnected: false,
    status: 'blocked',
    isEarlyAdopter: false,
    trialDaysRemaining: null,
    nextPaymentDueAt: null,
    graceDaysRemaining: null,
    isBlocked: true,
    monthlyAmountEur: MONTHLY_PRICE_EUR,
    payments: [],
    ...overrides,
  };
}

/** Whether a business studio may appear in public catalog / studio pages. */
export function isBusinessPubliclyListedStatus(
  status: BusinessPlatformSubscriptionStatus | null,
  options?: { trialEndsAt?: Date | null; now?: Date },
): boolean {
  if (status === null || status === 'blocked') return false;
  if (status === 'trial') {
    const now = options?.now ?? new Date();
    const trialEndsAt = options?.trialEndsAt;
    if (trialEndsAt && now >= trialEndsAt) return false;
  }
  return true;
}

export async function isBusinessPubliclyListed(businessId: string): Promise<boolean> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      owner: { select: { createdAt: true } },
      platformSubscription: {
        include: {
          business: { select: { owner: { select: { createdAt: true } } } },
        },
      },
    },
  });
  if (!business) return false;

  const sub = business.platformSubscription;
  if (sub) {
    const evaluated = await evaluateAndPersistAccess(sub);
    return isBusinessPubliclyListedStatus(evaluated.status, {
      trialEndsAt: resolveTrialEndsAt({ ...evaluated, business: sub.business }),
    });
  }

  const businessCount = await getBusinessCount();
  if (businessCount > EARLY_ADOPTER_LIMIT) return false;

  const trialEndsAt = computeTrialEndsAt(business.owner.createdAt);
  return new Date() < trialEndsAt;
}

/** Returns business IDs that may appear in public listings. */
export async function filterPublicBusinessIds(businessIds: string[]): Promise<Set<string>> {
  if (businessIds.length === 0) return new Set();

  const uniqueIds = [...new Set(businessIds)];
  const [businesses, businessCount] = await Promise.all([
    prisma.business.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        owner: { select: { createdAt: true } },
        platformSubscription: {
          include: {
            business: { select: { owner: { select: { createdAt: true } } } },
          },
        },
      },
    }),
    getBusinessCount(),
  ]);

  const now = new Date();
  const listed = new Set<string>();

  for (const biz of businesses) {
    const sub = biz.platformSubscription;
    if (sub) {
      const evaluated = await evaluateAndPersistAccess(sub);
      if (
        isBusinessPubliclyListedStatus(evaluated.status, {
          trialEndsAt: resolveTrialEndsAt({ ...evaluated, business: sub.business }),
          now,
        })
      ) {
        listed.add(biz.id);
      }
    } else if (businessCount <= EARLY_ADOPTER_LIMIT) {
      const trialEndsAt = computeTrialEndsAt(biz.owner.createdAt);
      if (now < trialEndsAt) listed.add(biz.id);
    }
  }

  return listed;
}

/** Invalidate public catalog/studio caches after platform billing status changes. */
export async function revalidatePlatformBillingPublicCache(businessId: string): Promise<void> {
  const studio = await prisma.studio.findFirst({
    where: { businessId },
    select: { id: true },
  });
  invalidateAfterCatalogChange(undefined, studio?.id);
}

/** One-time repair: persist `blocked` for expired trials and grace periods. */
export async function repairExpiredPlatformSubscriptions(): Promise<number> {
  const rows = await prisma.businessPlatformSubscription.findMany({
    include: {
      business: { select: { owner: { select: { createdAt: true } } } },
      payments: { where: { status: 'paid' }, take: 1 },
    },
  });

  const now = new Date();
  let repaired = 0;

  for (const row of rows) {
    const before = row.status;
    const effectiveTrialEndsAt = resolveTrialEndsAt(row);
    const trialExpired = Boolean(effectiveTrialEndsAt && now >= effectiveTrialEndsAt);
    const hasPaidInvoice = row.payments.length > 0;

    if (
      trialExpired &&
      !hasPaidInvoice &&
      (before === 'trial' || before === 'active') &&
      before !== 'blocked'
    ) {
      await prisma.businessPlatformSubscription.update({
        where: { id: row.id },
        data: { status: 'blocked' },
      });
      repaired += 1;
      continue;
    }

    const after = (await evaluateAndPersistAccess(row)).status;
    if (before !== after) repaired += 1;
  }
  return repaired;
}

export async function getSubscriptionForBusinessId(businessId: string) {
  return prisma.businessPlatformSubscription.findUnique({
    where: { businessId },
    include: {
      payments: { orderBy: { dueDate: 'desc' }, take: 24 },
      business: { select: { owner: { select: { createdAt: true } } } },
    },
  });
}

export async function getSubscriptionForOwnerUserId(ownerUserId: string) {
  const biz = await prisma.business.findUnique({
    where: { ownerUserId },
    select: { id: true },
  });
  if (!biz) return null;
  return getSubscriptionForBusinessId(biz.id);
}

export async function buildPlatformBillingSummary(
  subscription: BusinessPlatformSubscription & {
    payments: BusinessPlatformPayment[];
    business?: { owner: { createdAt: Date } };
  },
): Promise<PlatformBillingSummary> {
  const evaluated = await evaluateAndPersistAccess(subscription);
  const now = new Date();
  const effectiveTrialEndsAt = resolveTrialEndsAt({ ...evaluated, business: subscription.business });

  let trialDaysRemaining: number | null = null;
  if (evaluated.status === 'trial' && effectiveTrialEndsAt) {
    trialDaysRemaining = daysBetween(now, effectiveTrialEndsAt);
  }

  let graceDaysRemaining: number | null = null;
  if (evaluated.status === 'past_due' && evaluated.gracePeriodEndsAt) {
    graceDaysRemaining = daysBetween(now, evaluated.gracePeriodEndsAt);
  }

  return {
    hasSubscription: true,
    stripeConnected: Boolean(evaluated.stripeCustomerId),
    status: evaluated.status,
    isEarlyAdopter: evaluated.isEarlyAdopter,
    trialDaysRemaining,
    nextPaymentDueAt: evaluated.nextPaymentDueAt?.toISOString() ?? null,
    graceDaysRemaining,
    isBlocked: isPlatformAccessBlocked(evaluated.status),
    monthlyAmountEur: evaluated.monthlyAmountEur,
    payments: subscription.payments.map(toPaymentDto),
  };
}

export const getSubscriptionSummaryForOwnerUserId = cache(async function getSubscriptionSummaryForOwnerUserId(
  ownerUserId: string,
): Promise<PlatformBillingSummary | null> {
  const user = await prisma.user.findUnique({
    where: { id: ownerUserId },
    select: { role: true, createdAt: true },
  });
  if (user?.role !== 'business') return null;

  const sub = await getSubscriptionForOwnerUserId(ownerUserId);
  if (sub) return buildPlatformBillingSummary(sub);

  const businessCount = await getBusinessCount();
  const trialEndsAt = computeTrialEndsAt(user.createdAt);
  const now = new Date();

  if (businessCount > EARLY_ADOPTER_LIMIT) {
    return buildBlockedBillingSummary({ isEarlyAdopter: false });
  }

  if (now >= trialEndsAt) {
    return buildBlockedBillingSummary({
      isEarlyAdopter: true,
      nextPaymentDueAt: trialEndsAt.toISOString(),
    });
  }

  return {
    hasSubscription: false,
    stripeConnected: false,
    status: 'trial',
    isEarlyAdopter: true,
    trialDaysRemaining: daysBetween(now, trialEndsAt),
    nextPaymentDueAt: trialEndsAt.toISOString(),
    graceDaysRemaining: null,
    isBlocked: false,
    monthlyAmountEur: MONTHLY_PRICE_EUR,
    payments: [],
  };
});

export async function provisionPlatformSubscription(businessId: string): Promise<BusinessPlatformSubscription> {
  const existing = await prisma.businessPlatformSubscription.findUnique({ where: { businessId } });
  if (existing) return existing;

  const business = await prisma.business.findUniqueOrThrow({
    where: { id: businessId },
    include: { owner: { select: { email: true, name: true, createdAt: true } } },
  });

  const businessCount = await getBusinessCount();
  const isEarlyAdopter = businessCount <= EARLY_ADOPTER_LIMIT;
  const now = new Date();
  let persistedTrialEndsAt = isEarlyAdopter ? computeTrialEndsAt(business.owner.createdAt) : null;
  const trialActive = Boolean(persistedTrialEndsAt && persistedTrialEndsAt > now);
  let nextPaymentDueAt =
    trialActive && persistedTrialEndsAt ? new Date(persistedTrialEndsAt.getTime()) : new Date(now.getTime());

  let stripeCustomerId: string | null = null;
  let stripeSubscriptionId: string | null = null;

  try {
    const stripe = getStripe();
    const priceId = await ensurePlatformStripePriceId();
    const customer = await stripe.customers.create({
      email: business.owner.email ?? undefined,
      name: business.owner.name ?? undefined,
      metadata: { businessId, ownerUserId: business.ownerUserId, zennoKind: 'platform_subscription' },
    });
    stripeCustomerId = customer.id;

    const trialEndUnix =
      trialActive && persistedTrialEndsAt ? Math.floor(persistedTrialEndsAt.getTime() / 1000) : undefined;

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_end: trialEndUnix,
      metadata: { businessId, ownerUserId: business.ownerUserId, zennoKind: 'platform_subscription' },
      payment_settings: { save_default_payment_method: 'on_subscription' },
      collection_method: 'charge_automatically',
    });
    stripeSubscriptionId = subscription.id;

    if (subscription.trial_end && trialActive) {
      persistedTrialEndsAt = new Date(subscription.trial_end * 1000);
    }
    if (subscription.current_period_end) {
      nextPaymentDueAt = new Date(subscription.current_period_end * 1000);
    }
  } catch (err) {
    console.error('[platform billing] Stripe provision failed', err);
  }

  return prisma.businessPlatformSubscription.create({
    data: {
      businessId,
      status: trialActive ? 'trial' : 'blocked',
      isEarlyAdopter,
      trialEndsAt: trialActive ? persistedTrialEndsAt : null,
      nextPaymentDueAt,
      monthlyAmountEur: MONTHLY_PRICE_EUR,
      stripeCustomerId,
      stripeSubscriptionId,
    },
  });
}

export async function ensureStripeSubscriptionForExisting(
  subscription: BusinessPlatformSubscription,
): Promise<BusinessPlatformSubscription> {
  if (subscription.stripeSubscriptionId && subscription.stripeCustomerId) return subscription;

  const business = await prisma.business.findUniqueOrThrow({
    where: { id: subscription.businessId },
    include: { owner: { select: { email: true, name: true, createdAt: true } } },
  });

  try {
    const stripe = getStripe();
    const priceId = await ensurePlatformStripePriceId();

    let customerId = subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: business.owner.email ?? undefined,
        name: business.owner.name ?? undefined,
        metadata: {
          businessId: subscription.businessId,
          ownerUserId: business.ownerUserId,
          zennoKind: 'platform_subscription',
        },
      });
      customerId = customer.id;
    }

    const now = new Date();
    const effectiveTrialEndsAt = resolveTrialEndsAt({
      ...subscription,
      business: { owner: { createdAt: business.owner.createdAt } },
    });
    const trialStillActive =
      subscription.status === 'trial' && effectiveTrialEndsAt && effectiveTrialEndsAt > now;
    const trialEndUnix = trialStillActive ? Math.floor(effectiveTrialEndsAt.getTime() / 1000) : undefined;

    const stripeSub = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_end: trialEndUnix,
      metadata: {
        businessId: subscription.businessId,
        ownerUserId: business.ownerUserId,
        zennoKind: 'platform_subscription',
      },
      payment_settings: { save_default_payment_method: 'on_subscription' },
      collection_method: 'charge_automatically',
    });

    return prisma.businessPlatformSubscription.update({
      where: { id: subscription.id },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSub.id,
        nextPaymentDueAt: stripeSub.current_period_end
          ? new Date(stripeSub.current_period_end * 1000)
          : subscription.nextPaymentDueAt,
      },
    });
  } catch (err) {
    console.error('[platform billing] lazy Stripe sync failed', err);
    return subscription;
  }
}

function mapInvoicePaymentStatus(invoice: Stripe.Invoice): BusinessPlatformPaymentStatus {
  if (invoice.status === 'paid') return 'paid';
  if (invoice.status === 'open' && invoice.due_date && invoice.due_date * 1000 < Date.now()) return 'overdue';
  if (invoice.status === 'uncollectible' || invoice.status === 'void') return 'failed';
  return 'pending';
}

export async function upsertPlatformPaymentFromInvoice(
  subscriptionId: string,
  invoice: Stripe.Invoice,
): Promise<void> {
  if (!invoice.id) return;

  const amountEur = (invoice.amount_due ?? invoice.total ?? 0) / 100;
  const periodStart = invoice.period_start ? new Date(invoice.period_start * 1000) : new Date();
  const periodEnd = invoice.period_end ? new Date(invoice.period_end * 1000) : periodStart;
  const dueDate = invoice.due_date ? new Date(invoice.due_date * 1000) : periodEnd;
  const paidAt = invoice.status_transitions?.paid_at
    ? new Date(invoice.status_transitions.paid_at * 1000)
    : invoice.status === 'paid'
      ? new Date()
      : null;
  const status = mapInvoicePaymentStatus(invoice);

  await prisma.businessPlatformPayment.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      subscriptionId,
      stripeInvoiceId: invoice.id,
      amountEur,
      periodStart,
      periodEnd,
      dueDate,
      paidAt,
      status,
    },
    update: {
      amountEur,
      periodStart,
      periodEnd,
      dueDate,
      paidAt,
      status,
    },
  });
}

export async function syncSubscriptionFromStripe(
  stripeSub: Stripe.Subscription,
  invoice?: Stripe.Invoice,
): Promise<void> {
  const local = await prisma.businessPlatformSubscription.findFirst({
    where: {
      OR: [{ stripeSubscriptionId: stripeSub.id }, { businessId: stripeSub.metadata?.businessId ?? '' }],
    },
    include: { business: { select: { owner: { select: { createdAt: true } } } } },
  });
  if (!local) return;

  const gracePeriodEndsAt =
    stripeSub.status === 'past_due' || stripeSub.status === 'unpaid'
      ? local.gracePeriodEndsAt ?? new Date(Date.now() + GRACE_DAYS * 24 * 60 * 60 * 1000)
      : null;

  let status = mapStripeSubscriptionStatus(stripeSub, local);
  if (status === 'past_due' && gracePeriodEndsAt && new Date() > gracePeriodEndsAt) {
    status = 'blocked';
  }

  const accountTrialEndsAt = resolveTrialEndsAt(local);
  const stripeTrialEndsAt = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null;
  const trialEndsAt = accountTrialEndsAt ?? stripeTrialEndsAt ?? local.trialEndsAt;
  const nextPaymentDueAt = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : local.nextPaymentDueAt;

  await prisma.businessPlatformSubscription.update({
    where: { id: local.id },
    data: {
      stripeSubscriptionId: stripeSub.id,
      stripeCustomerId: typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer?.id,
      status,
      trialEndsAt,
      nextPaymentDueAt,
      gracePeriodEndsAt,
    },
  });

  if (invoice) {
    await upsertPlatformPaymentFromInvoice(local.id, invoice);
  }
}

export async function handlePlatformInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subscriptionId) return;

  const local = await prisma.businessPlatformSubscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (!local) return;

  await upsertPlatformPaymentFromInvoice(local.id, invoice);

  await prisma.businessPlatformSubscription.update({
    where: { id: local.id },
    data: {
      status: 'active',
      gracePeriodEndsAt: null,
      nextPaymentDueAt: invoice.period_end ? new Date(invoice.period_end * 1000) : local.nextPaymentDueAt,
    },
  });
}

export async function handlePlatformInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subscriptionId) return;

  const local = await prisma.businessPlatformSubscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (!local) return;

  await upsertPlatformPaymentFromInvoice(local.id, invoice);

  const gracePeriodEndsAt = new Date(Date.now() + GRACE_DAYS * 24 * 60 * 60 * 1000);

  await prisma.businessPlatformSubscription.update({
    where: { id: local.id },
    data: {
      status: 'past_due',
      gracePeriodEndsAt,
    },
  });
}

function getPlatformBillingReturnUrl(): string {
  const appUrl = getPublicAppBaseUrl() ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  return `${appUrl}/dashboard`;
}

async function findPayablePlatformInvoice(
  stripe: Stripe,
  stripeSubId: string,
): Promise<Stripe.Invoice | null> {
  const open = await stripe.invoices.list({
    subscription: stripeSubId,
    status: 'open',
    limit: 5,
  });
  const openInvoice = open.data.find((invoice) => (invoice.amount_due ?? 0) > 0);
  if (openInvoice) return openInvoice;

  const draft = await stripe.invoices.list({
    subscription: stripeSubId,
    status: 'draft',
    limit: 1,
  });
  if (draft.data[0]) {
    return stripe.invoices.finalizeInvoice(draft.data[0].id);
  }

  try {
    const created = await stripe.invoices.create({
      subscription: stripeSubId,
      auto_advance: true,
    });
    if ((created.amount_due ?? 0) > 0) return created;
  } catch (err) {
    console.warn('[platform billing] could not create invoice', err);
  }

  return null;
}

async function tryCollectOpenPlatformInvoice(
  stripe: Stripe,
  invoice: Stripe.Invoice,
  businessId: string,
  returnUrl: string,
): Promise<string | null> {
  if (!invoice.id || (invoice.amount_due ?? 0) <= 0) return null;

  try {
    const paid = await stripe.invoices.pay(invoice.id);
    if (paid.status === 'paid') {
      await handlePlatformInvoicePaid(paid);
      const subId = typeof paid.subscription === 'string' ? paid.subscription : paid.subscription?.id;
      if (subId) {
        const stripeSub = await stripe.subscriptions.retrieve(subId);
        await syncSubscriptionFromStripe(stripeSub, paid);
      }
      await revalidatePlatformBillingPublicCache(businessId);
      return `${returnUrl}?platform_billing=success`;
    }
  } catch (err) {
    console.warn('[platform billing] auto-pay failed, using hosted invoice', err);
  }

  const hostedUrl = invoice.hosted_invoice_url;
  if (hostedUrl) return hostedUrl;

  const refreshed = await stripe.invoices.retrieve(invoice.id);
  return refreshed.hosted_invoice_url ?? null;
}

async function createPlatformCheckoutSessionUrl(params: {
  stripe: Stripe;
  customerId: string;
  businessId: string;
  ownerUserId: string;
  returnUrl: string;
}): Promise<string> {
  const priceId = await ensurePlatformStripePriceId();
  const session = await params.stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${params.returnUrl}?platform_billing=success`,
    cancel_url: `${params.returnUrl}?platform_billing=canceled`,
    subscription_data: {
      metadata: {
        businessId: params.businessId,
        ownerUserId: params.ownerUserId,
        zennoKind: 'platform_subscription',
      },
    },
  });

  if (!session.url) {
    throw new Error('Stripe Checkout session missing url');
  }
  return session.url;
}

/**
 * Resolves the best URL to collect platform subscription payment.
 * Ends an overdue Stripe trial, pays open invoices, or falls back to Checkout.
 */
export async function createPlatformBillingPortalSession(ownerUserId: string): Promise<string | null> {
  let sub = await getSubscriptionForOwnerUserId(ownerUserId);
  if (!sub) {
    const biz = await prisma.business.findUnique({
      where: { ownerUserId },
      select: { id: true },
    });
    if (!biz) return null;
    sub = await provisionPlatformSubscription(biz.id);
  }

  const synced = await ensureStripeSubscriptionForExisting(sub);
  if (!synced.stripeCustomerId) return null;

  const stripe = getStripe();
  const returnUrl = getPlatformBillingReturnUrl();

  const business = await prisma.business.findUnique({
    where: { id: synced.businessId },
    select: { owner: { select: { createdAt: true } } },
  });
  if (!business) return null;

  const effectiveTrialEndsAt = resolveTrialEndsAt({
    ...synced,
    business: { owner: { createdAt: business.owner.createdAt } },
  });
  const now = new Date();
  const localTrialExpired = Boolean(effectiveTrialEndsAt && now >= effectiveTrialEndsAt);

  let stripeSubId = synced.stripeSubscriptionId;

  if (stripeSubId) {
    let stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

    if (stripeSub.status === 'trialing' && localTrialExpired) {
      stripeSub = await stripe.subscriptions.update(stripeSubId, { trial_end: 'now' });
      await syncSubscriptionFromStripe(stripeSub);
    }

    const payableInvoice = await findPayablePlatformInvoice(stripe, stripeSubId);
    if (payableInvoice) {
      const paymentUrl = await tryCollectOpenPlatformInvoice(
        stripe,
        payableInvoice,
        synced.businessId,
        returnUrl,
      );
      if (paymentUrl) return paymentUrl;
    }

    stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

    if (stripeSub.status === 'active') {
      await syncSubscriptionFromStripe(stripeSub);
      await revalidatePlatformBillingPublicCache(synced.businessId);
      return returnUrl;
    }

    if (stripeSub.status === 'past_due' || stripeSub.status === 'unpaid') {
      const portal = await stripe.billingPortal.sessions.create({
        customer: synced.stripeCustomerId,
        return_url: returnUrl,
      });
      return portal.url;
    }

    if (
      stripeSub.status === 'canceled' ||
      stripeSub.status === 'incomplete_expired' ||
      stripeSub.status === 'incomplete'
    ) {
      return createPlatformCheckoutSessionUrl({
        stripe,
        customerId: synced.stripeCustomerId,
        businessId: synced.businessId,
        ownerUserId,
        returnUrl,
      });
    }

    if (stripeSub.status === 'trialing' && !localTrialExpired) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: synced.stripeCustomerId,
        return_url: returnUrl,
      });
      return portal.url;
    }
  }

  if (!stripeSubId) {
    return createPlatformCheckoutSessionUrl({
      stripe,
      customerId: synced.stripeCustomerId,
      businessId: synced.businessId,
      ownerUserId,
      returnUrl,
    });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: synced.stripeCustomerId,
    return_url: returnUrl,
  });
  return portal.url;
}
