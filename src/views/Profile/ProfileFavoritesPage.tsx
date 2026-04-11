'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Studio } from '@/data/mock-data';
import { useFavorites } from '@/hooks/useFavorites';
import { ProfileFavoritesTab } from '@/components/profile/profile-favorites-tab';

export default function ProfileFavoritesPage() {
  const [showEmptyFavorites, setShowEmptyFavorites] = useState(false);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [studios, setStudios] = useState<Studio[]>([]);

  useEffect(() => {
    fetch('/api/public/studios')
      .then((r) => (r.ok ? r.json() : { studios: [] }))
      .then((j: { studios: Studio[] }) => setStudios(j.studios ?? []));
  }, []);

  const favoriteStudios = useMemo(
    () =>
      showEmptyFavorites
        ? []
        : favoriteIds.map((id) => studios.find((s) => s.id === id)).filter(Boolean) as Studio[],
    [showEmptyFavorites, favoriteIds, studios],
  );

  return (
    <ProfileFavoritesTab
      favoriteStudios={favoriteStudios}
      showEmptyFavorites={showEmptyFavorites}
      onToggleEmptyFavorites={() => setShowEmptyFavorites(!showEmptyFavorites)}
      onRemoveFavorite={toggleFavorite}
    />
  );
}
