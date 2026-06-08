'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  readCookieConsent,
  saveCookieConsent,
  type CookieConsentState,
} from '@/lib/cookies/consent';

export function CookieConsent() {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const preferencesOverlayRef = useRef<HTMLDivElement | null>(null);
  const preferencesPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const consent = readCookieConsent();
    if (consent) {
      setAdsEnabled(Boolean(consent.ads));
      setIsOpen(false);
      setIsReady(true);
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsOpen(true);
      setIsReady(true);
    }, 4000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  const consentPayload = useMemo(
    () => ({
      functional: true as const,
      ads: adsEnabled,
      updatedAt: new Date().toISOString(),
    }),
    [adsEnabled],
  );

  useEffect(() => {
    if (!isReady || !isOpen || !bannerRef.current) {
      return;
    }

    gsap.fromTo(
      bannerRef.current,
      { yPercent: 100, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' },
    );
  }, [isReady, isOpen]);

  useEffect(() => {
    if (!showPreferences || !preferencesOverlayRef.current || !preferencesPanelRef.current) {
      return;
    }

    gsap.set(preferencesOverlayRef.current, { autoAlpha: 0 });
    gsap.set(preferencesPanelRef.current, { y: 24, autoAlpha: 0 });

    const timeline = gsap.timeline();
    timeline.to(preferencesOverlayRef.current, {
      autoAlpha: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
    timeline.to(
      preferencesPanelRef.current,
      { y: 0, autoAlpha: 1, duration: 0.25, ease: 'power3.out' },
      '<',
    );
  }, [showPreferences]);

  if (!isReady || !isOpen) {
    return null;
  }

  const closePreferences = (onComplete?: () => void) => {
    if (!showPreferences || !preferencesOverlayRef.current || !preferencesPanelRef.current) {
      setShowPreferences(false);
      onComplete?.();
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        setShowPreferences(false);
        onComplete?.();
      },
    });
    timeline.to(preferencesPanelRef.current, {
      y: 24,
      autoAlpha: 0,
      duration: 0.2,
      ease: 'power2.in',
    });
    timeline.to(
      preferencesOverlayRef.current,
      { autoAlpha: 0, duration: 0.2, ease: 'power2.in' },
      '<',
    );
  };

  const closeBanner = (nextAds: boolean) => {
    const next = { ...consentPayload, ads: nextAds };
    const finish = () => {
      saveCookieConsent(next);
      setAdsEnabled(nextAds);
      setIsOpen(false);
    };

    if (!bannerRef.current) {
      finish();
      return;
    }

    gsap.to(bannerRef.current, {
      yPercent: 100,
      autoAlpha: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: finish,
    });
  };

  const handleAcceptAll = () => {
    closePreferences(() => closeBanner(true));
  };

  const handleConfirmSelection = () => {
    closePreferences(() => closeBanner(adsEnabled));
  };

  return (
    <>
      <div
        ref={bannerRef}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur"
      >
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm text-foreground">
              Използваме бисквитки, за да подобрим функционалността на сайта и да
              анализираме трафика. Можете да приемете всички или да изберете кои
              категории да разрешите.
            </p>
            <Link
              href="/cookies-policy"
              className="mt-1 inline-flex text-sm text-primary hover:text-primary/80 underline transition-colors"
            >
              Прочетете политиката за бисквитки
            </Link>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Персонализирай
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Приеми всички
            </button>
          </div>
        </div>
      </div>

      {showPreferences ? (
        <div
          ref={preferencesOverlayRef}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
        >
          <div
            ref={preferencesPanelRef}
            className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <h3 className="text-xl font-semibold text-foreground">
              Настройки за бисквитки
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Необходимите бисквитки винаги са активни, защото сайтът не може да
              работи без тях.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Функционални</p>
                    <p className="text-sm text-muted-foreground">
                      Задължителни за нормалната работа на сайта.
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Винаги активни
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">
                      Рекламни и аналитични
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Позволяват персонализирано съдържание и измерване на
                      ефективността.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={adsEnabled}
                    aria-label="Разрешаване на рекламни и аналитични бисквитки"
                    onClick={() => setAdsEnabled((current) => !current)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${adsEnabled ? 'bg-primary' : 'bg-muted'
                      }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${adsEnabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => closePreferences()}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Приеми всички
              </button>
              <button
                type="button"
                onClick={handleConfirmSelection}
                className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                Запази избора
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
