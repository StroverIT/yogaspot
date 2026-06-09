import Image from 'next/image';

import { cn } from '@/lib/utils';

const SIZE_CLASS = {
  sm: 'h-7 w-[4.5rem]',
  md: 'h-9 w-[5.75rem]',
  lg: 'h-12 w-32',
  xl: 'h-16 w-40',
} as const;

export function MultisportBadge({
  className,
  size = 'sm',
}: {
  className?: string;
  size?: keyof typeof SIZE_CLASS;
}) {
  return (
    <Image
      src="/multisport.png"
      alt="MultiSport"
      width={280}
      height={110}
      className={cn('shrink-0 object-contain object-left', SIZE_CLASS[size], className)}
    />
  );
}
