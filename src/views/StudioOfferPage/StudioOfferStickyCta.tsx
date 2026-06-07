"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { AddStudioCtaButton } from "@/components/home/add-studio-cta-button";
import { cn } from "@/lib/utils";

type StudioOfferStickyCtaProps = {
  trialDays: number;
  finalSectionId: string;
};

export function StudioOfferStickyCta({ trialDays, finalSectionId }: StudioOfferStickyCtaProps) {
  const [visible, setVisible] = useState(false);
  const [finalInView, setFinalInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById(finalSectionId);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFinalInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [finalSectionId]);

  const show = visible && !finalInView;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-8px_24px_rgba(45,42,79,0.12)] backdrop-blur-md transition-transform duration-300 md:hidden",
        show ? "translate-y-0" : "translate-y-full",
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
