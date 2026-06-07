'use client';

import { useCallback, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DiscoverGrid } from '@/components/discover/discover-grid';
import type { DiscoverStudio } from '@/types/studio-discovery';

type Props = {
  studios: DiscoverStudio[];
  hasMore: boolean;
  currentPage: number;
};

export function DiscoverGridPanelClient({ studios, hasMore, currentPage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const loadMore = useCallback(() => {
    if (isPending || !hasMore) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(currentPage + 1));

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [currentPage, hasMore, isPending, pathname, router, searchParams]);

  return (
    <DiscoverGrid
      studios={studios}
      isLoading={isPending}
      hasMore={hasMore}
      onLoadMore={loadMore}
    />
  );
}
