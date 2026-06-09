import type { Metadata } from 'next';

/**
 * Default Open Graph image for link previews (Facebook, Instagram, Viber, etc.).
 * 1920×1080 - wide ratio reads well in messenger and social crawlers; avoid square logos as the only preview image.
 */
export const defaultShareOgImage = {
  url: '/homepage/hero-yoga.jpg',
  width: 1920,
  height: 1080,
  type: 'image/jpeg',
  alt: 'Йога практика - открий студиа и запази клас онлайн',
} as const;

export const defaultShareOgImages = [defaultShareOgImage];

export const defaultShareTwitterImagePaths = ['/homepage/hero-yoga.jpg'] as const;

/** Optional `fb:app_id` for Facebook insights / debugging when an app exists. */
export function facebookAppMetadata(): Pick<Metadata, 'facebook'> | Record<string, never> {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();
  if (!appId) return {};
  return { facebook: { appId } };
}

/** Crawlers (Facebook / Viber) expect absolute image URLs when the stored value is a site-relative path. */
export function absoluteOgImageUrl(url: string, siteOrigin: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = siteOrigin.replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}
