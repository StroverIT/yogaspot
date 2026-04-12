import { NextResponse } from 'next/server';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ onlinePayments: isOnlinePaymentsEnabled() });
}
