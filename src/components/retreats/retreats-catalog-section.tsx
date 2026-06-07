import { Suspense } from 'react';
import { Sparkles } from 'lucide-react';
import { RetreatCatalogCard } from '@/components/retreats/retreat-catalog-card';
import { RetreatsCatalogToolbar } from '@/components/retreats/retreats-catalog-toolbar';
import { getHomeRetreats } from '@/lib/home/home-data';
import { sortRetreatCatalog, toRetreatCatalogItem } from '@/lib/retreats-catalog';
import {
  parseRetreatsSortFromSearchParams,
  parseRetreatsUserLocationFromSearchParams,
  retreatsSearchParamsFromPage,
} from '@/lib/retreats-search-params';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function RetreatsCatalogSection({ searchParams }: Props) {
  const sp = retreatsSearchParamsFromPage(await searchParams);
  const sort = parseRetreatsSortFromSearchParams(sp);
  const userLocation = parseRetreatsUserLocationFromSearchParams(sp);

  const retreats = await getHomeRetreats();
  const catalogItems = retreats.map(toRetreatCatalogItem);
  const sortedRetreats = sortRetreatCatalog(catalogItems, {
    sortSoon: sort.sortSoon,
    sortNear: sort.sortNear,
    userLocation,
  });

  if (sortedRetreats.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-primary/30 bg-linear-to-br from-primary/10 via-background to-secondary/10 p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground">Още няма създадени рийтрийти</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Когато бизнесите публикуват нови рийтрийти, те ще се появят тук. Провери отново по-късно.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Suspense fallback={null}>
        <RetreatsCatalogToolbar />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedRetreats.map((retreat, index) => (
          <RetreatCatalogCard
            key={retreat.id}
            retreat={retreat}
            priority={index < 3}
            showDistance={sort.sortNear && userLocation != null}
          />
        ))}
      </div>
    </div>
  );
}
