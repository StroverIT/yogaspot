'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { isStripeConnectReady, type StripeConnectSummary } from '@/lib/stripe-connect';

export function StripeConnectSetupModal({
  open,
  onClose,
  stripeConnect,
  onConnectStarted,
}: {
  open: boolean;
  onClose: () => void;
  stripeConnect: StripeConnectSummary | null | undefined;
  onConnectStarted?: () => void;
}) {
  const [connectLoading, setConnectLoading] = useState(false);

  const startStripeConnect = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch('/api/dashboard/stripe-connect/onboard', { method: 'POST' });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (j.url) {
        onConnectStarted?.();
        window.location.href = j.url;
        return;
      }
      toast.error(typeof j.error === 'string' ? j.error : 'Неуспешно стартиране на Stripe свързване.');
    } finally {
      setConnectLoading(false);
    }
  };

  if (isStripeConnectReady(stripeConnect)) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Свържете Stripe акаунт</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-left text-sm text-muted-foreground">
              <p>
                Работим със Stripe. За да приемате онлайн плащания, нужно е да свържете акаунта със Stripe.
              </p>
              {stripeConnect?.accountId && !stripeConnect.isReady ? (
                <p className="text-xs text-amber-600">
                  Акаунтът е свързан, но още не е готов за плащания. Довършете настройката в Stripe.
                </p>
              ) : null}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={connectLoading}>
            Отказ
          </Button>
          <Button
            type="button"
            className="gap-2"
            disabled={connectLoading}
            onClick={() => void startStripeConnect()}
          >
            <CreditCard className="h-4 w-4" />
            {connectLoading ? 'Зареждане…' : stripeConnect?.accountId ? 'Свържи отново' : 'Свържи със Stripe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
