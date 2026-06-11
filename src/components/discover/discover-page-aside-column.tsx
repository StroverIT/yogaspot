import { DiscoverAsideMenu } from "@/components/discover/DiscoverAsideMenu";

/** Desktop sticky filters column (URL-driven filters). */
export function DiscoverPageAsideColumn({ cities }: { cities: string[] }) {
  return <DiscoverAsideMenu variant="sidebar" cities={cities} />;
}
