"use client";

import gsap from "gsap";
import {
  type ReactNode,
  useLayoutEffect,
  useRef,
} from "react";

const DEFAULT_BLOCK = ".gsap-reveal-block";
const DEFAULT_STAGGER = ".gsap-reveal-stagger";

function motionOk(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type GsapRevealScopeProps = {
  children: ReactNode;
  className?: string;
  /**
   * When this changes (e.g. pathname after a route change), animations run again
   * after the previous gsap.context is reverted.
   */
  runKey?: string | number;
  /** Elements to reveal with opacity + slide from left (Hero headline style) */
  blockSelector?: string;
  /** Elements to reveal with opacity + slide up + stagger (Hero stat cards style) */
  staggerSelector?: string;
  /**
   * If no matches for block/stagger selectors, animate direct DOM children once
   * so pages without explicit classes still get a light entrance.
   */
  fallbackToDirectChildren?: boolean;
};

/**
 * Scoped GSAP entrance: main blocks from the left, optional staggered items from below.
 * Matches the Home hero timing (power3.out, stagger, delay between groups).
 */
export function GsapRevealScope({
  children,
  className,
  runKey,
  blockSelector = DEFAULT_BLOCK,
  staggerSelector = DEFAULT_STAGGER,
  fallbackToDirectChildren = true,
}: GsapRevealScopeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root || !motionOk()) return;

    const ctx = gsap.context(() => {
      const blocks = root.querySelectorAll(blockSelector);
      const staggers = root.querySelectorAll(staggerSelector);

      if (blocks.length) {
        gsap.from(blocks, {
          opacity: 0,
          x: -30,
          duration: 0.7,
          ease: "power3.out",
        });
      }

      if (staggers.length) {
        gsap.from(staggers, {
          opacity: 0,
          y: 15,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
          delay: blocks.length ? 0.4 : 0,
        });
      }

      if (
        fallbackToDirectChildren &&
        blocks.length === 0 &&
        staggers.length === 0
      ) {
        const kids = Array.from(root.children);
        if (kids.length) {
          gsap.from(kids, {
            opacity: 0,
            y: 12,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.06,
          });
        }
      }
    }, root);

    return () => ctx.revert();
  }, [runKey, blockSelector, staggerSelector, fallbackToDirectChildren]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
