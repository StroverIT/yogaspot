import { Separator } from '@/components/ui/separator';
import { BarChart3, Building2, CalendarDays, ChevronRight, GraduationCap, LayoutDashboard, BookOpen } from 'lucide-react';
import type { Section } from '../dashboardTypes';

const sidebarItems: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Преглед', icon: LayoutDashboard },
  { key: 'studios', label: 'Студиа', icon: Building2 },
  { key: 'instructors', label: 'Инструктори', icon: GraduationCap },
  { key: 'classes', label: 'Класове', icon: BookOpen },
  { key: 'schedule', label: 'Разписание', icon: CalendarDays },
];

export function DashboardSidebar({
  displayName,
  activeSection,
  onSectionChange,
  revenue,
}: {
  displayName: string;
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  revenue: number;
}) {
  return (
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
              onClick={() => onSectionChange(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
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
  );
}

