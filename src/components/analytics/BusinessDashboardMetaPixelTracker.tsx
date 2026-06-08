'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { trackGoogleTag } from '@/lib/google-tag';
import { consumeBusinessRegistrationForMetaPixel, trackMetaPixel } from '@/lib/meta-pixel';

export function BusinessDashboardMetaPixelTracker() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'business') {
      return;
    }

    trackMetaPixel('PageView');
    trackGoogleTag('page_view', { page_title: 'business_dashboard' });

    const registeredFromQuery = searchParams?.get('registered') === '1';
    const registeredFromSession = consumeBusinessRegistrationForMetaPixel();

    if (registeredFromQuery || registeredFromSession) {
      trackMetaPixel('CompleteRegistration', { content_name: 'business_dashboard' });
      trackGoogleTag('sign_up', { method: 'email', content_name: 'business_dashboard' });
    }

    if (registeredFromQuery) {
      const url = new URL(window.location.href);
      url.searchParams.delete('registered');
      router.replace(`${url.pathname}${url.search}${url.hash}`);
    }
  }, [user?.role, searchParams, router]);

  return null;
}
