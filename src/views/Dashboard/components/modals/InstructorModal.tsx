import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { mockStudios, YOGA_TYPES } from '@/data/mock-data';

export function InstructorModal({
  open,
  onClose,
  onSave,
  studios,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  studios: typeof mockStudios;
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Инструктор</DialogTitle>
          <DialogDescription>Добавете или редактирайте данните за инструктора</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div><Label>Име</Label><Input placeholder="напр. Мария Иванова" className="mt-1" /></div>
          <div><Label>Биография</Label><Textarea placeholder="Разкажете за опита и квалификациите..." className="mt-1" rows={3} /></div>
          <div>
            <Label>Ниво на опит</Label>
            <Select>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете ниво" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Начинаещ">Начинаещ</SelectItem>
                <SelectItem value="Среден">Среден</SelectItem>
                <SelectItem value="Напреднал">Напреднал</SelectItem>
                <SelectItem value="Експерт">Експерт</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Стил йога</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {YOGA_TYPES.map(type => (
                <Badge key={type} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">{type}</Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Назначено студио</Label>
            <Select>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Изберете студио" /></SelectTrigger>
              <SelectContent>
                {studios.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Отказ</Button>
          <Button onClick={onSave}>Запази</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

