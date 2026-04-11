import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StudioTabEmptyState({
  icon: Icon,
  title,
  subtitle,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-muted/20 px-6 py-12 text-center text-muted-foreground',
        className,
      )}
    >
      <Icon className="mx-auto mb-3 h-10 w-10 opacity-40" aria-hidden />
      <p className="font-medium text-foreground">{title}</p>
      {subtitle ? <p className="mt-1 text-sm">{subtitle}</p> : null}
    </div>
  );
}
