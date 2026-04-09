import { BarChart3, Building2, Star, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AdminSectionKey } from '../types';

const sections: { key: AdminSectionKey; label: string; icon: ReactNode }[] = [
  { key: 'overview', label: 'Преглед', icon: <BarChart3 className="h-4 w-4" /> },
  { key: 'studios', label: 'Студиа', icon: <Building2 className="h-4 w-4" /> },
  { key: 'users', label: 'Потребители', icon: <Users className="h-4 w-4" /> },
  { key: 'reviews', label: 'Ревюта', icon: <Star className="h-4 w-4" /> },
];

type AdminSectionNavProps = {
  activeSection: AdminSectionKey;
  onSectionChange: (key: AdminSectionKey) => void;
};

export function AdminSectionNav({ activeSection, onSectionChange }: AdminSectionNavProps) {
  return (
    <div className="flex w-fit max-w-full gap-1 p-1 bg-muted rounded-xl mb-8 overflow-x-auto">
      {sections.map(s => (
        <button
          key={s.key}
          type="button"
          onClick={() => onSectionChange(s.key)}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeSection === s.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
          }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            {s.icon}
            {s.label}
          </span>
        </button>
      ))}
    </div>
  );
}
