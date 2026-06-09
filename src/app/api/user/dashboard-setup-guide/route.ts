import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-auth';
import { inferDashboardOnboardingTeachingMode } from '@/lib/infer-dashboard-onboarding-mode';
import { teachingModeFromPrisma, teachingModeToPrisma, type TeachingModeDto } from '@/lib/teaching-mode';

function modeFromDb(value: string | null | undefined): TeachingModeDto | null {
  if (!value) return null;
  return teachingModeFromPrisma(value);
}

export async function GET() {
  const gate = await requireRole('business');
  if (!gate.ok) return gate.response;

  const row = await prisma.user.findUnique({
    where: { id: gate.user.id },
    select: {
      dashboardSetupGuideDocked: true,
      dashboardSetupGuideMinimized: true,
      dashboardOnboardingTeachingMode: true,
    },
  });

  if (!row) {
    return NextResponse.json({
      docked: false,
      minimized: false,
      onboardingTeachingMode: null,
    });
  }

  let onboardingTeachingMode = modeFromDb(row.dashboardOnboardingTeachingMode);

  if (!onboardingTeachingMode) {
    const inferred = await inferDashboardOnboardingTeachingMode(gate.user.id);
    if (inferred) {
      onboardingTeachingMode = teachingModeFromPrisma(inferred);
      await prisma.user.update({
        where: { id: gate.user.id },
        data: {
          dashboardOnboardingTeachingMode: inferred,
          dashboardOnboardingDismissedAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json({
    docked: row.dashboardSetupGuideDocked,
    minimized: row.dashboardSetupGuideMinimized,
    onboardingTeachingMode,
  });
}

export async function PATCH(request: Request) {
  const gate = await requireRole('business');
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const patch: {
    dashboardSetupGuideDocked?: boolean;
    dashboardSetupGuideMinimized?: boolean;
    dashboardOnboardingTeachingMode?: 'PHYSICAL' | 'ONLINE';
    dashboardOnboardingDismissedAt?: Date;
  } = {};

  if ('docked' in b) {
    if (typeof b.docked !== 'boolean') {
      return NextResponse.json({ error: 'docked must be a boolean' }, { status: 400 });
    }
    patch.dashboardSetupGuideDocked = b.docked;
  }
  if ('minimized' in b) {
    if (typeof b.minimized !== 'boolean') {
      return NextResponse.json({ error: 'minimized must be a boolean' }, { status: 400 });
    }
    patch.dashboardSetupGuideMinimized = b.minimized;
  }
  if ('onboardingTeachingMode' in b) {
    if (b.onboardingTeachingMode !== 'physical' && b.onboardingTeachingMode !== 'online') {
      return NextResponse.json({ error: 'onboardingTeachingMode must be physical or online' }, { status: 400 });
    }
    patch.dashboardOnboardingTeachingMode = teachingModeToPrisma(b.onboardingTeachingMode);
    patch.dashboardOnboardingDismissedAt = new Date();
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: gate.user.id },
    data: patch,
    select: {
      dashboardSetupGuideDocked: true,
      dashboardSetupGuideMinimized: true,
      dashboardOnboardingTeachingMode: true,
    },
  });

  return NextResponse.json({
    docked: updated.dashboardSetupGuideDocked,
    minimized: updated.dashboardSetupGuideMinimized,
    onboardingTeachingMode: modeFromDb(updated.dashboardOnboardingTeachingMode),
  });
}
