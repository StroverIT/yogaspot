import { TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

const statTints = {
  primary: { blob: 'bg-primary/10', iconBg: 'bg-primary/10' },
  accent: { blob: 'bg-accent/10', iconBg: 'bg-accent/10' },
  sage: { blob: 'bg-sage/10', iconBg: 'bg-sage/10' },
} as const;

export type StatCardTint = keyof typeof statTints;

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  tint: StatCardTint;
};

export function StatCard({ icon, label, value, trend, tint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 relative overflow-hidden group hover:shadow-lg transition-shadow shadow-md">
      <div className={`pointer-events-none absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl ${statTints[tint].blob}`} />
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <div className={`shrink-0 flex items-center justify-center p-2.5 rounded-xl ${statTints[tint].iconBg}`}>{icon}</div>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="font-display text-3xl font-bold text-foreground">{value}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-sm text-primary">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
