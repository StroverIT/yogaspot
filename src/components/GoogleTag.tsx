'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasAdsConsent,
  type CookieConsentState,
} from '@/lib/cookies/consent';

const googleTagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID?.trim();

export function GoogleTag() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!googleTagId) return;

    const maybeAllow = () => {
      setAllowed(hasAdsConsent());
    };

    maybeAllow();

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentState>).detail;
      if (detail?.ads) {
        setAllowed(true);
      }
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    };
  }, []);

  if (!googleTagId || !allowed) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleTagId}');
        `}
      </Script>
    </>
  );
}
