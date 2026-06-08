"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

function motionOk(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** ScrollTrigger at "top 82%" may never fire for the last section on tall viewports. */
function finishUnreachableSectionTriggers(timelines: gsap.core.Timeline[]) {
  const maxScroll = ScrollTrigger.maxScroll(window);
  const scroll = window.scrollY;

  for (const tl of timelines) {
    if (tl.progress() > 0) continue;

    const st = tl.scrollTrigger;
    if (!st) continue;

    const unreachable = st.start > maxScroll;
    const passed = scroll >= st.start;
    if (!unreachable && !passed) continue;

    const trigger = st.trigger;
    if (trigger instanceof HTMLElement) {
      const { top, bottom } = trigger.getBoundingClientRect();
      if (top >= window.innerHeight || bottom <= 0) continue;
    }

    tl.progress(1);
  }
}

export function StudioOfferScrollScope({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !motionOk()) return;

    const sectionTimelines: gsap.core.Timeline[] = [];

    const ctx = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>("[data-offer-hero]");
      if (hero) {
        const introItems = hero.querySelectorAll<HTMLElement>(".offer-hero-intro .offer-animate");
        const stats = hero.querySelectorAll<HTMLElement>(".offer-hero-stat");
        const preview = hero.querySelector<HTMLElement>(".offer-hero-preview");

        gsap.set([...introItems, ...stats, preview].filter(Boolean), {
          opacity: 0,
          y: 24,
        });
        if (preview) gsap.set(preview, { x: 32, y: 0 });

        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (introItems.length) {
          heroTl.to(introItems, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
          });
        }
        if (stats.length) {
          heroTl.to(
            stats,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
            },
            introItems.length ? "-=0.25" : 0,
          );
        }
        if (preview) {
          heroTl.to(
            preview,
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.75,
            },
            stats.length ? "-=0.35" : introItems.length ? "-=0.2" : 0,
          );
        }
      }

      root.querySelectorAll<HTMLElement>("[data-offer-section]").forEach((section) => {
        const header = section.querySelector<HTMLElement>(".offer-section-head");
        const items = section.querySelectorAll<HTMLElement>(".offer-animate");

        const targets = [...(header ? [header] : []), ...items];
        if (!targets.length) return;

        gsap.set(targets, { opacity: 0, y: 28 });

        const sectionTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        if (header) {
          sectionTl.to(header, { opacity: 1, y: 0, duration: 0.55 });
        }

        if (items.length) {
          sectionTl.to(
            items,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.1,
            },
            header ? "-=0.2" : 0,
          );
        }

        sectionTimelines.push(sectionTl);
      });

    }, root);

    ScrollTrigger.refresh();
    finishUnreachableSectionTriggers(sectionTimelines);

    const syncSectionVisibility = () => finishUnreachableSectionTriggers(sectionTimelines);
    ScrollTrigger.addEventListener("refresh", syncSectionVisibility);
    window.addEventListener("scroll", syncSectionVisibility, { passive: true });

    return () => {
      ScrollTrigger.removeEventListener("refresh", syncSectionVisibility);
      window.removeEventListener("scroll", syncSectionVisibility);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
