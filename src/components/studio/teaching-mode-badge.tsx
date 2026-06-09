import { MapPin, Video } from 'lucide-react';

import type { TeachingMode } from '@/data/mock-data';
import { cn } from '@/lib/utils';

export function TeachingModeBadge({
  mode,
  address,
  className,
}: {
  mode: TeachingMode;
  address?: string;
  className?: string;
}) {
  if (mode === 'online') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-sm text-muted-foreground',
          className,
        )}
      >
        <Video className="h-3.5 w-3.5 shrink-0 text-primary" />
        Онлайн
      </span>
    );
  }

  if (!address?.trim()) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-sm text-muted-foreground',
        className,
      )}
    >
      <MapPin className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{address}</span>
    </span>
  );
}

export function TeachingModePill({ mode, className }: { mode: TeachingMode; className?: string }) {
  const isOnline = mode === 'online';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        isOnline ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {isOnline ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
      {isOnline ? 'Онлайн' : 'В студио'}
    </span>
  );
}
