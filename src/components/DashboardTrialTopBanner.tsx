'use client';

import type { PlatformBillingSummary } from '@/lib/business-platform-billing';

type DashboardTrialTopBannerProps = {
  billing: PlatformBillingSummary | null;
};

export function DashboardTrialTopBanner({ billing }: DashboardTrialTopBannerProps) {
  if (
    !billing ||
    billing.status !== 'trial' ||
    billing.trialDaysRemaining == null ||
    billing.trialDaysRemaining <= 0
  ) {
    return null;
  }

  const daysLabel = billing.trialDaysRemaining === 1 ? 'ден' : 'дни';

  return (
    <div
      className="border-b border-primary/15 bg-primary/5 px-4 py-2 text-center text-sm text-foreground/80"
      role="status"
    >
      Остават <strong>{billing.trialDaysRemaining}</strong> {daysLabel} от безплатния пробен период (след
      това {billing.monthlyAmountEur} €/месец).
    </div>
  );
}
