import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { getProfileSubscriptionVideos } from '@/lib/subscription-videos-access';

export async function GET() {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const videos = await getProfileSubscriptionVideos(gate.user.id);
  return NextResponse.json({ videos });
}
