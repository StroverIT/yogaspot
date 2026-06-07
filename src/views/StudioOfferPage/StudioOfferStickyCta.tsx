"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { AddStudioCtaButton } from "@/components/home/add-studio-cta-button";
import { cn } from "@/lib/utils";

const STICKY_BAR_HEIGHT_PX = 72;
const SCROLL_SHOW_OFFSET_PX = 400;

type StudioOfferStickyCtaProps = {
  trialDays: number;
  finalSectionId: string;
  onVisibleChange?: (visible: boolean) => void;
};

export function StudioOfferStickyCta({
  trialDays,
  finalSectionId,
  onVisibleChange,
}: StudioOfferStickyCtaProps) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [finalSectionReached, setFinalSectionReached] = useState(false);

  useEffect(() => {
    const finalSection = document.getElementById(finalSectionId);
    if (!finalSection) return;

    const update = () => {
      setScrolledPastHero(window.scrollY > SCROLL_SHOW_OFFSET_PX);

      const rect = finalSection.getBoundingClientRect();
      setFinalSectionReached(rect.top <= window.innerHeight - STICKY_BAR_HEIGHT_PX);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [finalSectionId]);

  const show = scrolledPastHero && !finalSectionReached;

  useEffect(() => {
    onVisibleChange?.(show);
  }, [show, onVisibleChange]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-8px_24px_rgba(45,42,79,0.12)] backdrop-blur-md transition-transform duration-300 md:hidden",
        show ? "translate-y-0" : "translate-y-full pointer-events-none",
      )}
      aria-hidden={!show}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">
          <span className="font-semibold text-foreground">Безплатен пробен период</span>
          <span className="block">{trialDays} дни · без ангажимент</span>
        </p>
        <AddStudioCtaButton next="/dashboard" size="sm" className="shrink-0 rounded-xl text-sm">
          Започнете <ArrowRight className="ml-1 h-4 w-4" />
        </AddStudioCtaButton>
      </div>
    </div>
  );
}

export const STUDIO_OFFER_STICKY_OFFSET_CLASS = "pb-[4.5rem] md:pb-0";
