import type { ReactNode } from 'react';
import { getBusinessOffer, getSubscriptionSummaryForOwnerUserId } from '@/lib/business-platform-billing';
import type { NavUser } from '@/lib/nav-user';
import { SiteLayoutClient } from './SiteLayoutClient';

export default async function SiteLayout({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: NavUser | null;
}) {
  const offer = await getBusinessOffer();
  const siteOfferMessage =
    offer.slotsRemaining > 0
      ? `Остават ${offer.slotsRemaining} безплатни места за студиа (1 месец пробен период, след това ${offer.monthlyPriceEur} €/месец).`
      : `Нови студиа: ${offer.monthlyPriceEur} €/месец (без пробен период).`;

  const initialPlatformBilling =
    initialUser?.role === 'business' && initialUser.id
      ? await getSubscriptionSummaryForOwnerUserId(initialUser.id)
      : null;

  return (
    <SiteLayoutClient
      initialUser={initialUser}
      siteOfferMessage={siteOfferMessage}
      initialPlatformBilling={initialPlatformBilling}
    >
      {children}
    </SiteLayoutClient>
  );
}
