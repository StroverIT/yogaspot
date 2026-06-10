import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { getProfileActiveSubscriptions } from '@/lib/profile-subscriptions';

export async function GET() {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const subscriptions = await getProfileActiveSubscriptions(gate.user.id);
  return NextResponse.json({ subscriptions });
}
