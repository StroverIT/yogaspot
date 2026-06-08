'use client';

import dynamic from 'next/dynamic';
import { useState, type ReactNode } from 'react';
import type { Session } from 'next-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';

const CookieConsent = dynamic(
  () =>
    import('@/components/CookieConsent').then((mod) => ({
      default: mod.CookieConsent,
    })),
  { ssr: false },
);

export function AppProviders({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SessionProvider session={session}>
          <AuthProvider>
            {children}
            <CookieConsent />
          </AuthProvider>
        </SessionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
