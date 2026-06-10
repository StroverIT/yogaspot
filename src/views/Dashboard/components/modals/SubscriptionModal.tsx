'use client';

import { useEffect, useState } from 'react';
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
import { preventDialogOutsideClose } from '@/views/Dashboard/components/preventDialogOutsideClose';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { StudioSubscription } from '@/data/mock-data';
import {
  formatEurInputFromBgn,
  parseEurInput,
  subscriptionPriceBgnFromEur,
} from '@/lib/eur-bgn';

const DURATION_OPTIONS = [
  { value: '1', label: '1 месец' },
  { value: '3', label: '3 месеца' },
  { value: '6', label: '6 месеца' },
  { value: '12', label: '12 месеца' },
] as const;

export type SubscriptionModalPayload = {
  name: string;
  monthlyPrice: number;
  includes: string;
  durationMonths: number;
};

export function SubscriptionModal({
  open,
  onClose,
  onSave,
  studioName,
  subscription,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: SubscriptionModalPayload) => void | Promise<void>;
  studioName: string;
  subscription: StudioSubscription | null;
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [includes, setIncludes] = useState('');
  const [durationMonths, setDurationMonths] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      return;
    }
    if (subscription?.hasMonthlySubscription) {
      setName(subscription.name ?? '');
      setPrice(subscription.monthlyPrice != null ? formatEurInputFromBgn(subscription.monthlyPrice) : '');
      setIncludes(subscription.includes ?? subscription.subscriptionNote ?? '');
      setDurationMonths(String(subscription.durationMonths ?? 1));
    } else {
      setName('');
      setPrice('');
      setIncludes('');
      setDurationMonths('1');
    }
  }, [open, subscription]);

  const handleSubmit = async () => {
    const n = name.trim();
    const inc = includes.trim();
    const eur = parseEurInput(price);
    const duration = Number(durationMonths);
    if (!n || !inc || !Number.isFinite(eur) || eur <= 0 || !Number.isFinite(duration)) {
      toast.error('Попълнете име, валидна цена и какво включва абонаментът.');
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        name: n,
        monthlyPrice: subscriptionPriceBgnFromEur(eur),
        includes: inc,
        durationMonths: duration,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(subscription?.hasMonthlySubscription);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent {...preventDialogOutsideClose} className="max-w-lg sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? 'Редактиране на абонамент' : 'Нов абонамент'}
          </DialogTitle>
          <DialogDescription>
            Студио: <span className="font-medium text-foreground">{studioName}</span>. Абонаментът ще се показва
            публично на страницата на студиото.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="sub-name">Име на абонамента</Label>
            <Input
              id="sub-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="напр. Месечен пълен достъп"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-price">Цена (€)</Label>
            <Input
              id="sub-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="напр. 29"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-duration">Продължителност</Label>
            <Select value={durationMonths} onValueChange={setDurationMonths}>
              <SelectTrigger id="sub-duration" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-includes">Какво включва</Label>
            <Textarea
              id="sub-includes"
              value={includes}
              onChange={e => setIncludes(e.target.value)}
              placeholder="Посещения, класове, ограничения…"
              rows={5}
              className="rounded-xl resize-y min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Отказ
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? 'Запазване…' : isEdit ? 'Запази' : 'Създай'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
