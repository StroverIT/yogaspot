/**
 * Stripe / checkout environment (server + URLs):
 * - STRIPE_SECRET_KEY - Stripe API (Checkout + webhooks + refunds + Connect OAuth token exchange)
 * - STRIPE_CONNECT_CLIENT_ID - Connect OAuth client ID (`ca_...`) from Stripe Dashboard > Connect > Settings
 * - STRIPE_WEBHOOK_SECRET - verify `stripe-signature` on POST /api/webhooks/stripe (webhook no-ops when off)
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY - optional for hosted Checkout redirect; needed for Elements later
 * - NEXT_PUBLIC_APP_URL - site origin for Checkout success/cancel URLs (fallback: NEXTAUTH_URL)
 * - DATABASE_URL - Prisma
 * - NEXTAUTH_URL / NEXTAUTH_SECRET - NextAuth session for POST /api/checkout/class
 * - SUPABASE_URL / SUPABASE_ANON_KEY - storage / future client Supabase (not used by these routes today)
 * - EMAIL_FROM - From address for booking emails (required for any mail transport)
 * - SMTP: SMTP_HOST (+ SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE as needed) - **if SMTP_HOST is set, SMTP is used**
 *   even when Google OAuth env vars exist (so NextAuth Google keys do not take over mail by mistake).
 * - Gmail OAuth (only when SMTP_HOST is unset): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
 *   GOOGLE_REFRESH_TOKEN (or REFRESH_TOKEN), REDIRECT_URI; see mailer.ts (DigiStart-style googleapis)
 */
import Stripe from 'stripe';
import { bgnToEur } from '@/lib/eur-bgn';
import { calculateFinalCustomerAmount } from '@/lib/payments';

let stripeSingleton: Stripe | null = null;

export function assertStripeConfigured(): void {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
}

export function getStripe(): Stripe {
  assertStripeConfigured();
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  return stripeSingleton;
}

/** Final customer charge in BGN → Stripe Checkout `unit_amount` in EUR minor units. */
export function bgnFinalAmountToStripeUnitAmountEurCents(finalAmountBgn: number): number {
  if (!Number.isFinite(finalAmountBgn) || finalAmountBgn <= 0) return 0;
  return Math.round(bgnToEur(finalAmountBgn) * 100);
}

/**
 * Final customer charge (same as catalog sync) rounded to EUR minor units for Stripe Checkout.
 */
export function classPriceToStripeUnitAmountEurCents(classPriceBase: number): number {
  return bgnFinalAmountToStripeUnitAmountEurCents(calculateFinalCustomerAmount(classPriceBase));
}

export function subscriptionBaseBgnToStripeUnitAmountEurCents(baseAmountBgn: number): number {
  return bgnFinalAmountToStripeUnitAmountEurCents(calculateFinalCustomerAmount(baseAmountBgn));
}

export function getPublicAppBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    '';
  return fromEnv.replace(/\/$/, '');
}
