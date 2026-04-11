'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DIFFICULTY_LEVELS, mockInstructors, mockStudios, WEEKDAYS, YOGA_TYPES, type ScheduleEntry } from '@/data/mock-data';

const INCOMPLETE_MSG =
  'Попълнете всички полета и изберете студио, инструктор, ден, тип йога и ниво преди запазване.';

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
  onSave: () => void;
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
    setPrice(entry?.price != null ? String(entry.price) : '');
    setIsRecurring(entry?.isRecurring ?? true);
  }, [open, entry]);

  const handleSave = () => {
    const cap = Number(maxCapacity);
    const pr = Number(price);
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
      || !Number.isFinite(pr)
      || pr < 0
    ) {
      toast.error(INCOMPLETE_MSG);
      return;
    }
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{entry ? 'Редактирай час' : 'Добави час в разписание'}</DialogTitle>
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
              <Select value={instructorId || undefined} onValueChange={setInstructorId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Изберете" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map(i => (
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
              <Label>Цена (лв.)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="25"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="mt-1"
              />
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
          <Button onClick={handleSave}>{entry ? 'Запази промените' : 'Добави'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
