import { prisma } from '@/lib/prisma';
import { sendStudioReviewEmails } from '@/lib/studio-review-email';

/** Sends thank-you + owner alert after a studio review. Swallows errors so the API is not failed. */
export async function runStudioReviewNotifications(params: {
  userId: string;
  studioId: string;
  rating: number;
  reviewText: string;
}): Promise<void> {
  try {
    const [studio, buyer] = await Promise.all([
      prisma.studio.findUnique({
        where: { id: params.studioId },
        select: {
          name: true,
          email: true,
          business: { select: { owner: { select: { email: true } } } },
        },
      }),
      prisma.user.findUnique({
        where: { id: params.userId },
        select: { email: true, name: true },
      }),
    ]);
    if (!studio) return;

    await sendStudioReviewEmails({
      buyerEmail: buyer?.email,
      buyerName: buyer?.name,
      studioEmail: studio.email,
      ownerEmail: studio.business.owner?.email,
      studioName: studio.name,
      rating: params.rating,
      reviewText: params.reviewText,
    });
  } catch (err) {
    console.error('[studio-review-notifications] failed', err);
  }
}
