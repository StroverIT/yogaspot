"use client";

import { useEffect, useMemo, useState } from "react";
import type { Studio } from "@/data/mock-data";
import { Heart, Search } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FavoriteStudioCard,
  type FavoriteStudioDetailBundle,
} from "@/components/favorites/favorite-studio-card";

type FavoriteStudiosPanelLayout = "page" | "profile";

export function FavoriteStudiosPanel({ layout }: { layout: FavoriteStudiosPanelLayout }) {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [catalogStudios, setCatalogStudios] = useState<Studio[]>([]);
  const [detailsById, setDetailsById] = useState<Record<string, FavoriteStudioDetailBundle>>({});

  useEffect(() => {
    fetch("/api/public/studios")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: { studios: Studio[] }) => setCatalogStudios(j.studios ?? []))
      .catch(() => setCatalogStudios([]));
  }, []);

  useEffect(() => {
    if (!favoriteIds.length) {
      setDetailsById({});
      return;
    }
    let cancelled = false;
    Promise.all(
      favoriteIds.map((id) =>
        fetch(`/api/public/studios/${encodeURIComponent(id)}`).then((r) =>
          r.ok ? (r.json() as Promise<FavoriteStudioDetailBundle & { studio: Studio }>) : null,
        ),
      ),
    ).then((rows) => {
      if (cancelled) return;
      const next: Record<string, FavoriteStudioDetailBundle> = {};
      rows.forEach((row, i) => {
        const id = favoriteIds[i];
        if (row && id) {
          next[id] = {
            schedule: row.schedule ?? [],
            instructors: row.instructors ?? [],
            subscription: row.subscription ?? null,
          };
        }
      });
      setDetailsById(next);
    });
    return () => {
      cancelled = true;
    };
  }, [favoriteIds]);

  const favoriteStudios = useMemo(
    () => favoriteIds.map((id) => catalogStudios.find((s) => s.id === id)).filter(Boolean) as Studio[],
    [favoriteIds, catalogStudios],
  );

  const handleRemove = (studioId: string) => {
    toggleFavorite(studioId);
    toast.success("Премахнато от любими");
  };

  const isProfile = layout === "profile";
  const wrapperClass = isProfile ? "space-y-4" : "container mx-auto px-4 py-8";

  if (favoriteStudios.length === 0) {
    if (isProfile) {
      return (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">Няма любими студиа</h3>
          <p className="text-muted-foreground mb-6">
            Натиснете {"\u2764\uFE0F"} на студио, за да го добавите тук.
          </p>
          <Button asChild variant="outline">
            <Link href="/discover">Открий студио</Link>
          </Button>
        </div>
      );
    }
    return (
      <div className={wrapperClass}>
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Heart className="h-9 w-9 text-muted-foreground/40" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Няма любими студиа</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Все още не сте запазили нито едно студио. Разгледайте нашия каталог и натиснете сърчицето, за да
            добавите студио в любими.
          </p>
          <Button asChild size="lg" className="rounded-xl gap-2">
            <Link href="/discover">
              <Search className="h-4 w-4" /> Открий студио
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {isProfile && (
        <p className="text-sm text-muted-foreground mb-2">{favoriteStudios.length} любими студиа</p>
      )}
      <div className="space-y-6">
        {favoriteStudios.map((studio) => (
          <FavoriteStudioCard
            key={studio.id}
            studio={studio}
            bundle={detailsById[studio.id]}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}
