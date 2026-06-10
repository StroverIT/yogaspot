'use client';

import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { isStripeConnectReady, type StripeConnectSummary } from '@/lib/stripe-connect';
import { dashboardCardClass } from '@/views/Dashboard/dashboardUi';

export function StripeOnlinePaymentsBanner({
  stripeConnect,
}: {
  stripeConnect: StripeConnectSummary | null | undefined;
}) {
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7719/ingest/4ef9124f-801d-4bd7-a1fe-597ca17d2e31',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c7b600'},body:JSON.stringify({sessionId:'c7b600',location:'StripeOnlinePaymentsBanner.tsx:useEffect',message:'banner received stripeConnect props',data:{accountId:stripeConnect?.accountId??null,chargesEnabled:stripeConnect?.chargesEnabled??null,detailsSubmitted:stripeConnect?.detailsSubmitted??null,isReady:stripeConnect?.isReady??null,bannerHidden:isStripeConnectReady(stripeConnect)},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
  }, [stripeConnect]);

  if (isStripeConnectReady(stripeConnect)) {
    return null;
  }

  const startStripeConnect = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch('/api/dashboard/stripe-connect/onboard', { method: 'POST' });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      toast.error(typeof j.error === 'string' ? j.error : 'Неуспешно стартиране на Stripe свързване.');
    } finally {
      setConnectLoading(false);
    }
  };

  return (
    <div className={`${dashboardCardClass} p-6`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-secondary/15 p-2.5 ring-1 ring-secondary/25">
            <CreditCard className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Онлайн плащания</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              За да приемате онлайн плащания при записване, настройте Stripe акаунта си.
            </p>
            {stripeConnect?.accountId && !stripeConnect.isReady ? (
              <p className="mt-2 text-xs text-amber-600">
                Акаунтът е свързан, но още не е готов за плащания. Довършете настройката в Stripe.
              </p>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 gap-2 rounded-xl"
          disabled={connectLoading}
          onClick={() => void startStripeConnect()}
        >
          <CreditCard className="h-4 w-4" />
          {connectLoading ? 'Зареждане…' : stripeConnect?.accountId ? 'Свържи отново' : 'Свържи със Stripe'}
        </Button>
      </div>
    </div>
  );
}
