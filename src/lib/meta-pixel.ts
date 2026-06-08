import { hasAdsConsent } from '@/lib/cookies/consent';

const BUSINESS_REGISTRATION_FLAG = 'zenno:business_registration';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function isMetaPixelEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim());
}

export function trackMetaPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !isMetaPixelEnabled() || !hasAdsConsent()) {
    return;
  }

  if (params) {
    window.fbq?.('track', event, params);
    return;
  }

  window.fbq?.('track', event);
}

export function markBusinessRegistrationForMetaPixel() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(BUSINESS_REGISTRATION_FLAG, '1');
  } catch {
    // Ignore storage edge cases (privacy mode, quota, etc.).
  }
}

export function consumeBusinessRegistrationForMetaPixel(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const flagged = window.sessionStorage.getItem(BUSINESS_REGISTRATION_FLAG) === '1';
    if (flagged) {
      window.sessionStorage.removeItem(BUSINESS_REGISTRATION_FLAG);
    }
    return flagged;
  } catch {
    return false;
  }
}
