import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "yoga_favorite_studios";

/** Stable empty list for snapshots (React compares by reference). */
const EMPTY_FAVORITES: string[] = [];

function readFavoritesRaw(): string {
  try {
    if (typeof window === "undefined") return "[]";
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseFavorites(serialized: string): string[] {
  try {
    const parsed = JSON.parse(serialized) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_FAVORITES;
    const ids = parsed.filter((id): id is string => typeof id === "string");
    return ids.length === 0 ? EMPTY_FAVORITES : ids;
  } catch {
    return EMPTY_FAVORITES;
  }
}

let cachedRaw: string | null = null;
let cachedList: string[] = EMPTY_FAVORITES;

function getSnapshot(): string[] {
  const raw = readFavoritesRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedList = parseFavorites(raw);
  }
  return cachedList;
}

function getServerSnapshot(): string[] {
  return EMPTY_FAVORITES;
}

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((fn) => fn());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onStoreChange();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function readFavorites(): string[] {
  return parseFavorites(readFavoritesRaw());
}

export function useFavorites() {
  const favoriteIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleFavorite = useCallback((studioId: string) => {
    const current = readFavorites();
    const next = current.includes(studioId)
      ? current.filter((id) => id !== studioId)
      : [...current, studioId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = null;
    emitChange();
    return next.includes(studioId);
  }, []);

  const isFavorite = useCallback(
    (studioId: string) => favoriteIds.includes(studioId),
    [favoriteIds]
  );

  return { favoriteIds, toggleFavorite, isFavorite };
}
