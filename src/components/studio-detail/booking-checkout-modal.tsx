'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ScheduleEntry, YogaClass } from '@/data/mock-data';
import { formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { calculateFinalCustomerAmount } from '@/lib/payments';
import { toast } from 'sonner';

export type CheckoutModalTarget =
  | { kind: 'class'; studioId: string; yogaClass: YogaClass }
  | { kind: 'schedule'; studioId: string; entry: ScheduleEntry };

type Props = {
  open: boolean;
  target: CheckoutModalTarget | null;
  onlinePayments: boolean;
  onClose: () => void;
  onBooked?: () => void;
};

export function BookingCheckoutModal({ open, target, onlinePayments, onClose, onBooked }: Props) {
  const [paying, setPaying] = useState(false);

  const title =
    target?.kind === 'class'
      ? target.yogaClass.name
      : target?.kind === 'schedule'
        ? `${target.entry.className} · ${target.entry.day}`
        : '';

  const subtitle =
    target?.kind === 'class'
      ? `${target.yogaClass.date} · ${target.yogaClass.startTime}–${target.yogaClass.endTime}`
      : target?.kind === 'schedule'
        ? `${target.entry.startTime}–${target.entry.endTime} · ${target.entry.day}`
        : '';

  const basePrice = target?.kind === 'class' ? target.yogaClass.price : target?.kind === 'schedule' ? target.entry.price : 0;
  const finalPrice = calculateFinalCustomerAmount(basePrice);

  const handlePay = async () => {
    if (!target) return;
    setPaying(true);
    try {
      const url =
        target.kind === 'class'
          ? '/api/checkout/class'
          : '/api/checkout/schedule-entry';
      const body =
        target.kind === 'class'
          ? JSON.stringify({ classId: target.yogaClass.id })
          : JSON.stringify({ scheduleEntryId: target.entry.id, studioId: target.studioId });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
      if (!res.ok) {
        toast.error(typeof data.error === 'string' ? data.error : `Грешка (${res.status})`);
        return;
      }
      if (typeof data.url === 'string') {
        window.location.href = data.url;
        return;
      }
      toast.error('Липсва линк за плащане.');
    } catch {
      toast.error('Мрежова грешка.');
    } finally {
      setPaying(false);
    }
  };

  const handleOfflineConfirm = async () => {
    if (!target) return;
    setPaying(true);
    try {
      const url =
        target.kind === 'class' ? '/api/bookings/class' : '/api/bookings/schedule-entry';
      const body =
        target.kind === 'class'
          ? JSON.stringify({ classId: target.yogaClass.id })
          : JSON.stringify({ scheduleEntryId: target.entry.id, studioId: target.studioId });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(typeof data.error === 'string' ? data.error : `Грешка (${res.status})`);
        return;
      }
      toast.success('Записването е потвърдено.');
      onBooked?.();
      onClose();
    } catch {
      toast.error('Мрежова грешка.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {onlinePayments ? 'Потвърждение и плащане' : 'Записване'}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-left text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{title}</p>
              <p>{subtitle}</p>
              {onlinePayments ? (
                <>
                  <p>
                    Крайна сума (с онлайн такса):{' '}
                    <span className="font-semibold text-foreground">{formatPriceDualFromBgn(finalPrice)}</span>
                  </p>
                  <p>Ще бъдете пренасочени към Stripe за сигурно плащане.</p>
                </>
              ) : (
                <p className="text-foreground/90">Желаете ли да се запишете за часа / събитието?</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={paying}>
            Отказ
          </Button>
          {onlinePayments ? (
            <Button type="button" onClick={() => void handlePay()} disabled={paying || !target}>
              {paying ? 'Зареждане…' : 'Плащане в Stripe'}
            </Button>
          ) : (
            <Button type="button" onClick={() => void handleOfflineConfirm()} disabled={paying || !target}>
              {paying ? 'Записване…' : 'Потвърди'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
