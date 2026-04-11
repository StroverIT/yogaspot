import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Instructor, Studio } from '@/data/mock-data';
import { Building2, Edit, Plus, Star, Trash2 } from 'lucide-react';

import { dashboardCardClass } from '../dashboardUi';
import { DashboardPageHeader } from './DashboardPageHeader';

export function InstructorsSection({
  instructors,
  studios,
  onAdd,
  onEdit,
}: {
  instructors: Instructor[];
  studios: Studio[];
  onAdd: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Инструктори"
        description={`${instructors.length} инструктора — рейтинг, стилове и студио.`}
        actions={
          <Button onClick={onAdd} className="gap-2 shadow-sm shadow-primary/20">
            <Plus className="h-4 w-4" /> Добави инструктор
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {instructors.map((instr) => {
          const studio = studios.find(s => s.id === instr.studioId);
          return (
            <div key={instr.id} className={`group ${dashboardCardClass} p-5`}>
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border-2 border-secondary/30 ring-2 ring-primary/10">
                  <AvatarFallback className="bg-linear-to-br from-primary/15 to-secondary/20 text-lg font-semibold text-primary">
                    {instr.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{instr.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{instr.experienceLevel}</Badge>
                        <span className="flex items-center gap-0.5 text-sm text-foreground">
                          <Star className="h-3 w-3 fill-yoga-tertiary text-primary" />
                          {instr.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{instr.bio}</p>
                  {studio && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 text-secondary" />
                      {studio.name}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {instr.yogaStyle.map(s => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="border-primary/20 bg-primary/4 text-xs text-foreground/90"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

