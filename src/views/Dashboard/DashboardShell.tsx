'use client';

import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { getActiveSection } from './dashboardTypes';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardMobileNav } from './components/DashboardMobileNav';
import { DashboardOnboardingModal } from './components/modals/DashboardOnboardingModal';
import { deriveDashboardMetrics } from './dashboardMockData';
import { useDashboardWorkspace } from '@/hooks/useDashboardWorkspace';

type SessionUserExtras = {
  dashboardOnboardingDismissedAt?: string | null;
};

export function DashboardShell({
  children,
  serverDisplayName,
}: {
  children: React.ReactNode;
  /** From server layout; avoids empty label before client session hydrates. */
  serverDisplayName?: string;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { status, data: session, update } = useSession();
  const [onboardingConfirming, setOnboardingConfirming] = useState(false);
  const ws = useDashboardWorkspace();
  const { revenue } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);
  const activeSection = getActiveSection(pathname);
  const displayName = user?.name?.trim() || serverDisplayName || 'Бизнес потребител';

  const sessionUser = session?.user as SessionUserExtras | undefined;
  const showOnboarding =
    status === 'authenticated' &&
    user?.role === 'business' &&
    !sessionUser?.dashboardOnboardingDismissedAt;

  const dismissOnboarding = useCallback(async () => {
    setOnboardingConfirming(true);
    try {
      const res = await fetch('/api/user/dashboard-onboarding', { method: 'POST' });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(body.error ?? 'Неуспешно записване. Опитайте отново.');
        return;
      }
      await update();
    } finally {
      setOnboardingConfirming(false);
    }
  }, [update]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <DashboardSidebar displayName={displayName} activeSection={activeSection} revenue={revenue} />

      <DashboardMobileNav activeSection={activeSection} />

      <main className="flex-1 overflow-y-auto bg-linear-to-br from-background via-card/40 to-muted/15 p-6 pb-24 lg:p-8 lg:pb-8">
        {children}
      </main>

      <DashboardOnboardingModal open={showOnboarding} confirming={onboardingConfirming} onConfirm={dismissOnboarding} />
    </div>
  );
}
