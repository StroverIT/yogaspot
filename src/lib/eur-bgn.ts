/**
 * Display conversion: amounts in the database stay in BGN (лв.); users enter EUR in forms.
 * 1 EUR = BGN_PER_EUR лв. (app display rate).
 */
export const BGN_PER_EUR = 1.9583 as const;

function roundMoney(n: number, decimals = 2): number {
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export function bgnToEur(bgn: number): number {
  if (!Number.isFinite(bgn)) return 0;
  return bgn / BGN_PER_EUR;
}

export function eurToBgn(eur: number): number {
  if (!Number.isFinite(eur)) return 0;
  return eur * BGN_PER_EUR;
}

/** "12,50 € · 24,48 лв." */
export function formatPriceDualFromBgn(bgnAmount: number): string {
  if (!Number.isFinite(bgnAmount)) return '—';
  const eur = roundMoney(bgnToEur(bgnAmount), 2);
  const bgn = roundMoney(bgnAmount, 2);
  const eurStr = new Intl.NumberFormat('bg-BG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(eur);
  const bgnStr = new Intl.NumberFormat('bg-BG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(bgn);
  return `${eurStr} € · ${bgnStr} лв.`;
}

export function formatMonthlyDualFromBgn(bgnMonthly: number): string {
  return `${formatPriceDualFromBgn(bgnMonthly)}/мес.`;
}

/** Prefill EUR field from stored BGN (class / schedule integer prices). */
export function formatEurInputFromBgn(bgn: number): string {
  if (!Number.isFinite(bgn)) return '';
  const eur = roundMoney(bgnToEur(bgn), 2);
  return String(eur).replace('.', ',');
}

/** Parse user EUR input (comma or dot). */
export function parseEurInput(raw: string): number {
  const n = Number(raw.replace(',', '.').trim());
  return Number.isFinite(n) ? n : NaN;
}

/** Persisted class/schedule price (BGN, integer) from EUR input. */
export function classPriceBgnFromEur(eur: number): number {
  return Math.max(0, Math.round(eurToBgn(eur)));
}

/** Subscription / float BGN from EUR. */
export function subscriptionPriceBgnFromEur(eur: number): number {
  return Math.max(0, roundMoney(eurToBgn(eur), 2));
}
