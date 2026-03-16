import { useState } from 'react';
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { User, Star, MapPin, Clock, Calendar, Activity, Flame, Heart, ChevronRight } from 'lucide-react';
import { mockStudios, mockClasses, mockInstructors } from '@/data/mock-data';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';

interface AttendedClass {
  classId: string;
  attendedDate: string;
}

const mockAttendedClasses: AttendedClass[] = [
  { classId: 'c1', attendedDate: '2026-02-14' },
  { classId: 'c3', attendedDate: '2026-02-12' },
  { classId: 'c4', attendedDate: '2026-02-10' },
  { classId: 'c5', attendedDate: '2026-02-08' },
  { classId: 'c2', attendedDate: '2026-02-05' },
];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'начинаещ': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'среден': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    case 'напреднал': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    default: return '';
  }
};

const Profile = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const [showEmptyHistory, setShowEmptyHistory] = useState(false);
  const [showEmptyFavorites, setShowEmptyFavorites] = useState(false);

  const displayName = user?.name || 'Гост потребител';
  const displayEmail = user?.email || 'guest@yogaspot.bg';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2);

  const selected = selectedClass ? mockClasses.find(c => c.id === selectedClass) : null;
  const selectedInstructor = selected ? mockInstructors.find(i => i.id === selected.instructorId) : null;
  const selectedStudio = selected ? mockStudios.find(s => s.id === selected.studioId) : null;
  const attendedDate = selectedClass ? mockAttendedClasses.find(a => a.classId === selectedClass)?.attendedDate : null;

  const favoriteStudios = showEmptyFavorites ? [] : mockStudios.filter(s => favoriteIds.includes(s.id));
  const attendedClasses = showEmptyHistory ? [] : mockAttendedClasses;

  // Stats
  const totalClasses = attendedClasses.length;
  const uniqueStudios = new Set(attendedClasses.map(a => {
    const cls = mockClasses.find(c => c.id === a.classId);
    return cls?.studioId;
  }).filter(Boolean)).size;
  const yogaTypeCounts: Record<string, number> = {};
  attendedClasses.forEach(a => {
    const cls = mockClasses.find(c => c.id === a.classId);
    if (cls) yogaTypeCounts[cls.yogaType] = (yogaTypeCounts[cls.yogaType] || 0) + 1;
  });
  const favoriteType = Object.entries(yogaTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero profile header */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/40 to-accent/10 p-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-display text-3xl font-bold text-foreground">{displayName}</h1>
            <p className="text-muted-foreground mt-1">{displayEmail}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              <StatPill icon={<Activity className="h-4 w-4" />} label="Класове" value={totalClasses} />
              <StatPill icon={<MapPin className="h-4 w-4" />} label="Студиа" value={uniqueStudios} />
              <StatPill icon={<Heart className="h-4 w-4" />} label="Любими" value={favoriteIds.length} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="history" className="flex-1 sm:flex-none gap-2">
            <Calendar className="h-4 w-4" />
            Посетени класове
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1 sm:flex-none gap-2">
            <Heart className="h-4 w-4" />
            Любими ({favoriteIds.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 sm:flex-none gap-2">
            <User className="h-4 w-4" />
            Настройки
          </TabsTrigger>
        </TabsList>

        {/* History tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              {totalClasses} посетени класа
            </p>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setShowEmptyHistory(!showEmptyHistory)}>
              {showEmptyHistory ? 'Покажи данни' : 'Покажи празно'}
            </Button>
          </div>

          {attendedClasses.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Няма посетени класове</h3>
              <p className="text-muted-foreground mb-6">Запишете се за клас и той ще се появи тук след посещение.</p>
              <Button asChild variant="outline">
                <Link to="/discover">Открий студио</Link>
              </Button>
            </div>
          ) : (
            attendedClasses.map((attended) => {
              const cls = mockClasses.find(c => c.id === attended.classId);
              if (!cls) return null;
              const instructor = mockInstructors.find(i => i.id === cls.instructorId);
              const studio = mockStudios.find(s => s.id === cls.studioId);

              return (
                <Card
                  key={attended.classId}
                  className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
                  onClick={() => setSelectedClass(cls.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex flex-col items-center justify-center min-w-[56px] rounded-xl bg-primary/10 p-3">
                        <span className="text-xs font-medium text-primary uppercase">
                          {new Date(attended.attendedDate).toLocaleDateString('bg-BG', { month: 'short' })}
                        </span>
                        <span className="text-xl font-bold text-primary leading-tight">
                          {new Date(attended.attendedDate).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-display text-lg font-semibold text-foreground truncate">{cls.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{studio?.name}</span>
                              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{instructor?.name}</span>
                              <span className="flex items-center gap-1 sm:hidden"><Calendar className="h-3.5 w-3.5" />{formatDate(attended.attendedDate)}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 mt-1" />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs font-medium">{cls.yogaType}</Badge>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(cls.difficulty)}`}>{cls.difficulty}</span>
                          <Badge variant="outline" className="text-xs">{cls.startTime} – {cls.endTime}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Favorites tab */}
        <TabsContent value="favorites" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              {favoriteStudios.length} любими студиа
            </p>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setShowEmptyFavorites(!showEmptyFavorites)}>
              {showEmptyFavorites ? 'Покажи данни' : 'Покажи празно'}
            </Button>
          </div>

          {favoriteStudios.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Няма любими студиа</h3>
              <p className="text-muted-foreground mb-6">Натиснете ❤️ на студио, за да го добавите тук.</p>
              <Button asChild variant="outline">
                <Link to="/discover">Открий студио</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteStudios.map(studio => (
                <Card key={studio.id} className="group overflow-hidden hover:shadow-md transition-all duration-200 hover:border-primary/30">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-28 sm:w-36 bg-gradient-to-br from-sage/40 to-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-4xl">🧘</span>
                      </div>
                      <div className="flex-1 p-4 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/studio/${studio.id}`} className="min-w-0">
                            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {studio.name}
                            </h3>
                          </Link>
                          <button
                            onClick={() => { toggleFavorite(studio.id); toast.success('Премахнато от любими'); }}
                            className="shrink-0 p-1.5 rounded-full hover:bg-muted transition-colors"
                          >
                            <Heart className="h-4 w-4 fill-destructive text-destructive" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{studio.address}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                            <span className="text-sm font-medium text-foreground">{studio.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">({studio.reviewCount} ревюта)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings tab */}
        <TabsContent value="settings">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">Лични данни</h2>
                <p className="text-sm text-muted-foreground mb-6">Актуализирайте вашата информация</p>
                <Separator className="mb-6" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Име</Label>
                  <Input id="name" defaultValue={displayName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Имейл</Label>
                  <Input id="email" defaultValue={displayEmail} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" placeholder="+359 ..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Град</Label>
                  <Input id="city" placeholder="София" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button>Запази промените</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail modal */}
      <Dialog open={!!selectedClass} onOpenChange={(open) => !open && setSelectedClass(null)}>
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
                  <InfoItem icon={<Clock className="h-4 w-4" />} label="Час" value={`${selected.startTime} – ${selected.endTime}`} />
                  <InfoItem icon={<MapPin className="h-4 w-4" />} label="Студио" value={selectedStudio?.name || ''} />
                  <InfoItem icon={<User className="h-4 w-4" />} label="Инструктор" value={selectedInstructor?.name || ''} />
                  <InfoItem icon={<Flame className="h-4 w-4" />} label="Тип" value={selected.yogaType} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getDifficultyColor(selected.difficulty)}`}>{selected.difficulty}</span>
                  <Badge variant="secondary">{selected.price} лв.</Badge>
                  <Badge variant="outline">{selected.enrolled}/{selected.maxCapacity} записани</Badge>
                </div>
                <Separator />
                <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm">
                  <p className="text-muted-foreground"><span className="font-medium text-foreground">Адрес:</span> {selectedStudio?.address}</p>
                  <p className="text-muted-foreground"><span className="font-medium text-foreground">Отказване:</span> {selected.cancellationPolicy}</p>
                </div>
                {selectedInstructor && (
                  <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {selectedInstructor.name.split(' ').map(n => n[0]).join('')}
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
                      {selectedInstructor.yogaStyle.map(s => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatPill = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm border border-border px-4 py-2 shadow-sm">
    <span className="text-primary">{icon}</span>
    <div className="text-sm">
      <span className="font-semibold text-foreground">{value}</span>
      <span className="text-muted-foreground ml-1">{label}</span>
    </div>
  </div>
);

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-2.5">
    <span className="text-primary mt-0.5">{icon}</span>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export default Profile;
