import { prisma } from '@/lib/prisma';
import { sendStudioSubscriptionEmails } from '@/lib/studio-subscription-email';

/** Sends confirmation emails on first subscription activation. Swallows errors so fulfillment is not failed. */
export async function runStudioSubscriptionNotifications(params: {
  userId: string;
  studioId: string;
  studioSubscriptionId?: string | null;
}): Promise<void> {
  try {
    const [studio, buyer] = await Promise.all([
      prisma.studio.findUnique({
        where: { id: params.studioId },
        select: {
          id: true,
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

    const subscriptionPlan = params.studioSubscriptionId
      ? await prisma.studioSubscription.findUnique({
          where: { id: params.studioSubscriptionId },
          select: { name: true, monthlyPrice: true, durationMonths: true },
        })
      : await prisma.studioSubscription.findFirst({
          where: { studioId: params.studioId },
          select: { name: true, monthlyPrice: true, durationMonths: true },
        });

    await sendStudioSubscriptionEmails({
      buyerEmail: buyer?.email,
      buyerName: buyer?.name,
      studioEmail: studio.email,
      ownerEmail: studio.business.owner?.email,
      studioId: studio.id,
      studioName: studio.name,
      planName: subscriptionPlan?.name ?? 'Абонамент',
      monthlyPriceBgn: subscriptionPlan?.monthlyPrice,
      durationMonths: subscriptionPlan?.durationMonths,
    });
  } catch (err) {
    console.error('[studio-subscription-notifications] failed', err);
  }
}
