import { getHomeStudios, getHomeClasses, computeTopStudios } from "@/lib/home/home-data";
import TopStudiosSectionClient from "@/components/home/top-studios-section-client";

export default async function HomeTopStudiosSectionServer() {
  const [studios, classes] = await Promise.all([getHomeStudios(), getHomeClasses()]);
  return <TopStudiosSectionClient studios={computeTopStudios(studios)} classes={classes} />;
}
