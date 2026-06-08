import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GeistMono } from 'geist/font/mono';
import { Nunito, Playfair_Display } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sessionToNavUser } from '@/lib/nav-user';
import { AppProviders } from '@/components/AppProviders';
import { GoogleTag } from '@/components/GoogleTag';
import { MetaPixel } from '@/components/MetaPixel';
import SiteLayout from '@/components/SiteLayout';
import { defaultSiteDescription, getSiteUrl, siteName } from '@/lib/site';
import { defaultShareOgImages, defaultShareTwitterImagePaths, facebookAppMetadata } from '@/lib/share-metadata';

const siteUrl = getSiteUrl();

const publicSiteTitle = 'Йога студиа, класове и онлайн записване';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: publicSiteTitle,
  },
  description: defaultSiteDescription,
  applicationName: siteName,
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    siteName,
    url: siteUrl,
    title: publicSiteTitle,
    description: defaultSiteDescription,
    images: defaultShareOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: publicSiteTitle,
    description: defaultSiteDescription,
    images: [...defaultShareTwitterImagePaths],
  },
  icons: {
    icon: [{ url: '/homepage/logo-no-name.png', type: 'image/png' }],
    apple: '/homepage/logo-no-name.png',
  },
  ...facebookAppMetadata(),
};

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-nunito',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const initialUser = sessionToNavUser(session);

  return (
    <html
      lang="en"
      className={`${nunito.variable} ${playfair.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased">
        <GoogleTag />
        <MetaPixel />
        <AppProviders session={session}>
          <SiteLayout initialUser={initialUser}>{children}</SiteLayout>
        </AppProviders>
      </body>
    </html>
  );
}
