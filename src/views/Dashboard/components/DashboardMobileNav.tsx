import Link from 'next/link';
import { Building2, CalendarDays, CreditCard, GraduationCap, LayoutDashboard, BookOpen, Palmtree, Video } from 'lucide-react';
import { DASHBOARD_PATHS, type Section } from '../dashboardTypes';

const navItems: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Преглед', icon: LayoutDashboard },
  { key: 'studios', label: 'Студиа', icon: Building2 },
  { key: 'instructors', label: 'Инструктори', icon: GraduationCap },
  { key: 'classes', label: 'Класове', icon: BookOpen },
  { key: 'schedule', label: 'Разписание', icon: CalendarDays },
  { key: 'subscriptions', label: 'Абонаменти', icon: CreditCard },
  { key: 'videos', label: 'Видеа', icon: Video },
  { key: 'retreats', label: 'Рийтрийти', icon: Palmtree },
];

export function DashboardMobileNav({
  activeSection,
  setupSectionHints,
}: {
  activeSection: Section;
  setupSectionHints?: Partial<Record<Section, boolean>>;
}) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md py-2">
      <div className="flex w-full gap-1 overflow-x-auto px-2 scrollbar-none sm:justify-between sm:overflow-x-visible sm:px-4">
        {navItems.map(item => {
          const active = activeSection === item.key;
          const showSetupDot = Boolean(setupSectionHints?.[item.key]);
          return (
            <Link
              key={item.key}
              href={DASHBOARD_PATHS[item.key]}
              className={`relative flex shrink-0 flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${active ? 'text-primary' : 'text-muted-foreground'
                }`}
              aria-label={showSetupDot ? `${item.label} - незавършена стъпка от настройката` : undefined}
            >
              <span className="relative">
                <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                {showSetupDot ? (
                  <span
                    className="absolute -right-1 -top-1 h-2 w-2 rounded-full border-2 border-background bg-secondary"
                    title="Пълнете тази стъпка в ръководството за настройка"
                    aria-hidden
                  />
                ) : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

