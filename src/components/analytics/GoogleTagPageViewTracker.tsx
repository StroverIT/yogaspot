'use client';

import { useEffect } from 'react';
import { trackGoogleTag } from '@/lib/google-tag';

type GoogleTagPageViewTrackerProps = {
  contentName?: string;
};

const DEDUPE_WINDOW_MS = 5_000;

export function GoogleTagPageViewTracker({ contentName }: GoogleTagPageViewTrackerProps) {
  useEffect(() => {
    const dedupeKey = `google_tag_page_view:${contentName ?? 'default'}`;
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
      trackGoogleTag('page_view', { page_title: contentName });
      return;
    }

    trackGoogleTag('page_view');
  }, [contentName]);

  return null;
}
