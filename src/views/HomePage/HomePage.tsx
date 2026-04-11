"use client";

import { useState, useMemo, useEffect } from "react";
import type { Studio, YogaClass } from "@/data/mock-data";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import HeroSection from "./HeroSection";
import TopStudiosSection from "./TopStudiosSection";
import HowItWorksSection from "./HowItWorksSection";
import ForStudiosCTA from "./ForStudiosCTA";
import NearbyStudiosSection from "./NearbyStudiosSection";

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const [studios, setStudios] = useState<Studio[]>([]);
  const [classes, setClasses] = useState<YogaClass[]>([]);

  useEffect(() => {
    fetch("/api/public/studios")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("catalog"))))
      .then((j: { studios: Studio[]; classes: YogaClass[] }) => {
        setStudios(j.studios ?? []);
        setClasses(j.classes ?? []);
      })
      .catch(() => {
        setStudios([]);
        setClasses([]);
      });
  }, []);

  const topStudios = useMemo(
    () => [...studios].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount).slice(0, 6),
    [studios],
  );

  const totalEnrolled = useMemo(() => classes.reduce((s, c) => s + c.enrolled, 0), [classes]);

  const avgRating = useMemo(() => {
    if (!studios.length) return "4.7";
    const v = studios.reduce((s, st) => s + st.rating, 0) / studios.length;
    return v.toFixed(1);
  }, [studios]);

  const handleFavorite = (e: React.MouseEvent, studioId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    const added = toggleFavorite(studioId);
    toast.success(added ? "Добавено в любими" : "Премахнато от любими");
  };

  return (
    <div className="font-body">
      <HeroSection
        studioCount={studios.length}
        classCount={classes.length}
        totalEnrolled={totalEnrolled}
        avgRating={avgRating}
      />
      <HowItWorksSection />
      <NearbyStudiosSection
        studios={studios}
        classes={classes}
        isFavorite={isFavorite}
        onFavorite={handleFavorite}
      />
      <TopStudiosSection
        studios={topStudios}
        classes={classes}
        isFavorite={isFavorite}
        onFavorite={handleFavorite}
      />
      <ForStudiosCTA />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
