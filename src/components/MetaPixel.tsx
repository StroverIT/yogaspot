'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  hasAdsConsent,
  type CookieConsentState,
} from '@/lib/cookies/consent';

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

export function MetaPixel() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!metaPixelId) return;

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

  if (!metaPixelId || !allowed) {
    return null;
  }

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${metaPixelId}');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
