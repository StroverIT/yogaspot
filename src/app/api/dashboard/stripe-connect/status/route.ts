import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import { getStripeConnectSummaryForOwnerUserId } from '@/lib/stripe-connect';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  if (gate.user.role === 'admin') {
    return NextResponse.json({ stripeConnect: null });
  }

  const refresh = new URL(request.url).searchParams.get('refresh') === '1';
  const stripeConnect = await getStripeConnectSummaryForOwnerUserId(gate.user.id, { refresh });
  return NextResponse.json({ stripeConnect });
}
