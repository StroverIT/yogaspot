'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';
import { SubscriptionsSection } from '@/views/Dashboard/components/SubscriptionsSection';
import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import type { StripeConnectSummary } from '@/lib/stripe-connect';

function SubscriptionsPageContent() {
  const ws = useDashboardWorkspaceContext();
  const searchParams = useSearchParams();
  const handledConnectReturn = useRef(false);
  const { myStudios } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);

  useEffect(() => {
    const connectParam = searchParams.get('stripe_connect');
    if (!connectParam || handledConnectReturn.current) return;
    handledConnectReturn.current = true;

    void (async () => {
      let connect: StripeConnectSummary | null = null;
      try {
        const res = await fetch('/api/dashboard/stripe-connect/status?refresh=1', { cache: 'no-store' });
        if (res.ok) {
          const j = (await res.json()) as { stripeConnect?: StripeConnectSummary | null };
          connect = j.stripeConnect ?? null;
        }
      } catch {
        // fall through to workspace reload
      }

      await ws.reload();
      window.history.replaceState({}, '', '/dashboard/subscriptions');

      if (connectParam === 'return') {
        if (connect?.isReady) {
          toast.success('Stripe акаунтът е свързан успешно. Можете да създадете абонамент.');
        } else if (connect?.accountId) {
          toast.info('Акаунтът е свързан, но още не е готов за плащания. Довършете настройката в Stripe.');
        } else {
          toast.info('Свързването приключи. Проверете статуса на акаунта си в Stripe.');
        }
      } else if (connectParam === 'denied') {
        toast.error('Свързването със Stripe беше отказано.');
      } else if (connectParam === 'error') {
        toast.error('Неуспешно свързване със Stripe. Опитайте отново.');
      }
    })();
  }, [searchParams, ws]);

  if (ws.loading) return <div className="text-muted-foreground">Зареждане…</div>;
  if (ws.error) return <div className="text-destructive">{ws.error}</div>;

  return (
    <SubscriptionsSection
      studios={myStudios}
      subscriptions={ws.subscriptions}
      stripeConnect={ws.stripeConnect}
      onWorkspaceReload={() => void ws.reload()}
    />
  );
}

export default function DashboardSubscriptionsPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Зареждане…</div>}>
      <SubscriptionsPageContent />
    </Suspense>
  );
}
