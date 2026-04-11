import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";

/**
 * Studio favorites for the signed-in user, loaded from Postgres (Supabase DB)
 * via `/api/favorites` — not localStorage.
 */
const EMPTY_FAVORITES: string[] = [];

const listeners = new Set<() => void>();

let favoriteKey: string | null = null;
let favoriteIds: string[] = EMPTY_FAVORITES;

function sortedKey(ids: string[]) {
  return ids.length === 0 ? "" : [...ids].sort().join("\0");
}

function replaceFavorites(next: string[]) {
  const key = sortedKey(next);
  if (key === favoriteKey) return;
  favoriteKey = key;
  favoriteIds = next.length === 0 ? EMPTY_FAVORITES : [...next];
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return favoriteIds;
}

function getServerSnapshot() {
  return EMPTY_FAVORITES;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

async function fetchFavoritesFromApi(signal?: AbortSignal) {
  const res = await fetch("/api/favorites", { credentials: "same-origin", signal });
  if (!res.ok) {
    if (!signal?.aborted) replaceFavorites([]);
    return;
  }
  const data = (await res.json()) as { studioIds?: unknown };
  if (signal?.aborted) return;
  const ids = Array.isArray(data.studioIds)
    ? data.studioIds.filter((id): id is string => typeof id === "string")
    : [];
  replaceFavorites(ids);
}

async function persistFavoritesPut(next: string[]) {
  try {
    const res = await fetch("/api/favorites", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ studioIds: next }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { studioIds?: unknown };
    const ids = Array.isArray(data.studioIds)
      ? data.studioIds.filter((id): id is string => typeof id === "string")
      : next;
    replaceFavorites(ids);
  } catch {
    try {
      await fetchFavoritesFromApi();
    } catch {
      /* leave current UI state */
    }
  }
}

type SessionUserWithId = { id?: string };

export function useFavorites() {
  const { status, data: session } = useSession();
  const sessionUserId = (session?.user as SessionUserWithId | undefined)?.id;
  const favoriteIdsSnapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const ac = new AbortController();
    if (status === "loading") {
      return () => ac.abort();
    }
    if (status === "unauthenticated") {
      replaceFavorites([]);
      return () => ac.abort();
    }
    void fetchFavoritesFromApi(ac.signal);
    return () => ac.abort();
  }, [status, sessionUserId]);

  const toggleFavorite = useCallback((studioId: string) => {
    if (status !== "authenticated") return false;
    const prev = favoriteIds === EMPTY_FAVORITES ? [] : [...favoriteIds];
    const next = prev.includes(studioId)
      ? prev.filter((id) => id !== studioId)
      : [...prev, studioId];
    replaceFavorites(next);
    void persistFavoritesPut(next);
    return next.includes(studioId);
  }, [status]);

  const isFavorite = useCallback(
    (studioId: string) => favoriteIdsSnapshot.includes(studioId),
    [favoriteIdsSnapshot]
  );

  return { favoriteIds: favoriteIdsSnapshot, toggleFavorite, isFavorite };
}
