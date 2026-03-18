import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockStudios, mockInstructors } from '@/data/mock-data';
import { Building2, Edit, GraduationCap, Plus, Star, Trash2 } from 'lucide-react';

export function InstructorsSection({
  instructors,
  onAdd,
  onEdit,
}: {
  instructors: typeof mockInstructors;
  onAdd: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Инструктори</h1>
          <p className="text-muted-foreground text-sm mt-1">{instructors.length} инструктора</p>
        </div>
        <Button onClick={onAdd} className="gap-2"><Plus className="h-4 w-4" /> Добави инструктор</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {instructors.map((instr) => {
          const studio = mockStudios.find(s => s.id === instr.studioId);
          return (
            <div
              key={instr.id}
              className="group rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {instr.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{instr.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{instr.experienceLevel}</Badge>
                        <span className="flex items-center gap-0.5 text-sm"><Star className="h-3 w-3 fill-accent text-accent" />{instr.rating}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{instr.bio}</p>
                  {studio && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2"><Building2 className="h-3 w-3" />{studio.name}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {instr.yogaStyle.map(s => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
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

