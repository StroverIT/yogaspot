'use client';

import { useEffect } from 'react';
import { trackMetaPixel } from '@/lib/meta-pixel';

type MetaPixelPageViewTrackerProps = {
  contentName?: string;
};

const DEDUPE_WINDOW_MS = 5_000;

export function MetaPixelPageViewTracker({ contentName }: MetaPixelPageViewTrackerProps) {
  useEffect(() => {
    const dedupeKey = `meta_pixel_page_view:${contentName ?? 'default'}`;
    const now = Date.now();

    try {
      const lastTrackedRaw = window.sessionStorage.getItem(dedupeKey);
      const lastTrackedAt = lastTrackedRaw ? Number(lastTrackedRaw) : 0;
      if (Number.isFinite(lastTrackedAt) && now - lastTrackedAt < DEDUPE_WINDOW_MS) {
        return;
      }
      window.sessionStorage.setItem(dedupeKey, String(now));
    } catch {
      // Ignore storage edge cases and still track.
    }

    if (contentName) {
      trackMetaPixel('PageView', { content_name: contentName });
      return;
    }

    trackMetaPixel('PageView');
  }, [contentName]);

  return null;
}
