"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

type GsapHamburgerProps = {
  toggled: boolean;
  toggle: (next: boolean) => void;
  size?: number;
  label?: string;
  color?: string;
};

const HIT_SIZE_PX = 48;
const BAR_HEIGHT_PX = 2;

export function GsapHamburger({
  toggled,
  toggle,
  size = 24,
  label,
  color = "currentColor",
}: GsapHamburgerProps) {
  const topRef = useRef<HTMLSpanElement>(null);
  const midRef = useRef<HTMLSpanElement>(null);
  const botRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isFirstRender = useRef(true);

  const barOffset = size * 0.36;

  useLayoutEffect(() => {
    const top = topRef.current;
    const mid = midRef.current;
    const bot = botRef.current;
    if (!top || !mid || !bot) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    tlRef.current?.kill();

    const closed = {
      top: { rotation: 0, y: -barOffset, opacity: 1, scaleX: 1 },
      mid: { opacity: 1, scaleX: 1 },
      bot: { rotation: 0, y: barOffset, opacity: 1, scaleX: 1 },
    };
    const open = {
      top: { rotation: 45, y: 0, opacity: 1, scaleX: 1 },
      mid: { opacity: 0, scaleX: 0 },
      bot: { rotation: -45, y: 0, opacity: 1, scaleX: 1 },
    };
    const target = toggled ? open : closed;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      gsap.set(top, target.top);
      gsap.set(mid, target.mid);
      gsap.set(bot, target.bot);
      return;
    }

    if (reduced) {
      gsap.set(top, target.top);
      gsap.set(mid, target.mid);
      gsap.set(bot, target.bot);
      return;
    }

    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

    if (toggled) {
      tl.to(mid, { opacity: 0, scaleX: 0, duration: 0.18, ease: "power2.in" })
        .to(
          top,
          { rotation: 45, y: 0, duration: 0.38, ease: "power3.out" },
          "<0.04"
        )
        .to(
          bot,
          { rotation: -45, y: 0, duration: 0.38, ease: "power3.out" },
          "<"
        );
    } else {
      tl.to(top, { rotation: 0, y: -barOffset, duration: 0.38, ease: "power3.out" })
        .to(
          bot,
          { rotation: 0, y: barOffset, duration: 0.38, ease: "power3.out" },
          "<"
        )
        .to(
          mid,
          { opacity: 1, scaleX: 1, duration: 0.22, ease: "power2.out" },
          "-=0.18"
        );
    }

    tlRef.current = tl;

    return () => {
      tlRef.current?.kill();
    };
  }, [toggled, barOffset]);

  const barStyle = {
    position: "absolute" as const,
    left: 0,
    top: "50%",
    width: size,
    height: BAR_HEIGHT_PX,
    marginTop: -BAR_HEIGHT_PX / 2,
    borderRadius: BAR_HEIGHT_PX,
    backgroundColor: color,
    transformOrigin: "center center",
  };

  return (
    <div
      className="hamburger-react"
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-expanded={toggled}
      onClick={() => toggle(!toggled)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle(!toggled);
        }
      }}
      style={{
        cursor: "pointer",
        height: HIT_SIZE_PX,
        width: HIT_SIZE_PX,
        position: "relative",
        userSelect: "none",
        outline: "none",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size, height: size }}
      >
        <span ref={topRef} style={barStyle} />
        <span ref={midRef} style={barStyle} />
        <span ref={botRef} style={barStyle} />
      </div>
    </div>
  );
}
