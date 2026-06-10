import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { fulfillPaidBookingCheckout } from '@/lib/booking-checkout-fulfillment';
import { getStripe } from '@/lib/stripe-server';
import {
  handlePlatformInvoicePaid,
  handlePlatformInvoicePaymentFailed,
  revalidatePlatformBillingPublicCache,
  syncSubscriptionFromStripe,
} from '@/lib/business-platform-billing';
import { syncConnectAccountFromStripe } from '@/lib/stripe-connect';
import {
  fulfillStudioSubscriptionCheckout,
  isStudioSubscriptionMetadata,
  syncStudioMembershipLifecycle,
} from '@/lib/studio-subscription-fulfillment';

export const runtime = 'nodejs';

async function revalidatePlatformBillingFromStripeSub(subscription: Stripe.Subscription): Promise<void> {
  const businessId = subscription.metadata?.businessId;
  if (businessId) {
    await revalidatePlatformBillingPublicCache(businessId);
  }
}

async function handleStudioSubscriptionInvoiceFailed(invoice: Stripe.Invoice): Promise<void> {
  const subId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subId) return;

  const membership = await prisma.studioMembership.findUnique({
    where: { stripeSubscriptionId: subId },
    select: { id: true },
  });
  if (!membership) return;

  await prisma.studioMembership.update({
    where: { stripeSubscriptionId: subId },
    data: { status: 'past_due' },
  });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripeAccountId?: string | null,
): Promise<void> {
  const md = (session.metadata ?? {}) as Record<string, string>;

  if (session.mode === 'subscription' && isStudioSubscriptionMetadata(md)) {
    await fulfillStudioSubscriptionCheckout(session, md, stripeAccountId);
    return;
  }

  if (session.mode === 'payment') {
    await fulfillPaidBookingCheckout(session);
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, 500);
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, 400);
  }

  let event: Stripe.Event;
  const rawBody = await request.text();
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const connectAccountId = typeof event.account === 'string' ? event.account : null;
        if (session.mode === 'payment' || session.mode === 'subscription') {
          await handleCheckoutSessionCompleted(session, connectAccountId);
        }
        break;
      }
      case 'checkout.session.async_payment_failed':
      case 'payment_intent.payment_failed': {
        console.warn('[stripe webhook]', event.type, (event.data.object as { id?: string }).id);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.metadata?.zennoKind === 'platform_subscription') {
          await syncSubscriptionFromStripe(subscription);
          await revalidatePlatformBillingFromStripeSub(subscription);
        } else if (isStudioSubscriptionMetadata(subscription.metadata ?? {})) {
          await syncStudioMembershipLifecycle(subscription);
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.metadata?.zennoKind === 'platform_subscription' || invoice.subscription) {
          const subId =
            typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
          if (subId) {
            const stripe = getStripe();
            const sub = await stripe.subscriptions.retrieve(subId);
            if (sub.metadata?.zennoKind === 'platform_subscription') {
              await handlePlatformInvoicePaid(invoice);
              await syncSubscriptionFromStripe(sub, invoice);
              await revalidatePlatformBillingFromStripeSub(sub);
            }
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (subId) {
          const connectAccountId = typeof event.account === 'string' ? event.account : undefined;
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(
            subId,
            connectAccountId ? { stripeAccount: connectAccountId } : undefined,
          );
          if (sub.metadata?.zennoKind === 'platform_subscription') {
            await handlePlatformInvoicePaymentFailed(invoice);
            await syncSubscriptionFromStripe(sub, invoice);
            await revalidatePlatformBillingFromStripeSub(sub);
          } else if (isStudioSubscriptionMetadata(sub.metadata ?? {})) {
            await handleStudioSubscriptionInvoiceFailed(invoice);
          }
        }
        break;
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        if (account.metadata?.zennoKind === 'connect_seller' || account.id) {
          await syncConnectAccountFromStripe(account);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[stripe webhook] handler error', event.type, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, 500);
  }

  return NextResponse.json({ received: true });
}
