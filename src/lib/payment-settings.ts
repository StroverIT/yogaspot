/**
 * When `ONLINE_PAYMENTS` is not `false`, Stripe checkout and catalog sync stay enabled (default).
 */
export function isOnlinePaymentsEnabled(): boolean {
  const v = process.env.ONLINE_PAYMENTS?.trim().toLowerCase();
  if (!v) return true;
  return v !== 'false' && v !== '0' && v !== 'no';
}
