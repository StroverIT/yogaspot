"use client";

import type { Studio, YogaClass } from "@/data/mock-data";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import TopStudiosSection from "@/views/HomePage/TopStudiosSection";
import { useHomeStudiosAuthRequest } from "@/components/home/home-studios-favorite-shell";

type TopStudiosSectionClientProps = {
  studios: Studio[];
  classes: YogaClass[];
};

export default function TopStudiosSectionClient({ studios, classes }: TopStudiosSectionClientProps) {
  const requestAuth = useHomeStudiosAuthRequest();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const handleFavorite = (e: React.MouseEvent, studioId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      requestAuth();
      return;
    }
    const added = toggleFavorite(studioId);
    toast.success(added ? "Добавено в любими" : "Премахнато от любими");
  };

  return (
    <TopStudiosSection
      studios={studios}
      classes={classes}
      isFavorite={isFavorite}
      onFavorite={handleFavorite}
    />
  );
}
