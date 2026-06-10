'use client';

import { useState } from 'react';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlatformBillingSummary } from '@/lib/business-platform-billing';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type PlatformBillingBannerProps = {
  billing: PlatformBillingSummary;
};

export function PlatformBillingBanner({ billing }: PlatformBillingBannerProps) {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/platform-billing/portal', { method: 'POST' });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (j.url) {
        window.location.href = j.url;
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  if (billing.status === 'trial' && billing.trialDaysRemaining != null) {
    return (
      <div className="border-b border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground">
        <p>
          Остават <strong>{billing.trialDaysRemaining}</strong>{' '}
          {billing.trialDaysRemaining === 1 ? 'ден' : 'дни'} от безплатния пробен период. След това:{' '}
          <strong>{billing.monthlyAmountEur} €/месец</strong>.
        </p>
      </div>
    );
  }

  if (billing.status === 'past_due') {
    return (
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Плащането не бе успешно.
              {billing.graceDaysRemaining != null && billing.graceDaysRemaining > 0 ? (
                <>
                  {' '}
                  Имате <strong>{billing.graceDaysRemaining}</strong>{' '}
                  {billing.graceDaysRemaining === 1 ? 'ден' : 'дни'} да платите, иначе достъпът ще бъде блокиран.
                </>
              ) : (
                <> Моля, платете веднага.</>
              )}
            </span>
          </p>
          <Button size="sm" variant="default" disabled={loading} onClick={() => void openPortal()}>
            <CreditCard className="mr-2 h-4 w-4" />
            Плати сега
          </Button>
        </div>
      </div>
    );
  }

  if (billing.status === 'active' && billing.nextPaymentDueAt) {
    return (
      <div className="border-b border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
        Следващо плащане: <strong className="text-foreground">{formatDate(billing.nextPaymentDueAt)}</strong> (
        {billing.monthlyAmountEur} €/месец)
      </div>
    );
  }

  return null;
}

type PlatformBlockedOverlayProps = {
  billing: PlatformBillingSummary;
};

export function PlatformBlockedOverlay({ billing }: PlatformBlockedOverlayProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/platform-billing/portal', { method: 'POST' });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      setError(j.error ?? 'Неуспешно отваряне на плащането. Опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  if (!billing.isBlocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">Акаунтът е блокиран</h2>
        <p className="text-muted-foreground mb-6">
          Пробният период приключи. Моля, платете абонамента си ({billing.monthlyAmountEur} €/месец), за да
          възстановите достъпа до таблото.
        </p>
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        <Button size="lg" disabled={loading} onClick={() => void openPortal()}>
          <CreditCard className="mr-2 h-4 w-4" />
          Плати и възстанови достъпа
        </Button>
      </div>
    </div>
  );
}
