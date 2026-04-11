'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DIFFICULTY_LEVELS, mockInstructors, mockStudios, YOGA_TYPES } from '@/data/mock-data';

const INCOMPLETE_MSG =
  'Попълнете всички полета и изберете всички опции (инструктор, студио, тип йога, ниво) преди запазване.';

export function ClassModal({
  open,
  onClose,
  onSave,
  studios,
  instructors,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  studios: typeof mockStudios;
  instructors: typeof mockInstructors;
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

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const handleSave = () => {
    const cap = Number(maxCapacity);
    const pr = Number(price);
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
      || !Number.isFinite(pr)
      || pr < 0
      || !cancellationPolicy.trim()
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
          <DialogTitle className="font-display text-xl">Клас</DialogTitle>
          <DialogDescription>Добавете или редактирайте информация за клас</DialogDescription>
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
          <Button onClick={handleSave}>Запази</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
