import { formatPriceDualFromBgn } from '@/lib/eur-bgn';

/** Stored in DB when the business selects „Няма лимит“ for online classes. */
export const UNLIMITED_CLASS_CAPACITY = 999_999;

export function isUnlimitedClassCapacity(maxCapacity: number): boolean {
  return Number.isFinite(maxCapacity) && maxCapacity >= UNLIMITED_CLASS_CAPACITY;
}

export function isClassAtCapacity(enrolled: number, maxCapacity: number): boolean {
  if (isUnlimitedClassCapacity(maxCapacity)) return false;
  return enrolled >= maxCapacity;
}

export function formatClassCapacityDisplay(enrolled: number, maxCapacity: number): string {
  if (isUnlimitedClassCapacity(maxCapacity)) {
    return enrolled > 0 ? `${enrolled} · без лимит` : 'Без лимит';
  }
  return `${enrolled}/${maxCapacity}`;
}

export function isFreeClassPrice(price: number): boolean {
  return !Number.isFinite(price) || price <= 0;
}

export function formatClassPriceDisplay(price: number): string {
  if (isFreeClassPrice(price)) return 'Безплатно';
  return formatPriceDualFromBgn(price);
}

export function resolveClassMaxCapacity(input: number, unlimited: boolean): number {
  return unlimited ? UNLIMITED_CLASS_CAPACITY : input;
}
