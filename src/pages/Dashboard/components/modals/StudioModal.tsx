import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export function StudioModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Студио</DialogTitle>
          <DialogDescription>Добавете или редактирайте информацията за вашето студио</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div><Label>Име на студио</Label><Input placeholder="напр. Лотос Йога Студио" className="mt-1" /></div>
          <div><Label>Адрес</Label><Input placeholder="ул. Витоша 45, София" className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Ширина (lat)</Label><Input type="number" step="0.0001" placeholder="42.6977" className="mt-1" /></div>
            <div><Label>Дължина (lng)</Label><Input type="number" step="0.0001" placeholder="23.3219" className="mt-1" /></div>
          </div>
          <div><Label>Описание</Label><Textarea placeholder="Опишете вашето студио..." className="mt-1" rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Телефон</Label><Input placeholder="+359 ..." className="mt-1" /></div>
            <div><Label>Имейл</Label><Input type="email" placeholder="info@studio.bg" className="mt-1" /></div>
          </div>
          <div><Label>Уебсайт</Label><Input placeholder="https://..." className="mt-1" /></div>
          <div>
            <Label className="mb-2 block">Удобства</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'parking', label: '🅿️ Паркинг' },
                { key: 'shower', label: '🚿 Душ' },
                { key: 'changingRoom', label: '👔 Съблекалня' },
                { key: 'equipmentRental', label: '🧘 Наем на оборудване' },
              ].map(a => (
                <div key={a.key} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm">{a.label}</span>
                  <Switch />
                </div>
              ))}
            </div>
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

