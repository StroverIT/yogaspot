import './globals.css';
import type { ReactNode } from 'react';
import { GeistMono } from 'geist/font/mono';
import { Nunito, Playfair_Display } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sessionToNavUser } from '@/lib/nav-user';
import { AppProviders } from '@/components/AppProviders';
import SiteLayout from '@/components/SiteLayout';

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
        <AppProviders session={session}>
          <SiteLayout initialUser={initialUser}>{children}</SiteLayout>
        </AppProviders>
      </body>
    </html>
  );
}
