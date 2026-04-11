'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
  isRecurring: boolean;
};

export function ScheduleModal({
  open,
  onClose,
  onSave,
  studios,
  instructors,
  entry,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: ScheduleModalPayload) => void | Promise<void>;
  studios: typeof mockStudios;
  instructors: typeof mockInstructors;
  entry: ScheduleEntry | null;
}) {
  const [className, setClassName] = useState('');
  const [studioId, setStudioId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [yogaType, setYogaType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [saving, setSaving] = useState(false);
  const parsedEur = parseEurInput(price);
  const hasValidBasePrice = price.trim() !== '' && Number.isFinite(parsedEur) && parsedEur >= 0;
  const baseBgn = hasValidBasePrice ? eurToBgn(parsedEur) : 0;
  const processingFee = hasValidBasePrice ? calculateOnlinePaymentFee(baseBgn) : 0;
  const finalCustomerAmount = hasValidBasePrice ? calculateFinalCustomerAmount(baseBgn) : 0;

  const instructorsForStudio = useMemo(
    () => (studioId ? instructors.filter(i => i.studioId === studioId) : []),
    [instructors, studioId],
  );

  useEffect(() => {
    if (!open) return;
    setClassName(entry?.className ?? '');
    setStudioId(entry?.studioId ?? '');
    setInstructorId(entry?.instructorId ?? '');
    setDay(entry?.day ?? '');
    setStartTime(entry?.startTime ?? '');
    setEndTime(entry?.endTime ?? '');
    setYogaType(entry?.yogaType ?? '');
    setDifficulty(entry?.difficulty ?? '');
    setMaxCapacity(entry?.maxCapacity != null ? String(entry.maxCapacity) : '');
    setPrice(entry?.price != null ? formatEurInputFromBgn(entry.price) : '');
    setIsRecurring(entry?.isRecurring ?? true);
  }, [open, entry]);

  useEffect(() => {
    if (!studioId || !instructorId) return;
    if (!instructors.some(i => i.id === instructorId && i.studioId === studioId)) {
      setInstructorId('');
    }
  }, [studioId, instructorId, instructors]);

  const handleSave = async () => {
    const cap = Number(maxCapacity);
    const pr = classPriceBgnFromEur(parseEurInput(price));
    if (
      !className.trim()
      || !studioId
      || !instructorId
      || !day
      || !startTime
      || !endTime
      || !yogaType
      || !difficulty
      || !maxCapacity.trim()
      || !Number.isFinite(cap)
      || cap <= 0
      || !price.trim()
      || !Number.isFinite(parseEurInput(price))
      || parseEurInput(price) < 0
    ) {
      toast.error(INCOMPLETE_MSG);
      return;
    }
    setSaving(true);
    try {
      await Promise.resolve(
        onSave({
          id: entry?.id,
          studioId,
          instructorId,
          className: className.trim(),
          yogaType,
          difficulty,
          day,
          startTime,
          endTime,
          maxCapacity: cap,
          price: pr,
          isRecurring,
        }),
      );
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
          <div>
            <Label>Ден от седмицата</Label>
            <Select value={day || undefined} onValueChange={setDay}>
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
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Краен час</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1" />
            </div>
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
                placeholder="20"
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
                placeholder="12,77"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {hasValidBasePrice
                  ? `Крайна цена за клиента: ${formatPriceDualFromBgn(finalCustomerAmount)} (такса ${formatPriceDualFromBgn(processingFee)} = 0,70 лв. + 3%)`
                  : 'Добавяме автоматично онлайн такса 0,70 лв. + 3% при плащане.'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Повтарящ се</p>
              <p className="text-xs text-muted-foreground">Този час ще се повтаря всяка седмица</p>
            </div>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
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
