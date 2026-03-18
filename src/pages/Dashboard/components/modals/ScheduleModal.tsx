import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DIFFICULTY_LEVELS, mockInstructors, mockStudios, WEEKDAYS, YOGA_TYPES, type ScheduleEntry } from '@/data/mock-data';

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
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{entry ? 'Редактирай час' : 'Добави час в разписание'}</DialogTitle>
          <DialogDescription>Задайте седмично повтарящ се час за вашето студио</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div><Label>Име на клас</Label><Input placeholder="напр. Сутрешна Хатха" defaultValue={entry?.className || ''} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Студио</Label>
              <Select defaultValue={entry?.studioId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете" /></SelectTrigger>
                <SelectContent>
                  {studios.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Инструктор</Label>
              <Select defaultValue={entry?.instructorId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете" /></SelectTrigger>
                <SelectContent>
                  {instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Ден от седмицата</Label>
            <Select defaultValue={entry?.day}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете ден" /></SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Начален час</Label><Input type="time" defaultValue={entry?.startTime || ''} className="mt-1" /></div>
            <div><Label>Краен час</Label><Input type="time" defaultValue={entry?.endTime || ''} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Тип йога</Label>
              <Select defaultValue={entry?.yogaType}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете" /></SelectTrigger>
                <SelectContent>
                  {YOGA_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ниво</Label>
              <Select defaultValue={entry?.difficulty}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете" /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Капацитет</Label><Input type="number" placeholder="20" defaultValue={entry?.maxCapacity || ''} className="mt-1" /></div>
            <div><Label>Цена (лв.)</Label><Input type="number" placeholder="25" defaultValue={entry?.price || ''} className="mt-1" /></div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Повтарящ се</p>
              <p className="text-xs text-muted-foreground">Този час ще се повтаря всяка седмица</p>
            </div>
            <Switch defaultChecked={entry?.isRecurring ?? true} />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Отказ</Button>
          <Button onClick={onSave}>{entry ? 'Запази промените' : 'Добави'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

