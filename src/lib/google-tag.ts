const BUSINESS_REGISTRATION_FLAG = 'zenno:business_registration';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function isGoogleTagEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_TAG_ID?.trim());
}

export function trackGoogleTag(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !isGoogleTagEnabled()) {
    return;
  }

  if (params) {
    window.gtag?.('event', event, params);
    return;
  }

  window.gtag?.('event', event);
}

export function markBusinessRegistrationForGoogleTag() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(BUSINESS_REGISTRATION_FLAG, '1');
  } catch {
    // Ignore storage edge cases (privacy mode, quota, etc.).
  }
}

export function consumeBusinessRegistrationForGoogleTag(): boolean {
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
