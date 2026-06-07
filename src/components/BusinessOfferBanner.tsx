import { getBusinessOffer } from '@/lib/business-platform-billing';

export default async function BusinessOfferBanner() {
  const offer = await getBusinessOffer();

  const message =
    offer.slotsRemaining > 0
      ? `Остават ${offer.slotsRemaining} безплатни места за студиа (1 месец пробен период, след това ${offer.monthlyPriceEur} €/месец).`
      : `Нови студиа: ${offer.monthlyPriceEur} €/месец (без пробен период).`;

  return (
    <div
      className="border-b border-primary/15 bg-primary/5 px-4 py-2 text-center text-sm text-foreground/80"
      role="status"
    >
      {message}
    </div>
  );
}
