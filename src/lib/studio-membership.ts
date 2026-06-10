import type { StudioMembershipStatus } from '@prisma/client';
import type Stripe from 'stripe';

export const ACTIVE_STUDIO_MEMBERSHIP_STATUSES = ['active', 'past_due'] as const satisfies readonly StudioMembershipStatus[];

export const BLOCKING_STUDIO_MEMBERSHIP_STATUSES = [
  'active',
  'past_due',
  'incomplete',
] as const satisfies readonly StudioMembershipStatus[];

export function isActiveStudioMembershipStatus(status: StudioMembershipStatus): boolean {
  return (ACTIVE_STUDIO_MEMBERSHIP_STATUSES as readonly StudioMembershipStatus[]).includes(status);
}

export function blocksStudioSubscriptionCheckout(status: StudioMembershipStatus): boolean {
  return (BLOCKING_STUDIO_MEMBERSHIP_STATUSES as readonly StudioMembershipStatus[]).includes(status);
}

export function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): StudioMembershipStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'incomplete';
  }
}

export function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const end = subscription.current_period_end;
  if (!end) return null;
  return new Date(end * 1000);
}

export function customerIdFromSubscription(subscription: Stripe.Subscription): string | null {
  const customer = subscription.customer;
  if (typeof customer === 'string') return customer;
  if (customer && typeof customer === 'object' && 'id' in customer) {
    return (customer as { id: string }).id;
  }
  return null;
}
