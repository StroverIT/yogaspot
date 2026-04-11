'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DIFFICULTY_LEVELS, mockInstructors, mockStudios, YOGA_TYPES, type YogaClass } from '@/data/mock-data';
import {
  classPriceBgnFromEur,
  formatEurInputFromBgn,
  formatPriceDualFromBgn,
  parseEurInput,
  eurToBgn,
} from '@/lib/eur-bgn';
import { calculateFinalCustomerAmount, calculateOnlinePaymentFee } from '@/lib/payments';

const INCOMPLETE_MSG =
  'Попълнете всички полета и изберете всички опции (инструктор, студио, тип йога, ниво) преди запазване.';

export type ClassModalPayload = {
  id?: string;
  studioId: string;
  instructorId: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  price: number;
  yogaType: string;
  difficulty: string;
  cancellationPolicy: string;
  waitingList?: string[];
};

export function ClassModal({
  open,
  onClose,
  onSave,
  studios,
  instructors,
  classToEdit,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: ClassModalPayload) => void | Promise<void>;
  studios: typeof mockStudios;
  instructors: typeof mockInstructors;
  classToEdit?: YogaClass | null;
}) {
  const [className, setClassName] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [studioId, setStudioId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [yogaType, setYogaType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
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
    if (classToEdit) {
      setClassName(classToEdit.name);
      setInstructorId(classToEdit.instructorId);
      setStudioId(classToEdit.studioId);
      setDate(classToEdit.date);
      setStartTime(classToEdit.startTime);
      setEndTime(classToEdit.endTime);
      setYogaType(classToEdit.yogaType);
      setDifficulty(classToEdit.difficulty);
      setMaxCapacity(String(classToEdit.maxCapacity));
      setPrice(formatEurInputFromBgn(classToEdit.price));
      setCancellationPolicy(classToEdit.cancellationPolicy);
      return;
    }
    setClassName('');
    setInstructorId('');
    setStudioId('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setYogaType('');
    setDifficulty('');
    setMaxCapacity('');
    setPrice('');
    setCancellationPolicy('');
  }, [open, classToEdit]);

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
      || !instructorId
      || !studioId
      || !date
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
      || !cancellationPolicy.trim()
    ) {
      toast.error(INCOMPLETE_MSG);
      return;
    }
    setSaving(true);
    try {
      await Promise.resolve(
        onSave({
          id: classToEdit?.id,
          studioId,
          instructorId,
          name: className.trim(),
          date,
          startTime,
          endTime,
          maxCapacity: cap,
          price: pr,
          yogaType,
          difficulty,
          cancellationPolicy: cancellationPolicy.trim(),
          waitingList: classToEdit?.waitingList,
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
            {classToEdit ? 'Редактирай клас' : 'Нов клас'}
          </DialogTitle>
          <DialogDescription>
            {classToEdit ? 'Променете данните и запазете.' : 'Добавете информация за новия клас.'}
          </DialogDescription>
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Дата</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" />
            </div>
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
                  <SelectValue placeholder="Изберете тип" />
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
              <Label>Ниво на трудност</Label>
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
              <Label>Максимален капацитет</Label>
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
          <div>
            <Label>Политика за отказване</Label>
            <Input
              value={cancellationPolicy}
              onChange={e => setCancellationPolicy(e.target.value)}
              placeholder="напр. До 2 часа преди клас"
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Запазване…' : 'Запази'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
