import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DIFFICULTY_LEVELS, mockInstructors, mockStudios, YOGA_TYPES } from '@/data/mock-data';

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
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Клас</DialogTitle>
          <DialogDescription>Добавете или редактирайте информация за клас</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div><Label>Име на клас</Label><Input placeholder="напр. Сутрешна Хатха" className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Инструктор</Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете" /></SelectTrigger>
                <SelectContent>
                  {instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Студио</Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете" /></SelectTrigger>
                <SelectContent>
                  {studios.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Дата</Label><Input type="date" className="mt-1" /></div>
            <div><Label>Начален час</Label><Input type="time" className="mt-1" /></div>
            <div><Label>Краен час</Label><Input type="time" className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Тип йога</Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете тип" /></SelectTrigger>
                <SelectContent>
                  {YOGA_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ниво на трудност</Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете" /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Максимален капацитет</Label><Input type="number" placeholder="20" className="mt-1" /></div>
            <div><Label>Цена (лв.)</Label><Input type="number" placeholder="25" className="mt-1" /></div>
          </div>
          <div><Label>Политика за отказване</Label><Input placeholder="напр. До 2 часа преди клас" className="mt-1" /></div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Отказ</Button>
          <Button onClick={onSave}>Запази</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

