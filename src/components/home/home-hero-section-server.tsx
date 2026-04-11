import HeroSection from "@/views/HomePage/HeroSection";
import { getHomeStudios, getHomeClasses } from "@/lib/home/home-data";

export default async function HomeHeroSectionServer() {
  const [studios, classes] = await Promise.all([getHomeStudios(), getHomeClasses()]);
  const totalEnrolled = classes.reduce((s, c) => s + c.enrolled, 0);
  const avgRating =
    studios.length > 0
      ? (studios.reduce((acc, st) => acc + st.rating, 0) / studios.length).toFixed(1)
      : "4.7";

  return (
    <HeroSection
      studioCount={studios.length}
      classCount={classes.length}
      totalEnrolled={totalEnrolled}
      avgRating={avgRating}
    />
  );
}
