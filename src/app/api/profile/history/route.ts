import { NextResponse } from 'next/server';
import { getProfileHistoryPayload } from '@/lib/profile-history';
import { requireSession } from '@/lib/api-auth';

export const runtime = 'nodejs';

export async function GET() {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const payload = await getProfileHistoryPayload(gate.user.id);
  return NextResponse.json(payload);
}
