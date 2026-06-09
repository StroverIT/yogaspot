'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, Navigation } from 'lucide-react';
import { toast } from 'sonner';

import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { Studio } from '@/data/mock-data';
import { useFavorites } from '@/hooks/useFavorites';

gsap.registerPlugin(ScrollTrigger);

const STICKY_BAR_HEIGHT_PX = 80;

function hasStudioCoords(studio: Studio) {
  const { lat, lng } = studio;
  if (lat == null || lng == null) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

function googleMapsDirectionsUrl(lat: number, lng: number) {
  const destination = encodeURIComponent(`${lat},${lng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

type StudioDetailMobileCtaProps = {
  studio: Studio;
};

export function StudioDetailMobileCta({ studio }: StudioDetailMobileCtaProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const coords = hasStudioCoords(studio) ? { lat: studio.lat, lng: studio.lng } : null;
  const showMap = studio.teachingMode !== 'online' && coords;
  const fav = isFavorite(studio.id);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const footer = document.querySelector('footer');
    if (!bar || !footer) return;

    const desktopMq = window.matchMedia('(min-width: 1024px)');
    const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const setBarHidden = (hidden: boolean) => {
      gsap.killTweensOf(bar);
      if (reducedMotionMq.matches) {
        gsap.set(bar, {
          y: hidden ? '100%' : 0,
          pointerEvents: hidden ? 'none' : 'auto',
        });
        return;
      }
      gsap.to(bar, {
        y: hidden ? '100%' : 0,
        duration: 0.35,
        ease: hidden ? 'power2.inOut' : 'power2.out',
        pointerEvents: hidden ? 'none' : 'auto',
      });
    };

    let scrollTrigger: ScrollTrigger | undefined;

    const setup = () => {
      scrollTrigger?.kill();
      scrollTrigger = undefined;
      gsap.killTweensOf(bar);

      if (desktopMq.matches) {
        gsap.set(bar, { y: '100%', pointerEvents: 'none' });
        return;
      }

      gsap.set(bar, { y: 0, pointerEvents: 'auto' });

      if (reducedMotionMq.matches) {
        scrollTrigger = ScrollTrigger.create({
          trigger: footer,
          start: `top bottom-=${STICKY_BAR_HEIGHT_PX}`,
          onEnter: () => setBarHidden(true),
          onLeaveBack: () => setBarHidden(false),
        });
        return;
      }

      scrollTrigger = ScrollTrigger.create({
        trigger: footer,
        start: 'top bottom',
        end: `top bottom-=${STICKY_BAR_HEIGHT_PX}`,
        scrub: 0.25,
        onUpdate: (self) => {
          const hidden = self.progress > 0.85;
          bar.style.pointerEvents = hidden ? 'none' : 'auto';
        },
        animation: gsap.fromTo(
          bar,
          { y: 0 },
          { y: '100%', ease: 'none' },
        ),
      });
    };

    setup();
    desktopMq.addEventListener('change', setup);
    reducedMotionMq.addEventListener('change', setup);
    window.addEventListener('resize', setup);

    return () => {
      desktopMq.removeEventListener('change', setup);
      reducedMotionMq.removeEventListener('change', setup);
      window.removeEventListener('resize', setup);
      scrollTrigger?.kill();
      gsap.killTweensOf(bar);
    };
  }, []);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    const added = toggleFavorite(studio.id);
    toast.success(added ? 'Добавено в любими' : 'Премахнато от любими');
  };

  return (
    <>
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(45,42,79,0.12)] backdrop-blur-md lg:hidden"
        aria-hidden={false}
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <Button
            variant={fav ? 'default' : 'secondary'}
            className="h-11 flex-1 rounded-xl text-sm"
            onClick={handleFavoriteClick}
          >
            <Heart className={`mr-2 h-4 w-4 ${fav ? 'fill-current' : ''}`} />
            {fav ? 'В любими' : 'Добави в любими'}
          </Button>
          {showMap ? (
            <Button variant="outline" className="h-11 flex-1 rounded-xl text-sm" asChild>
              <a
                href={googleMapsDirectionsUrl(coords!.lat, coords!.lng)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Виж на картата
              </a>
            </Button>
          ) : null}
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
