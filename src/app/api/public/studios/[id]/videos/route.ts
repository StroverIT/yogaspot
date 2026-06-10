import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/api-auth';
import {
  countStudioSubscriptionVideos,
  getStudioSubscriptionVideosForUser,
} from '@/lib/subscription-videos-access';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: studioId } = await ctx.params;
  const user = await getSessionUser();
  const totalCount = await countStudioSubscriptionVideos(studioId);

  if (!user?.id) {
    return NextResponse.json({
      videos: [],
      hasActiveMembership: false,
      totalCount,
    });
  }

  const { videos, hasActiveMembership } = await getStudioSubscriptionVideosForUser(user.id, studioId);

  return NextResponse.json({
    videos,
    hasActiveMembership,
    totalCount,
  });
}
