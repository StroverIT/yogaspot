import { DiscoverCatalogResultsSummary } from "@/components/discover/discover-catalog-results-summary";
import { DiscoverGridPanelClient } from "@/components/discover/discover-grid-panel-client";
import { getPublicCatalogCached } from "@/lib/get-public-catalog";

export async function DiscoverCatalogGridSection() {
  const { studios, classes } = await getPublicCatalogCached();
  return (
    <>
      <DiscoverCatalogResultsSummary catalogStudios={studios} catalogClasses={classes} />
      <DiscoverGridPanelClient catalogStudios={studios} catalogClasses={classes} />
    </>
  );
}
