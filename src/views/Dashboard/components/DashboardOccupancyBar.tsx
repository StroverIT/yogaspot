import { cn } from '@/lib/utils';

export function DashboardOccupancyBar({
  percent,
  heightClass = 'h-2.5',
  className,
  ariaLabel,
  ariaValueNow,
  ariaValueMax,
}: {
  /** Fill level 0–100 */
  percent: number;
  heightClass?: string;
  className?: string;
  ariaLabel?: string;
  /** Defaults to rounded percent / 100 when omitted */
  ariaValueNow?: number;
  ariaValueMax?: number;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-full border border-border/50 bg-white shadow-[inset_0_1px_2px_rgba(45,42,79,0.06)]',
        heightClass,
        className,
      )}
      role="progressbar"
      aria-valuenow={ariaValueNow ?? pct}
      aria-valuemin={0}
      aria-valuemax={ariaValueMax ?? 100}
      aria-label={ariaLabel}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
