import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import { getSubscriptionSummaryForOwnerUserId } from '@/lib/business-platform-billing';

export const runtime = 'nodejs';

export async function GET() {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  if (gate.user.role === 'admin') {
    return NextResponse.json({ platformBilling: null });
  }

  const platformBilling = await getSubscriptionSummaryForOwnerUserId(gate.user.id);
  return NextResponse.json({ platformBilling });
}
