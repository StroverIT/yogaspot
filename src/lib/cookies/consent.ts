export const COOKIE_CONSENT_KEY = 'zenno_cookie_consent_v1';
export const COOKIE_CONSENT_UPDATED_EVENT = 'zenno-cookie-consent-updated';

export type CookieConsentState = {
  functional: true;
  ads: boolean;
  updatedAt: string;
};

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;

  const rawValue = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as CookieConsentState;
  } catch {
    return null;
  }
}

export function hasAdsConsent(): boolean {
  return Boolean(readCookieConsent()?.ads);
}

export function saveCookieConsent(consent: CookieConsentState): void {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: consent }));
}
