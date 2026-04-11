import { getHomeStudios, getHomeClasses } from "@/lib/home/home-data";
import NearbyStudiosSectionClient from "@/components/home/nearby-studios-section-client";

export default async function HomeNearbyStudiosSectionServer() {
  const [studios, classes] = await Promise.all([getHomeStudios(), getHomeClasses()]);
  return <NearbyStudiosSectionClient studios={studios} classes={classes} />;
}
