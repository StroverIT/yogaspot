"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { FavoriteStudiosPanel } from "@/components/favorites/favorite-studios-panel";

const Favorites = () => {
  const { favoriteIds } = useFavorites();
  const n = favoriteIds.length;

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary/8 via-background to-sage/15 border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Вашата колекция</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
                  Любими студиа
                </h1>
                <p className="text-muted-foreground">
                  {n > 0 ? (n === 1 ? "1 запазено студио" : `${n} запазени студиа`) : "Вашите запазени студиа на едно място"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FavoriteStudiosPanel layout="page" />
    </div>
  );
};

export default Favorites;
