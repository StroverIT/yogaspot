"use client";

import { useState, useMemo } from "react";
import { mockStudios, mockClasses, mockInstructors } from "@/data/mock-data";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import HeroSection from "./HeroSection";
import YogaTypeCategories from "./YogaTypeCategories";
import ValuePropositions from "./ValuePropositions";
import TopStudiosSection from "./TopStudiosSection";
import UpcomingClassesSection from "./UpcomingClassesSection";
import HowItWorksSection from "./HowItWorksSection";
import ForStudiosCTA from "./ForStudiosCTA";

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const topStudios = useMemo(
    () => [...mockStudios].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount).slice(0, 6),
    []
  );

  const upcomingClasses = useMemo(
    () => [...mockClasses].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4),
    []
  );

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

  const getStudio = (id: string) => mockStudios.find((s) => s.id === id);
  const getInstructor = (id: string) => mockInstructors.find((i) => i.id === id);

  return (
    <div className="font-body">
      <HeroSection />
      <HowItWorksSection />
      <ValuePropositions />
      <div className="w-full h-px bg-border" />


      <YogaTypeCategories />
      <TopStudiosSection
        studios={topStudios}
        isFavorite={isFavorite}
        onFavorite={handleFavorite}
      />
      <UpcomingClassesSection
        classes={upcomingClasses}
        getStudio={getStudio}
        getInstructor={getInstructor}
      />
      <ForStudiosCTA />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
