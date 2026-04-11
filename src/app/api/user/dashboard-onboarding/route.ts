import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-auth';

/** Marks dashboard onboarding as seen for the current business user. */
export async function POST() {
  const gate = await requireRole('business');
  if (!gate.ok) return gate.response;

  await prisma.user.update({
    where: { id: gate.user.id },
    data: { dashboardOnboardingDismissedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
