'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useAuth } from '@/contexts/AuthContext';
import type { BookingPaymentMode } from '@/lib/booking-payment-mode';
import {
  effectivePaymentMode,
  includesOnsitePayment,
  includesOnlinePayment,
} from '@/lib/booking-payment-mode';
import { formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { calculateFinalCustomerAmount } from '@/lib/payments';
import { formatClassPriceDisplay, isFreeClassPrice } from '@/lib/yoga-class-limits';

export function RetreatSignupButton({
  retreatId,
  retreatTitle,
  price,
  paymentMode,
  enrolled,
  maxCapacity,
  isEnrolled = false,
  className = 'w-full',
}: {
  retreatId: string;
  retreatTitle: string;
  price: number;
  paymentMode?: BookingPaymentMode;
  enrolled: number;
  maxCapacity: number;
  isEnrolled?: boolean;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isFull = enrolled >= maxCapacity;

  const mode = effectivePaymentMode(price, paymentMode);
  const isFree = isFreeClassPrice(price);
  const showOnline = !isFree && includesOnlinePayment(mode);
  const showOnsite = isFree || includesOnsitePayment(mode);
  const finalPrice = showOnline ? calculateFinalCustomerAmount(price) : price;

  const handleOfflineSignup = async () => {
    setPending(true);
    try {
      const res = await fetch('/api/bookings/retreat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retreatId }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(typeof j.error === 'string' ? j.error : `Неуспешно записване (${res.status})`);
        return;
      }
      toast.success('Успешно записване за рийтрийта.');
      setDialogOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const handleOnlinePay = async () => {
    setPending(true);
    try {
      const res = await fetch('/api/checkout/retreat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retreatId }),
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
    } finally {
      setPending(false);
    }
  };

  const handleSignupClick = () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    if (showOnline && showOnsite) {
      setDialogOpen(true);
      return;
    }
    if (showOnline) {
      void handleOnlinePay();
      return;
    }
    void handleOfflineSignup();
  };

  const dialogTitle = isFree
    ? 'Записване'
    : showOnline && !showOnsite
      ? 'Потвърждение и плащане'
      : 'Записване и плащане';

  return (
    <>
      <Button
        type="button"
        className={className}
        disabled={isEnrolled || isFull || pending}
        onClick={() => void handleSignupClick()}
      >
        {isEnrolled ? 'Вече сте записани' : isFull ? 'Няма свободни места' : pending ? 'Записване...' : 'Запиши се'}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{dialogTitle}</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-left text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{retreatTitle}</p>
                <p>
                  Цена:{' '}
                  <span className="font-semibold text-foreground">
                    {isFree ? formatClassPriceDisplay(0) : formatPriceDualFromBgn(showOnline ? finalPrice : price)}
                  </span>
                </p>
                {showOnline && showOnsite ? (
                  <p className="text-xs">Можете да платите онлайн или на място.</p>
                ) : null}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={pending}>
              Отказ
            </Button>
            {showOnsite ? (
              <Button type="button" variant={showOnline ? 'outline' : 'default'} disabled={pending} onClick={() => void handleOfflineSignup()}>
                {pending ? 'Записване…' : showOnline ? 'На място' : 'Потвърди'}
              </Button>
            ) : null}
            {showOnline ? (
              <Button type="button" disabled={pending} onClick={() => void handleOnlinePay()}>
                {pending ? 'Зареждане…' : 'Плащане онлайн'}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
