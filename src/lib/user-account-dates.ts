import { prisma } from '@/lib/prisma';

const SIGNUP_EVENTS = ['signup_completed', 'studio_signup_completed'] as const;

/** Updates last sign-in and, for legacy users without signup/business dates, sets createdAt once. */
export async function recordUserSignIn(userId: string): Promise<void> {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastSignedInAt: true,
      businesses: { select: { id: true }, take: 1 },
    },
  });
  if (!user) return;

  const hasSignup = await prisma.analyticsEvent.findFirst({
    where: { user_id: userId, event_name: { in: [...SIGNUP_EVENTS] } },
    select: { id: true },
  });

  const isLegacyWithoutAccountDate = !hasSignup && user.businesses.length === 0;

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastSignedInAt: now,
      ...(isLegacyWithoutAccountDate && !user.lastSignedInAt ? { createdAt: now } : {}),
    },
  });
}
