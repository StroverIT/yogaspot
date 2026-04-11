'use client';

import { useState } from 'react';
import { mockStudios } from '@/data/mock-data';
import { useFavorites } from '@/hooks/useFavorites';
import { ProfileFavoritesTab } from '@/components/profile/profile-favorites-tab';

export default function ProfileFavoritesPage() {
  const [showEmptyFavorites, setShowEmptyFavorites] = useState(false);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const favoriteStudios = showEmptyFavorites ? [] : mockStudios.filter((s) => favoriteIds.includes(s.id));

  return (
    <ProfileFavoritesTab
      favoriteStudios={favoriteStudios}
      showEmptyFavorites={showEmptyFavorites}
      onToggleEmptyFavorites={() => setShowEmptyFavorites(!showEmptyFavorites)}
      onRemoveFavorite={toggleFavorite}
    />
  );
}
