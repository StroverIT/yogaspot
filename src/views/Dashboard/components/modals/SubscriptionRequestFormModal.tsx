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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { parseEurInput, subscriptionPriceBgnFromEur } from '@/lib/eur-bgn';

export function SubscriptionRequestFormModal({
  open,
  onClose,
  studioId,
  studioName,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  studioId: string;
  studioName: string;
  onSuccess: () => void | Promise<void>;
}) {
  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [includes, setIncludes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setMonthlyPrice('');
      setIncludes('');
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    const n = name.trim();
    const inc = includes.trim();
    const eur = parseEurInput(monthlyPrice);
    if (!n || !inc || !Number.isFinite(eur) || eur <= 0) {
      toast.error('Попълнете име, валидна цена и какво включва абонаментът.');
      return;
    }
    const monthlyPriceBgn = subscriptionPriceBgnFromEur(eur);
    setSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/subscription-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studioId, name: n, monthlyPrice: monthlyPriceBgn, includes: inc }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(typeof j.error === 'string' ? j.error : `Неуспешно (${res.status})`);
        return;
      }
      toast.success('Заявката е изпратена.');
      onClose();
      await onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Заявка за месечен абонамент</DialogTitle>
          <DialogDescription>
            Студио: <span className="font-medium text-foreground">{studioName}</span>. Попълнете предложените условия —
            след одобрение от администратор абонаментът ще се появи публично.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="sub-req-name">Име на абонамента</Label>
            <Input
              id="sub-req-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="напр. Месечен пълен достъп"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-req-price">Цена (€/мес.)</Label>
            <Input
              id="sub-req-price"
              type="text"
              inputMode="decimal"
              value={monthlyPrice}
              onChange={e => setMonthlyPrice(e.target.value)}
              placeholder="напр. 29"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-req-includes">Какво включва</Label>
            <Textarea
              id="sub-req-includes"
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
            {submitting ? 'Изпращане…' : 'Изпрати заявка'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
