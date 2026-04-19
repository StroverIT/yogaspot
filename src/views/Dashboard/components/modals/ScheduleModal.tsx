'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DIFFICULTY_LEVELS, mockInstructors, mockStudios, WEEKDAYS, YOGA_TYPES, type ScheduleEntry } from '@/data/mock-data';
import {
  classPriceBgnFromEur,
  formatEurInputFromBgn,
  formatPriceDualFromBgn,
  parseEurInput,
  eurToBgn,
} from '@/lib/eur-bgn';
import { calculateFinalCustomerAmount, calculateOnlinePaymentFee } from '@/lib/payments';

const INCOMPLETE_MSG =
  'Попълнете всички полета и изберете студио, инструктор, ден, тип йога и ниво преди запазване.';

export type ScheduleModalPayload = {
  id?: string;
  studioId: string;
  instructorId: string;
  className: string;
  yogaType: string;
  difficulty: string;
  day: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  price: number;
};

type TimeSlot = {
  day: string;
  startTime: string;
  endTime: string;
};

export function ScheduleModal({
  open,
  onClose,
  onSave,
  studios,
  instructors,
  entry,
  onlinePayments = true,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payloads: ScheduleModalPayload[]) => void | Promise<void>;
  studios: typeof mockStudios;
  instructors: typeof mockInstructors;
  entry: ScheduleEntry | null;
  /** When false (`ONLINE_PAYMENTS` off), no helper text under the price field. */
  onlinePayments?: boolean;
}) {
  const [className, setClassName] = useState('');
  const [studioId, setStudioId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [yogaType, setYogaType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ day: '', startTime: '', endTime: '' }]);
  const [saving, setSaving] = useState(false);
  const parsedEur = parseEurInput(price);
  const hasValidBasePrice = price.trim() !== '' && Number.isFinite(parsedEur) && parsedEur >= 0;

  const instructorsForStudio = useMemo(
    () => (studioId ? instructors.filter(i => i.studioId === studioId) : []),
    [instructors, studioId],
  );

  useEffect(() => {
    if (!open) return;
    setClassName(entry?.className ?? '');
    setStudioId(entry?.studioId ?? '');
    setInstructorId(entry?.instructorId ?? '');
    setTimeSlots(
      entry
        ? [{ day: entry.day ?? '', startTime: entry.startTime ?? '', endTime: entry.endTime ?? '' }]
        : [{ day: '', startTime: '', endTime: '' }],
    );
    setYogaType(entry?.yogaType ?? '');
    setDifficulty(entry?.difficulty ?? '');
    setMaxCapacity(entry?.maxCapacity != null ? String(entry.maxCapacity) : '');
    setPrice(entry?.price != null ? formatEurInputFromBgn(entry.price) : '');
  }, [open, entry]);

  useEffect(() => {
    if (!studioId || !instructorId) return;
    if (!instructors.some(i => i.id === instructorId && i.studioId === studioId)) {
      setInstructorId('');
    }
  }, [studioId, instructorId, instructors]);

  const updateSlot = (index: number, patch: Partial<TimeSlot>) => {
    setTimeSlots(prev => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const addSlot = () => {
    setTimeSlots(prev => [...prev, { day: '', startTime: '', endTime: '' }]);
  };

  const removeSlot = (index: number) => {
    setTimeSlots(prev => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSave = async () => {
    const cap = Number(maxCapacity);
    const pr = classPriceBgnFromEur(parseEurInput(price));
    const hasInvalidSlot = timeSlots.some(slot => !slot.day || !slot.startTime || !slot.endTime);
    if (
      !className.trim()
      || !studioId
      || !instructorId
      || !yogaType
      || !difficulty
      || !maxCapacity.trim()
      || !Number.isFinite(cap)
      || cap <= 0
      || !price.trim()
      || !Number.isFinite(parseEurInput(price))
      || parseEurInput(price) < 0
      || hasInvalidSlot
    ) {
      toast.error(INCOMPLETE_MSG);
      return;
    }
    const payloads: ScheduleModalPayload[] = timeSlots.map(slot => ({
      id: entry?.id,
      studioId,
      instructorId,
      className: className.trim(),
      yogaType,
      difficulty,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxCapacity: cap,
      price: pr,
    }));
    setSaving(true);
    try {
      await Promise.resolve(onSave(payloads));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {entry ? 'Редактирай час' : 'Добави час в разписание'}
          </DialogTitle>
          <DialogDescription>Задайте седмично повтарящ се час за вашето студио</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Име на клас</Label>
            <Input
              value={className}
              onChange={e => setClassName(e.target.value)}
              placeholder="напр. Сутрешна Хатха"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Студио</Label>
              <Select value={studioId || undefined} onValueChange={setStudioId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Изберете" />
                </SelectTrigger>
                <SelectContent>
                  {studios.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Инструктор</Label>
              <Select
                value={instructorId || undefined}
                onValueChange={setInstructorId}
                disabled={!studioId || instructorsForStudio.length === 0}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={studioId ? 'Изберете' : 'Първо изберете студио'} />
                </SelectTrigger>
                <SelectContent>
                  {instructorsForStudio.map(i => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Часове</Label>
              {!entry ? (
                <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                  Добави час
                </Button>
              ) : null}
            </div>
            {timeSlots.map((slot, index) => (
              <div key={`${index}-${slot.day}-${slot.startTime}-${slot.endTime}`} className="rounded-lg border p-3 space-y-3">
                <div>
                  <Label>Ден от седмицата</Label>
                  <Select value={slot.day || undefined} onValueChange={value => updateSlot(index, { day: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Изберете ден" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map(d => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Начален час</Label>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={e => updateSlot(index, { startTime: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Краен час</Label>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={e => updateSlot(index, { endTime: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                {!entry ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSlot(index)}
                      disabled={timeSlots.length === 1}
                    >
                      Премахни
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Тип йога</Label>
              <Select value={yogaType || undefined} onValueChange={setYogaType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Изберете" />
                </SelectTrigger>
                <SelectContent>
                  {YOGA_TYPES.map(t => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ниво</Label>
              <Select value={difficulty || undefined} onValueChange={setDifficulty}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Изберете" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(d => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Капацитет</Label>
              <Input
                type="number"
                min={1}
                value={maxCapacity}
                onChange={e => setMaxCapacity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Цена (€)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="mt-1"
              />
              {onlinePayments ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {hasValidBasePrice
                    ? `Крайна цена за клиента: ${formatPriceDualFromBgn(calculateFinalCustomerAmount(eurToBgn(parsedEur)))} (такса ${formatPriceDualFromBgn(calculateOnlinePaymentFee(eurToBgn(parsedEur)))} = 0,70 лв. + 3%)`
                    : 'Добавяме автоматично онлайн такса 0,70 лв. + 3% при плащане.'}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Запазване…' : entry ? 'Запази промените' : 'Добави'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
