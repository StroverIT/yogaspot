import type { BookingPaymentMode as PrismaBookingPaymentMode } from '@prisma/client';
import { isFreeClassPrice } from '@/lib/yoga-class-limits';

export type BookingPaymentMode = PrismaBookingPaymentMode;

export const BOOKING_PAYMENT_MODES: BookingPaymentMode[] = ['onsite', 'online', 'both'];

export const BOOKING_PAYMENT_MODE_LABELS: Record<BookingPaymentMode, string> = {
  onsite: 'На място',
  online: 'Онлайн',
  both: 'И двете',
};

export function isBookingPaymentMode(value: unknown): value is BookingPaymentMode {
  return typeof value === 'string' && BOOKING_PAYMENT_MODES.includes(value as BookingPaymentMode);
}

export function includesOnlinePayment(mode: BookingPaymentMode): boolean {
  return mode === 'online' || mode === 'both';
}

export function includesOnsitePayment(mode: BookingPaymentMode): boolean {
  return mode === 'onsite' || mode === 'both';
}

export function resolvePaymentModeForPrice(price: number, mode: BookingPaymentMode): BookingPaymentMode {
  if (isFreeClassPrice(price)) return 'onsite';
  return mode;
}

export function parsePaymentModeInput(value: unknown, fallback: BookingPaymentMode = 'onsite'): BookingPaymentMode {
  return isBookingPaymentMode(value) ? value : fallback;
}

export function validatePaymentModeForSave(
  mode: BookingPaymentMode,
  price: number,
): { ok: true; mode: BookingPaymentMode } | { ok: false; error: string } {
  const resolved = resolvePaymentModeForPrice(price, mode);
  if (!isBookingPaymentMode(resolved)) {
    return { ok: false, error: 'Invalid payment mode' };
  }
  return { ok: true, mode: resolved };
}

/** Effective mode for catalog items; missing stored mode defaults to onsite. */
export function effectivePaymentMode(
  price: number,
  mode: BookingPaymentMode | null | undefined,
): BookingPaymentMode {
  if (isFreeClassPrice(price)) return 'onsite';
  return mode ?? 'onsite';
}

export function parsePaymentModeFromBody(
  value: unknown,
  price: number,
  fallback: BookingPaymentMode = 'onsite',
): { ok: true; mode: BookingPaymentMode } | { ok: false; error: string } {
  const parsed = parsePaymentModeInput(value, fallback);
  return validatePaymentModeForSave(parsed, price);
}
