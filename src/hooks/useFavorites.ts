import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'yoga_favorite_studios';

function readFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Global listeners so all instances stay in sync
const listeners = new Set<(ids: string[]) => void>();

function notify(ids: string[]) {
  listeners.forEach(fn => fn(ids));
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(readFavorites);

  useEffect(() => {
    const handler = (ids: string[]) => setFavoriteIds(ids);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const toggleFavorite = useCallback((studioId: string) => {
    const current = readFavorites();
    const next = current.includes(studioId)
      ? current.filter(id => id !== studioId)
      : [...current, studioId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFavoriteIds(next);
    notify(next);
    return next.includes(studioId);
  }, []);

  const isFavorite = useCallback((studioId: string) => {
    return favoriteIds.includes(studioId);
  }, [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite };
}
