import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockStudios, mockClasses, mockInstructors, mockSchedule, mockSubscriptions, YOGA_TYPES, DIFFICULTY_LEVELS, WEEKDAYS, type ScheduleEntry, type Weekday } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Star, Plus, Edit, Trash2, Users, Calendar, TrendingUp, LayoutDashboard,
  Building2, GraduationCap, BookOpen, MapPin, Phone, Mail, Globe, Clock,
  ChevronRight, BarChart3, Eye, AlertCircle, CalendarDays, CreditCard, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

type ModalType = 'studio' | 'instructor' | 'class' | 'schedule' | null;
type Section = 'overview' | 'studios' | 'instructors' | 'classes' | 'schedule';

const sidebarItems: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Преглед', icon: LayoutDashboard },
  { key: 'studios', label: 'Студиа', icon: Building2 },
  { key: 'instructors', label: 'Инструктори', icon: GraduationCap },
  { key: 'classes', label: 'Класове', icon: BookOpen },
  { key: 'schedule', label: 'Разписание', icon: CalendarDays },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);
  const myStudios = mockStudios.filter(s => s.businessId === 'b1');
  const myClasses = mockClasses.filter(c => myStudios.some(s => s.id === c.studioId));
  const myInstructors = mockInstructors.filter(i => myStudios.some(s => s.id === i.studioId));
  const totalEnrolled = myClasses.reduce((sum, c) => sum + c.enrolled, 0);
  const totalCapacity = myClasses.reduce((sum, c) => sum + c.maxCapacity, 0);
  const avgRating = myStudios.length ? (myStudios.reduce((s, st) => s + st.rating, 0) / myStudios.length).toFixed(1) : '0';
  const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
  const revenue = myClasses.reduce((sum, c) => sum + c.enrolled * c.price, 0);

  const handleSave = () => {
    const labels = { studio: 'Студиото', instructor: 'Инструкторът', class: 'Класът' };
    toast.success(`${labels[modalType!]} беше запазен успешно!`);
    setModalType(null);
  };

  const displayName = user?.name || 'Бизнес потребител';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 p-6 shrink-0">
        <div className="mb-8">
          <h2 className="font-display text-lg font-bold text-foreground">Бизнес табло</h2>
          <p className="text-sm text-muted-foreground mt-1">Здравейте, {displayName}</p>
        </div>
        <nav className="space-y-1 flex-1">
          {sidebarItems.map(item => {
            const active = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
                {active && <ChevronRight className="h-4 w-4 ml-auto" />}
              </button>
            );
          })}
        </nav>
        <Separator className="my-4" />
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Бърз преглед</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{revenue} лв.</p>
          <p className="text-xs text-muted-foreground mt-0.5">Приход от записвания</p>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md px-2 py-2">
        <div className="flex justify-around">
          {sidebarItems.map(item => {
            const active = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
        {activeSection === 'overview' && (
          <OverviewSection
            avgRating={avgRating}
            totalEnrolled={totalEnrolled}
            totalCapacity={totalCapacity}
            occupancyRate={occupancyRate}
            myStudios={myStudios}
            myClasses={myClasses}
            myInstructors={myInstructors}
            revenue={revenue}
          />
        )}
        {activeSection === 'studios' && (
          <StudiosSection studios={myStudios} onAdd={() => setModalType('studio')} onEdit={() => setModalType('studio')} />
        )}
        {activeSection === 'instructors' && (
          <InstructorsSection instructors={myInstructors} onAdd={() => setModalType('instructor')} onEdit={() => setModalType('instructor')} />
        )}
        {activeSection === 'classes' && (
          <ClassesSection classes={myClasses} onAdd={() => setModalType('class')} onEdit={() => setModalType('class')} />
        )}
        {activeSection === 'schedule' && (
          <ScheduleSection
            studios={myStudios}
            onAdd={() => { setEditingSchedule(null); setModalType('schedule'); }}
            onEdit={(entry) => { setEditingSchedule(entry); setModalType('schedule'); }}
          />
        )}

        {/* Modals */}
        <StudioModal open={modalType === 'studio'} onClose={() => setModalType(null)} onSave={handleSave} />
        <InstructorModal open={modalType === 'instructor'} onClose={() => setModalType(null)} onSave={handleSave} studios={myStudios} />
        <ClassModal open={modalType === 'class'} onClose={() => setModalType(null)} onSave={handleSave} studios={myStudios} instructors={myInstructors} />
        <ScheduleModal open={modalType === 'schedule'} onClose={() => { setModalType(null); setEditingSchedule(null); }} onSave={handleSave} studios={myStudios} instructors={myInstructors} entry={editingSchedule} />
      </main>
    </div>
  );
};

/* ────── Overview Section ────── */
const OverviewSection = ({
  avgRating, totalEnrolled, totalCapacity, occupancyRate, myStudios, myClasses, myInstructors, revenue,
}: {
  avgRating: string; totalEnrolled: number; totalCapacity: number; occupancyRate: number;
  myStudios: typeof mockStudios; myClasses: typeof mockClasses; myInstructors: typeof mockInstructors; revenue: number;
}) => (
  <div className="space-y-8">
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Преглед</h1>
      <p className="text-muted-foreground text-sm mt-1">Обобщена информация за вашия бизнес</p>
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { icon: TrendingUp, label: 'Среден рейтинг', value: avgRating, sub: `от ${myStudios.reduce((s, st) => s + st.reviewCount, 0)} ревюта`, color: 'text-accent' },
        { icon: Users, label: 'Общо записвания', value: totalEnrolled, sub: `от ${totalCapacity} места`, color: 'text-primary' },
        { icon: Calendar, label: 'Активни класове', value: myClasses.length, sub: `${myInstructors.length} инструктора`, color: 'text-primary' },
        { icon: BarChart3, label: 'Приход', value: `${revenue} лв.`, sub: 'от записвания', color: 'text-accent' },
      ].map((card, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <card.icon className={`h-5 w-5 ${card.color}`} />
            <Eye className="h-3.5 w-3.5 text-muted-foreground/40" />
          </div>
          <p className="font-display text-2xl font-bold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">{card.sub}</p>
        </div>
      ))}
    </div>

    {/* Occupancy bar */}
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-foreground">Заетост на класовете</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{totalEnrolled} от {totalCapacity} места заети</p>
        </div>
        <span className="text-2xl font-bold text-primary">{occupancyRate}%</span>
      </div>
      <Progress value={occupancyRate} className="h-3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {myClasses.map(cls => {
          const fill = Math.round((cls.enrolled / cls.maxCapacity) * 100);
          const isFull = cls.enrolled >= cls.maxCapacity;
          return (
            <div key={cls.id} className="rounded-xl bg-muted/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground truncate pr-2">{cls.name}</p>
                {isFull && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Пълен</Badge>}
              </div>
              <Progress value={fill} className="h-2 mb-1.5" />
              <p className="text-xs text-muted-foreground">{cls.enrolled}/{cls.maxCapacity} записани</p>
            </div>
          );
        })}
      </div>
    </div>

    {/* Quick actions */}
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display font-semibold text-foreground mb-4">Студиа</h3>
      <div className="space-y-3">
        {myStudios.map(studio => (
          <div key={studio.id} className="flex items-center gap-4 rounded-xl bg-muted/30 p-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl shrink-0">🧘</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{studio.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{studio.address}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="font-semibold text-foreground">{studio.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">{studio.reviewCount} ревюта</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ────── Studios Section ────── */
const StudiosSection = ({
  studios, onAdd, onEdit,
}: {
  studios: typeof mockStudios; onAdd: () => void; onEdit: () => void;
}) => (
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

/* ────── Instructors Section ────── */
const InstructorsSection = ({
  instructors, onAdd, onEdit,
}: {
  instructors: typeof mockInstructors; onAdd: () => void; onEdit: () => void;
}) => (
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

/* ────── Classes Section ────── */
const ClassesSection = ({
  classes, onAdd, onEdit,
}: {
  classes: typeof mockClasses; onAdd: () => void; onEdit: () => void;
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Класове</h1>
        <p className="text-muted-foreground text-sm mt-1">{classes.length} класа</p>
      </div>
      <Button onClick={onAdd} className="gap-2"><Plus className="h-4 w-4" /> Добави клас</Button>
    </div>
    <div className="space-y-4">
      {classes.map((cls) => {
        const instr = mockInstructors.find(ins => ins.id === cls.instructorId);
        const studio = mockStudios.find(s => s.id === cls.studioId);
        const fill = Math.round((cls.enrolled / cls.maxCapacity) * 100);
        const isFull = cls.enrolled >= cls.maxCapacity;

        return (
          <div
            key={cls.id}
            className="group rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Date block */}
              <div className="hidden md:flex flex-col items-center justify-center min-w-[64px] rounded-xl bg-primary/10 p-3">
                <span className="text-xs font-medium text-primary uppercase">
                  {new Date(cls.date).toLocaleDateString('bg-BG', { month: 'short' })}
                </span>
                <span className="text-xl font-bold text-primary leading-tight">
                  {new Date(cls.date).getDate()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{cls.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{cls.startTime} – {cls.endTime}</span>
                      {instr && <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{instr.name}</span>}
                      {studio && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{studio.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-display text-lg font-bold text-foreground">{cls.price} лв.</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="secondary" className="text-xs">{cls.yogaType}</Badge>
                  <DifficultyBadge difficulty={cls.difficulty} />
                  {isFull && (
                    <Badge variant="destructive" className="text-xs gap-1">
                      <AlertCircle className="h-3 w-3" /> Пълен
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 max-w-[200px]">
                    <Progress value={fill} className="h-2" />
                  </div>
                  <span className="text-xs text-muted-foreground">{cls.enrolled}/{cls.maxCapacity}</span>
                </div>
              </div>

              <div className="flex md:flex-col gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ────── Difficulty Badge ────── */
const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const colors: Record<string, string> = {
    'начинаещ': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    'среден': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    'напреднал': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[difficulty] || ''}`}>{difficulty}</span>;
};

/* ────── Studio Modal ────── */
const StudioModal = ({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) => (
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

/* ────── Instructor Modal ────── */
const InstructorModal = ({ open, onClose, onSave, studios }: { open: boolean; onClose: () => void; onSave: () => void; studios: typeof mockStudios }) => (
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

/* ────── Class Modal ────── */
const ClassModal = ({ open, onClose, onSave, studios, instructors }: {
  open: boolean; onClose: () => void; onSave: () => void;
  studios: typeof mockStudios; instructors: typeof mockInstructors;
}) => (
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

/* ────── Schedule Section ────── */
const ScheduleSection = ({
  studios, onAdd, onEdit,
}: {
  studios: typeof mockStudios; onAdd: () => void; onEdit: (entry: ScheduleEntry) => void;
}) => {
  const [selectedStudio, setSelectedStudio] = useState<string>(studios[0]?.id || '');
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  const studioSchedule = mockSchedule.filter(s => s.studioId === selectedStudio);
  const subscription = mockSubscriptions.find(s => s.studioId === selectedStudio);

  const scheduleByDay = WEEKDAYS.reduce((acc, day) => {
    acc[day] = studioSchedule.filter(s => s.day === day);
    return acc;
  }, {} as Record<Weekday, ScheduleEntry[]>);

  const handleDelete = (entry: ScheduleEntry) => {
    toast.success(`"${entry.className}" беше изтрит от разписанието.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Разписание</h1>
          <p className="text-muted-foreground text-sm mt-1">Управлявайте седмичното разписание на вашите студиа</p>
        </div>
        <Button onClick={onAdd} className="gap-2"><Plus className="h-4 w-4" /> Добави час</Button>
      </div>

      {/* Studio selector + view toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Select value={selectedStudio} onValueChange={setSelectedStudio}>
          <SelectTrigger className="w-[250px] rounded-xl">
            <SelectValue placeholder="Изберете студио" />
          </SelectTrigger>
          <SelectContent>
            {studios.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg bg-muted p-1">
          {(['weekly', 'monthly'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === mode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              <span>{mode === 'weekly' ? 'Седмично' : 'Месечно'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subscription info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Месечен абонамент</h3>
              {subscription?.hasMonthlySubscription ? (
                <>
                  <p className="text-sm text-muted-foreground mt-0.5">{subscription.subscriptionNote}</p>
                  <p className="text-lg font-bold text-primary mt-1">{subscription.monthlyPrice} лв./мес.</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5">Не е активиран за това студио</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2 rounded-lg shrink-0" onClick={() => toast.info('За активиране на абонамент, моля свържете се с нас на admin@yogaspot.bg')}>
            <MessageSquare className="h-4 w-4" />
            {subscription?.hasMonthlySubscription ? 'Промени' : 'Заявка'}
          </Button>
        </div>
      </div>

      {/* Weekly schedule grid */}
      {viewMode === 'weekly' && (
        <div className="space-y-4">
          {WEEKDAYS.map(day => {
            const entries = scheduleByDay[day];
            if (entries.length === 0) return null;
            return (
              <div
                key={day}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="px-5 py-3 bg-muted/50 border-b border-border">
                  <h3 className="font-semibold text-foreground text-sm">{day}</h3>
                </div>
                <div className="divide-y divide-border">
                  {entries.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => {
                    const instructor = mockInstructors.find(i => i.id === entry.instructorId);
                    return (
                      <div key={entry.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[56px]">
                            <p className="text-sm font-bold text-foreground">{entry.startTime}</p>
                            <p className="text-xs text-muted-foreground">{entry.endTime}</p>
                          </div>
                          <Separator orientation="vertical" className="h-10" />
                          <div>
                            <p className="font-medium text-foreground">{entry.className}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{entry.yogaType}</Badge>
                              <DifficultyBadge difficulty={entry.difficulty} />
                              {instructor && <span className="text-xs text-muted-foreground">с {instructor.name}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-foreground">{entry.price} лв.</p>
                            <p className="text-xs text-muted-foreground">{entry.maxCapacity} места</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(entry)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(entry)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {studioSchedule.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Няма добавени часове</p>
              <p className="text-sm mt-1">Добавете първия час в разписанието</p>
            </div>
          )}
        </div>
      )}

      {/* Monthly view - calendar-like */}
      {viewMode === 'monthly' && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
            {WEEKDAYS.map(day => (
              <div key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground border-r border-border last:border-r-0">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[200px]">
            {WEEKDAYS.map(day => {
              const entries = scheduleByDay[day];
              return (
                <div key={day} className="border-r border-border last:border-r-0 p-2 min-h-[120px]">
                  {entries.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => onEdit(entry)}
                      className="w-full text-left mb-1.5 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      <p className="text-xs font-semibold text-primary">{entry.startTime}</p>
                      <p className="text-xs text-foreground truncate">{entry.className}</p>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ────── Schedule Modal ────── */
const ScheduleModal = ({ open, onClose, onSave, studios, instructors, entry }: {
  open: boolean; onClose: () => void; onSave: () => void;
  studios: typeof mockStudios; instructors: typeof mockInstructors;
  entry: ScheduleEntry | null;
}) => (
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

export default Dashboard;
