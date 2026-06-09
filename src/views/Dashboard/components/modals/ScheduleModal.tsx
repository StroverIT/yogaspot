'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ONLINE_STUDIO_ZOOM_REQUIRED_MSG } from '@/lib/studio-online-gate';
import { onlineStudioMissingZoom } from '@/lib/teaching-mode';
import { cn } from '@/lib/utils';
import {
  isFreeClassPrice,
  isUnlimitedClassCapacity,
  resolveClassMaxCapacity,
} from '@/lib/yoga-class-limits';

const INCOMPLETE_MSG =
  'Попълнете всички полета и изберете всички опции преди запазване.';

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
  onCreateInstructor,
  preselectInstructorId,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payloads: ScheduleModalPayload[]) => void | Promise<void>;
  studios: typeof mockStudios;
  instructors: typeof mockInstructors;
  entry: ScheduleEntry | null;
  /** When false (`ONLINE_PAYMENTS` off), no helper text under the price field. */
  onlinePayments?: boolean;
  onCreateInstructor?: (studioId: string) => void;
  preselectInstructorId?: string | null;
}) {
  const [className, setClassName] = useState('');
  const [studioId, setStudioId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [yogaType, setYogaType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [noCapacityLimit, setNoCapacityLimit] = useState(false);
  const [isFreeClass, setIsFreeClass] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ day: '', startTime: '', endTime: '' }]);
  const [saving, setSaving] = useState(false);
  const parsedEur = parseEurInput(price);
  const hasValidBasePrice = price.trim() !== '' && Number.isFinite(parsedEur) && parsedEur >= 0;

  const instructorsForStudio = useMemo(
    () => (studioId ? instructors.filter(i => i.studioId === studioId) : []),
    [instructors, studioId],
  );

  const selectedStudio = useMemo(
    () => studios.find(s => s.id === studioId) ?? null,
    [studios, studioId],
  );

  const isOnlineStudio = selectedStudio?.teachingMode === 'online';

  const onlineStudioBlocked = useMemo(
    () =>
      selectedStudio
        ? onlineStudioMissingZoom({
          teachingMode: selectedStudio.teachingMode,
          zoomMeetingUrl: selectedStudio.zoomMeetingUrl,
        })
        : false,
    [selectedStudio],
  );

  useEffect(() => {
    if (!open) return;
    if (entry) {
      setClassName(entry.className);
      setStudioId(entry.studioId);
      setInstructorId(entry.instructorId);
      setTimeSlots([
        { day: entry.day ?? '', startTime: entry.startTime ?? '', endTime: entry.endTime ?? '' },
      ]);
      setYogaType(entry.yogaType);
      setDifficulty(entry.difficulty);
      const unlimited = isUnlimitedClassCapacity(entry.maxCapacity);
      const free = isFreeClassPrice(entry.price);
      setNoCapacityLimit(unlimited);
      setIsFreeClass(free);
      setMaxCapacity(unlimited ? '' : String(entry.maxCapacity));
      setPrice(free ? '' : formatEurInputFromBgn(entry.price));
      return;
    }
    setClassName('');
    setStudioId('');
    setInstructorId('');
    setYogaType('');
    setDifficulty('');
    setMaxCapacity('');
    setPrice('');
    setNoCapacityLimit(false);
    setIsFreeClass(false);
    setTimeSlots([{ day: '', startTime: '', endTime: '' }]);
  }, [open, entry]);

  useEffect(() => {
    if (!isOnlineStudio) {
      setNoCapacityLimit(false);
    }
  }, [isOnlineStudio]);

  useEffect(() => {
    if (!studioId || !instructorId) return;
    if (!instructors.some(i => i.id === instructorId && i.studioId === studioId)) {
      setInstructorId('');
    }
  }, [studioId, instructorId, instructors]);

  useEffect(() => {
    if (!open || !preselectInstructorId || !studioId) return;
    const match = instructors.find(i => i.id === preselectInstructorId && i.studioId === studioId);
    if (match) setInstructorId(preselectInstructorId);
  }, [open, preselectInstructorId, instructors, studioId]);

  const updateSlot = (index: number, patch: Partial<TimeSlot>) => {
    setTimeSlots(prev => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const addSlot = () => {
    setTimeSlots(prev => [...prev, { day: '', startTime: '', endTime: '' }]);
  };

  const removeSlot = (index: number) => {
    setTimeSlots(prev => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const isEditing = Boolean(entry);
  const basicsComplete = Boolean(className.trim() && studioId && instructorId);
  const slotsComplete = Boolean(
    basicsComplete && timeSlots.every(slot => slot.day && slot.startTime && slot.endTime),
  );

  const capRaw = Number(maxCapacity);
  const capacityIncomplete =
    isOnlineStudio && noCapacityLimit
      ? false
      : !maxCapacity.trim() || !Number.isFinite(capRaw) || capRaw <= 0;

  const priceIncomplete =
    isFreeClass
      ? false
      : !price.trim() || !Number.isFinite(parseEurInput(price)) || parseEurInput(price) < 0;

  const detailsComplete = Boolean(
    slotsComplete && yogaType && difficulty && !capacityIncomplete && !priceIncomplete,
  );

  const canSave = detailsComplete && !onlineStudioBlocked && !saving;

  const showSlotsSection = isEditing || basicsComplete;
  const showDetailsSection = isEditing || slotsComplete;

  const handleSave = async () => {
    if (onlineStudioBlocked) {
      toast.error(ONLINE_STUDIO_ZOOM_REQUIRED_MSG);
      return;
    }
    if (!canSave) {
      toast.error(INCOMPLETE_MSG);
      return;
    }

    const resolvedCapacity = isOnlineStudio && noCapacityLimit
      ? resolveClassMaxCapacity(0, true)
      : capRaw;
    const pr = isFreeClass ? 0 : classPriceBgnFromEur(parseEurInput(price));

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
      maxCapacity: resolvedCapacity,
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
      <DialogContent className="max-w-xl sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {entry ? 'Редактирай час' : 'Добави час в разписание'}
          </DialogTitle>
          <DialogDescription>
            {entry
              ? 'Променете данните и запазете.'
              : 'Попълвайте стъпка по стъпка — следващите полета се появяват, когато предишните са готови.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Основни данни</p>
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
                {studioId && instructorsForStudio.length === 0 && onCreateInstructor ? (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Няма инструктор за това студио.{' '}
                    <button
                      type="button"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      onClick={() => onCreateInstructor(studioId)}
                    >
                      Добавете инструктор
                    </button>
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          {showSlotsSection ? (
            <section
              className={cn(
                'space-y-3 border-t border-border/70 pt-4',
                !isEditing && 'animate-in fade-in-0 slide-in-from-top-1 duration-300',
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Часове</p>
                {!entry ? (
                  <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                    Добави час
                  </Button>
                ) : null}
              </div>
              {timeSlots.map((slot, index) => (
                <div
                  key={`${index}-${slot.day}-${slot.startTime}-${slot.endTime}`}
                  className="space-y-3 rounded-lg border p-3"
                >
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
            </section>
          ) : null}

          {showDetailsSection ? (
            <section
              className={cn(
                'space-y-4 border-t border-border/70 pt-4',
                !isEditing && 'animate-in fade-in-0 slide-in-from-top-1 duration-300',
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Детайли за часа</p>
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
                    disabled={isOnlineStudio && noCapacityLimit}
                    className="mt-1"
                  />
                  {isOnlineStudio ? (
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox
                        checked={noCapacityLimit}
                        onCheckedChange={checked => {
                          const on = checked === true;
                          setNoCapacityLimit(on);
                          if (on) setMaxCapacity('');
                        }}
                      />
                      Няма лимит
                    </label>
                  ) : null}
                </div>
                <div>
                  <Label>Цена (€)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="12,77"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    disabled={isFreeClass}
                    className="mt-1"
                  />
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={isFreeClass}
                      onCheckedChange={checked => {
                        const on = checked === true;
                        setIsFreeClass(on);
                        if (on) setPrice('');
                      }}
                    />
                    Безплатно
                  </label>
                  {onlinePayments && !isFreeClass ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {hasValidBasePrice
                        ? `Крайна цена за клиента: ${formatPriceDualFromBgn(calculateFinalCustomerAmount(eurToBgn(parsedEur)))} (такса ${formatPriceDualFromBgn(calculateOnlinePaymentFee(eurToBgn(parsedEur)))} = 0,70 лв. + 3%)`
                        : 'Добавяме автоматично онлайн такса 0,70 лв. + 3% при плащане.'}
                    </p>
                  ) : null}
                  {isFreeClass ? (
                    <p className="mt-1 text-xs text-muted-foreground">Часът е безплатен за практикуващите.</p>
                  ) : null}
                </div>
              </div>
              {selectedStudio?.teachingMode === 'online' ? (
                <p className="text-sm text-muted-foreground">
                  Онлайн разписание - практикуващите получават Zoom линк след запис.
                </p>
              ) : null}
              {onlineStudioBlocked ? (
                <p className="text-sm text-destructive">{ONLINE_STUDIO_ZOOM_REQUIRED_MSG}</p>
              ) : null}
            </section>
          ) : null}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={() => void handleSave()} disabled={!canSave}>
            {saving ? 'Запазване…' : entry ? 'Запази промените' : 'Добави'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
