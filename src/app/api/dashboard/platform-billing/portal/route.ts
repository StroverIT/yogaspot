import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import { createPlatformBillingPortalSession } from '@/lib/business-platform-billing';

export const runtime = 'nodejs';

export async function POST() {
  const gate = await requireRole(['business']);
  if (!gate.ok) return gate.response;

  const url = await createPlatformBillingPortalSession(gate.user.id);
  if (!url) {
    return NextResponse.json(
      { error: 'Порталът за плащане не е наличен. Свържете се с нас на info@Zenno.bg.' },
      { status: 503 },
    );
  }

  return NextResponse.json({ url });
}
