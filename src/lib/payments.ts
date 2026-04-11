/** Fixed component of online fee, in BGN (same unit as stored class/subscription prices). */
export const ONLINE_PAYMENT_FIXED_FEE = 0.7;
export const ONLINE_PAYMENT_PERCENT_FEE = 0.03;
export const PAYOUT_MINIMUM_AMOUNT = 100;
export const PAYOUT_FEE_PERCENT = 0.04;

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function calculateOnlinePaymentFee(baseAmount: number): number {
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) return 0;
  return roundCurrency(ONLINE_PAYMENT_FIXED_FEE + baseAmount * ONLINE_PAYMENT_PERCENT_FEE);
}

export function calculateFinalCustomerAmount(baseAmount: number): number {
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) return 0;
  return roundCurrency(baseAmount + calculateOnlinePaymentFee(baseAmount));
}

export function calculatePayoutFee(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return roundCurrency(amount * PAYOUT_FEE_PERCENT);
}

export function calculateNetPayout(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return roundCurrency(amount - calculatePayoutFee(amount));
}
