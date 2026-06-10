'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  BOOKING_PAYMENT_MODE_LABELS,
  BOOKING_PAYMENT_MODES,
  includesOnlinePayment,
  type BookingPaymentMode,
} from '@/lib/booking-payment-mode';
import { isStripeConnectReady, type StripeConnectSummary } from '@/lib/stripe-connect';

export function PaymentModeField({
  value,
  onChange,
  stripeConnect,
  onRequireStripeSetup,
  showOnlineFeeHint,
}: {
  value: BookingPaymentMode;
  onChange: (mode: BookingPaymentMode) => void;
  stripeConnect: StripeConnectSummary | null | undefined;
  onRequireStripeSetup: () => void;
  showOnlineFeeHint?: boolean;
}) {
  const handleChange = (next: string) => {
    const mode = next as BookingPaymentMode;
    onChange(mode);
    if (includesOnlinePayment(mode) && !isStripeConnectReady(stripeConnect)) {
      onRequireStripeSetup();
    }
  };

  return (
    <div>
      <Label>Начин на плащане</Label>
      <RadioGroup value={value} onValueChange={handleChange} className="mt-2 gap-2">
        {BOOKING_PAYMENT_MODES.map(mode => (
          <label
            key={mode}
            htmlFor={`payment-mode-${mode}`}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm hover:bg-muted/40"
          >
            <RadioGroupItem id={`payment-mode-${mode}`} value={mode} />
            <span>{BOOKING_PAYMENT_MODE_LABELS[mode]}</span>
          </label>
        ))}
      </RadioGroup>

    </div>
  );
}
