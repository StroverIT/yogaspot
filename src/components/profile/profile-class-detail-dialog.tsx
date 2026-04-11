import { Clock, Flame, MapPin, Star, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Instructor, Studio, YogaClass } from '@/data/mock-data';
import { ProfileInfoItem } from '@/components/profile/profile-info-item';
import { formatDate, getDifficultyColor } from '@/components/profile/profile-utils';

interface ProfileClassDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: YogaClass | null;
  selectedInstructor: Instructor | undefined;
  selectedStudio: Studio | undefined;
  attendedDate: string | null | undefined;
}

export const ProfileClassDetailDialog = ({
  open,
  onOpenChange,
  selected,
  selectedInstructor,
  selectedStudio,
  attendedDate,
}: ProfileClassDetailDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg p-0 overflow-hidden">
      {selected && (
        <>
          <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{selected.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {attendedDate && `Посетен на ${formatDate(attendedDate)}`}
              </p>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <ProfileInfoItem icon={<Clock className="h-4 w-4" />} label="Час" value={`${selected.startTime} – ${selected.endTime}`} />
              <ProfileInfoItem icon={<MapPin className="h-4 w-4" />} label="Студио" value={selectedStudio?.name || ''} />
              <ProfileInfoItem icon={<User className="h-4 w-4" />} label="Инструктор" value={selectedInstructor?.name || ''} />
              <ProfileInfoItem icon={<Flame className="h-4 w-4" />} label="Тип" value={selected.yogaType} />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getDifficultyColor(selected.difficulty)}`}>
                {selected.difficulty}
              </span>
              <Badge variant="secondary">{selected.price} лв.</Badge>
              <Badge variant="outline">
                {selected.enrolled}/{selected.maxCapacity} записани
              </Badge>
            </div>
            <Separator />
            <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Адрес:</span> {selectedStudio?.address}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Отказване:</span> {selected.cancellationPolicy}
              </p>
            </div>
            {selectedInstructor && (
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {selectedInstructor.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedInstructor.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {selectedInstructor.rating}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selectedInstructor.bio}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedInstructor.yogaStyle.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
);
