import { NextResponse } from 'next/server';
import { getBusinessOffer } from '@/lib/business-platform-billing';

export const runtime = 'nodejs';

export async function GET() {
  const offer = await getBusinessOffer();
  return NextResponse.json(offer);
}
