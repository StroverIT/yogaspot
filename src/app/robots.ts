import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/dashboard', '/profile', '/auth', '/favorites', '/book/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
