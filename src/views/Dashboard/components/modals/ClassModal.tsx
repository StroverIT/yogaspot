'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ONLINE_STUDIO_ZOOM_REQUIRED_MSG } from '@/lib/studio-online-gate';
import { onlineStudioMissingZoom } from '@/lib/teaching-mode';
import {
  isFreeClassPrice,
  isUnlimitedClassCapacity,
  resolveClassMaxCapacity,
} from '@/lib/yoga-class-limits';
import { cn } from '@/lib/utils';

const INCOMPLETE_MSG =
  'Попълнете всички полета и изберете всички опции преди запазване.';

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
  onlinePayments = true,
  onCreateInstructor,
  preselectInstructorId,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: ClassModalPayload) => void | Promise<void>;
  studios: typeof mockStudios;
  instructors: typeof mockInstructors;
  classToEdit?: YogaClass | null;
  /** When false (`ONLINE_PAYMENTS` off), no helper text under the price field. */
  onlinePayments?: boolean;
  /** Opens instructor create flow with the given studio pre-selected. */
  onCreateInstructor?: (studioId: string) => void;
  /** After inline instructor create, auto-select in the dropdown. */
  preselectInstructorId?: string | null;
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
  const [noCapacityLimit, setNoCapacityLimit] = useState(false);
  const [isFreeClass, setIsFreeClass] = useState(false);
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
    if (classToEdit) {
      setClassName(classToEdit.name);
      setInstructorId(classToEdit.instructorId);
      setStudioId(classToEdit.studioId);
      setDate(classToEdit.date);
      setStartTime(classToEdit.startTime);
      setEndTime(classToEdit.endTime);
      setYogaType(classToEdit.yogaType);
      setDifficulty(classToEdit.difficulty);
      const unlimited = isUnlimitedClassCapacity(classToEdit.maxCapacity);
      const free = isFreeClassPrice(classToEdit.price);
      setNoCapacityLimit(unlimited);
      setIsFreeClass(free);
      setMaxCapacity(unlimited ? '' : String(classToEdit.maxCapacity));
      setPrice(free ? '' : formatEurInputFromBgn(classToEdit.price));
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
    setNoCapacityLimit(false);
    setIsFreeClass(false);
  }, [open, classToEdit]);

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

  const isEditing = Boolean(classToEdit);
  const basicsComplete = Boolean(className.trim() && studioId && instructorId);
  const scheduleComplete = Boolean(basicsComplete && date && startTime && endTime);

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
    scheduleComplete
    && yogaType
    && difficulty
    && !capacityIncomplete
    && !priceIncomplete
    && cancellationPolicy.trim(),
  );

  const canSave = detailsComplete && !onlineStudioBlocked && !saving;

  const showScheduleSection = isEditing || basicsComplete;
  const showDetailsSection = isEditing || scheduleComplete;

  const handleSave = async () => {
    const resolvedCapacity = isOnlineStudio && noCapacityLimit
      ? resolveClassMaxCapacity(0, true)
      : capRaw;
    const pr = isFreeClass ? 0 : classPriceBgnFromEur(parseEurInput(price));

    if (onlineStudioBlocked) {
      toast.error(ONLINE_STUDIO_ZOOM_REQUIRED_MSG);
      return;
    }
    if (!canSave) {
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
          maxCapacity: resolvedCapacity,
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
      <DialogContent className="flex max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-h-[85vh] sm:gap-4 sm:overflow-y-auto sm:p-6">
        <DialogHeader className="shrink-0 space-y-1.5 px-4 pb-2 pt-5 text-left sm:px-0 sm:pt-0 sm:pr-14">
          <DialogTitle className="font-display text-xl">
            {classToEdit ? 'Редактирай клас' : 'Нов клас'}
          </DialogTitle>
          <DialogDescription>
            {classToEdit
              ? 'Променете данните и запазете.'
              : 'Попълвайте стъпка по стъпка — следващите полета се появяват, когато предишните са готови.'}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2 sm:px-0 sm:pb-0">
        <div className="space-y-4">
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          {showScheduleSection ? (
          <section
            className={cn(
              'space-y-4 border-t border-border/70 pt-4',
              !isEditing && 'animate-in fade-in-0 slide-in-from-top-1 duration-300',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Дата и час</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
          </section>
          ) : null}

          {showDetailsSection ? (
          <section
            className={cn(
              'space-y-4 border-t border-border/70 pt-4',
              !isEditing && 'animate-in fade-in-0 slide-in-from-top-1 duration-300',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Детайли за класа</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <p className="mt-1 text-xs text-muted-foreground">Класът е безплатен за практикуващите.</p>
              ) : null}
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
          {selectedStudio?.teachingMode === 'online' ? (
            <p className="text-sm text-muted-foreground">
              Онлайн клас - практикуващите получават Zoom линк след запис.
            </p>
          ) : null}
          {onlineStudioBlocked ? (
            <p className="text-sm text-destructive">{ONLINE_STUDIO_ZOOM_REQUIRED_MSG}</p>
          ) : null}
          </section>
          ) : null}
        </div>
        </div>
        <DialogFooter className="mt-0 shrink-0 gap-3 border-t bg-background px-4 py-4 sm:mt-4 sm:border-t-0 sm:px-0 sm:py-0 [&_button]:w-full sm:[&_button]:w-auto">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={() => void handleSave()} disabled={!canSave}>
            {saving ? 'Запазване…' : 'Запази'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
