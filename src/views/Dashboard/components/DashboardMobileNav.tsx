import Link from 'next/link';
import { Building2, CalendarDays, GraduationCap, LayoutDashboard, BookOpen } from 'lucide-react';
import { DASHBOARD_PATHS, type Section } from '../dashboardTypes';

const navItems: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Преглед', icon: LayoutDashboard },
  { key: 'studios', label: 'Студиа', icon: Building2 },
  { key: 'instructors', label: 'Инструктори', icon: GraduationCap },
  { key: 'classes', label: 'Класове', icon: BookOpen },
  { key: 'schedule', label: 'Разписание', icon: CalendarDays },
];

export function DashboardMobileNav({ activeSection }: { activeSection: Section }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md px-2 py-2">
      <div className="flex justify-around">
        {navItems.map(item => {
          const active = activeSection === item.key;
          return (
            <Link
              key={item.key}
              href={DASHBOARD_PATHS[item.key]}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
              <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

