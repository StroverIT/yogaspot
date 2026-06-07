'use client';

import { useEffect, useState, type RefObject } from 'react';

type Options = {
  /** Max wait before loading even when the browser stays busy (ms). */
  idleTimeout?: number;
  rootMargin?: string;
};

export function useDeferredLoad(
  ref: RefObject<Element | null>,
  { idleTimeout = 4000, rootMargin = '0px' }: Options = {},
) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shouldLoad) return;

    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver | undefined;

    const startLoading = () => {
      if (cancelled || shouldLoad) return;
      const run = () => {
        if (!cancelled) setShouldLoad(true);
      };
      if (typeof requestIdleCallback === 'function') {
        idleId = requestIdleCallback(run, { timeout: idleTimeout });
      } else {
        timeoutId = setTimeout(run, idleTimeout);
      }
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) startLoading();
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (idleId != null) cancelIdleCallback(idleId);
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [shouldLoad, idleTimeout, rootMargin]);

  return shouldLoad;
}
