import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Retreat, Studio } from '@/data/mock-data';
import { CalendarDays, Clock3, Edit, Mail, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
import { DashboardPageHeader } from './DashboardPageHeader';
import { dashboardCardClass } from '../dashboardUi';

export function RetreatsSection({
  retreats,
  studios,
  onAdd,
  onEdit,
  onDelete,
}: {
  retreats: Retreat[];
  studios: Studio[];
  onAdd: () => void;
  onEdit: (retreat: Retreat) => void;
  onDelete: (retreat: Retreat) => void;
}) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Рийтрийти"
        description={`${retreats.length} рийтрийта в календара.`}
        actions={
          <Button type="button" onClick={onAdd} className="gap-2 shadow-sm shadow-primary/20">
            <Plus className="h-4 w-4" /> Добави рийтрийт
          </Button>
        }
      />

      <div className="space-y-4">
        {retreats.map((retreat) => {
          const studio = studios.find((s) => s.id === retreat.studioId);
          const studioName = studio?.name ?? 'Студио';
          return (
            <div key={retreat.id} className={`${dashboardCardClass} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{retreat.title}</h3>
                    <Badge variant={retreat.isPublished ? 'default' : 'secondary'}>
                      {retreat.isPublished ? 'Публикуван' : 'Чернова'}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{retreat.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(retreat.startDate).toLocaleDateString('bg-BG')} - {new Date(retreat.endDate).toLocaleDateString('bg-BG')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {retreat.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {retreat.address}
                    </span>
                    <span>Места: {retreat.enrolled}/{retreat.maxCapacity}</span>
                    <span>{retreat.price === 0 ? 'Безплатно' : `${retreat.price.toFixed(2)} лв.`}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{studioName}</Badge>
                    {retreat.activities.slice(0, 4).map((activity) => (
                      <Badge key={activity} variant="secondary">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {studio?.phone ?? 'Няма телефон'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {studio?.email ?? 'Няма имейл'}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(retreat)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(retreat)} aria-label={`Изтрий ${retreat.title}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
