'use client';

import { BarChart3, Building2, Inbox, LineChart, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import type { ReactNode } from 'react';
import { isAdminSectionKey, type AdminSectionKey } from '../types';

const sections: { key: AdminSectionKey; label: string; icon: ReactNode }[] = [
  { key: 'analytics', label: 'Analytics', icon: <LineChart className="h-4 w-4" /> },
  { key: 'overview', label: 'Преглед', icon: <BarChart3 className="h-4 w-4" /> },
  { key: 'studios', label: 'Студиа', icon: <Building2 className="h-4 w-4" /> },
  { key: 'users', label: 'Потребители', icon: <Users className="h-4 w-4" /> },
  { key: 'reviews', label: 'Ревюта', icon: <Star className="h-4 w-4" /> },
  { key: 'requests', label: 'Заявки', icon: <Inbox className="h-4 w-4" /> },
];

export function AdminSectionNav() {
  const segment = useSelectedLayoutSegment();
  const activeSection: AdminSectionKey =
    segment && isAdminSectionKey(segment) ? segment : 'analytics';

  return (
    <div className="flex w-fit max-w-full gap-1 p-1 bg-muted rounded-xl mb-8 overflow-x-auto">
      {sections.map(s => (
        // Root analytics lives on /admin, while other sections use /admin/{key}.
        <Link
          key={s.key}
          href={s.key === 'analytics' ? '/admin' : `/admin/${s.key}`}
          scroll={false}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeSection === s.key ? 'text-foreground bg-white' : 'text-muted-foreground hover:text-foreground/70'
            }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            {s.icon}
            {s.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
