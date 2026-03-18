import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockStudios } from '@/data/mock-data';
import { Edit, MapPin, Plus, Star, Trash2 } from 'lucide-react';

export function StudiosSection({
  studios,
  onAdd,
  onEdit,
}: {
  studios: typeof mockStudios;
  onAdd: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Моите студиа</h1>
          <p className="text-muted-foreground text-sm mt-1">{studios.length} студиа</p>
        </div>
        <Button onClick={onAdd} className="gap-2"><Plus className="h-4 w-4" /> Добави студио</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {studios.map((studio) => (
          <div
            key={studio.id}
            className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all"
          >
            <div className="h-32 bg-gradient-to-br from-primary/15 via-secondary/30 to-accent/10 flex items-center justify-center">
              <span className="text-5xl">🧘</span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold text-foreground truncate">{studio.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3.5 w-3.5" />{studio.address}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{studio.description}</p>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" /><span className="font-medium">{studio.rating}</span></span>
                  <span className="text-muted-foreground">{studio.reviewCount} ревюта</span>
                </div>
                <div className="flex gap-1.5">
                  {studio.amenities.parking && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">🅿️</span>}
                  {studio.amenities.shower && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">🚿</span>}
                  {studio.amenities.changingRoom && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">👔</span>}
                  {studio.amenities.equipmentRental && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">🧘</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

