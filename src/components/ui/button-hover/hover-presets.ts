import gsap from "gsap";

import type { HoverAnimRefs } from "./hover-anim-refs";
import { killHoverTweens } from "./hover-anim-refs";
import type { ButtonHoverType } from "./types";

function breathing(el: HTMLElement, refs: HoverAnimRefs): void {
  killHoverTweens(refs);
  const tl = gsap.timeline();
  tl.to(el, {
    scale: 1.04,
    y: -3,
    boxShadow: "0 14px 30px rgba(101, 99, 165, 0.18)",
    duration: 0.4,
    ease: "power2.out",
  }).to(el, {
    scale: 1.028,
    boxShadow: "0 18px 34px rgba(101, 99, 165, 0.14)",
    duration: 1.15,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
  refs.main.current = tl;
}

function softGlowEnergy(el: HTMLElement, refs: HoverAnimRefs): void {
  killHoverTweens(refs);
  refs.main.current = gsap.to(el, {
    scale: 1.03,
    y: -1,
    boxShadow:
      "0 0 25px rgba(180, 150, 255, 0.28), 0 12px 28px rgba(101, 99, 165, 0.16)",
    duration: 0.4,
    ease: "power2.out",
    overwrite: "auto",
  });
}

function waveFill(el: HTMLElement, refs: HoverAnimRefs): void {
  killHoverTweens(refs);
  refs.main.current = gsap.to(el, {
    scale: 1.02,
    y: -2,
    "--button-wave-scale": 1,
    "--button-wave-opacity": 1,
    duration: 0.55,
    ease: "power2.out",
    overwrite: "auto",
  });
}

function floatingLift(el: HTMLElement, refs: HoverAnimRefs): void {
  killHoverTweens(refs);
  refs.main.current = gsap.to(el, {
    y: -4,
    scale: 1.02,
    rotate: 0.5,
    boxShadow: "0 16px 30px rgba(45, 42, 79, 0.12)",
    duration: 0.3,
    ease: "power2.out",
    overwrite: "auto",
  });
}

function petalRipple(el: HTMLElement, refs: HoverAnimRefs): void {
  killHoverTweens(refs);
  refs.main.current = gsap.to(el, {
    y: -2,
    scale: 1.02,
    "--button-ripple-scale": 1,
    "--button-ripple-opacity": 1,
    duration: 0.45,
    ease: "power2.out",
    overwrite: "auto",
  });
}

function energyLineSweep(el: HTMLElement, refs: HoverAnimRefs): void {
  killHoverTweens(refs);
  const tl = gsap.timeline();
  tl.to(el, {
    y: -2,
    scale: 1.02,
    "--button-sweep-opacity": 1,
    duration: 0.2,
    ease: "power2.out",
  }).to(
    el,
    {
      "--button-sweep-x": "220%",
      duration: 0.9,
      ease: "power2.inOut",
      repeat: -1,
      repeatDelay: 0.18,
    },
    0
  );
  refs.main.current = tl;
}

function zenBlurFocus(el: HTMLElement, refs: HoverAnimRefs): void {
  killHoverTweens(refs);
  refs.main.current = gsap.to(el, {
    y: -1,
    scale: 1.015,
    filter: "blur(0px) brightness(1.03)",
    duration: 0.3,
    ease: "power2.out",
    overwrite: "auto",
  });
}

function textFloat(el: HTMLElement, icon: Element | null, refs: HoverAnimRefs): void {
  killHoverTweens(refs);
  refs.main.current = gsap.to(el, {
    y: -1,
    letterSpacing: "0.03em",
    duration: 0.28,
    ease: "power2.out",
    overwrite: "auto",
  });
  if (icon) {
    refs.icon.current = gsap.to(icon, {
      x: 2,
      y: -2,
      duration: 0.28,
      ease: "power2.out",
      overwrite: "auto",
    });
  }
}

function gradientShift(el: HTMLElement, refs: HoverAnimRefs): void {
  killHoverTweens(refs);
  const tl = gsap.timeline();
  tl.to(el, {
    y: -2,
    scale: 1.02,
    "--button-gradient-opacity": 1,
    duration: 0.3,
    ease: "power2.out",
  }).to(
    el,
    {
      "--button-gradient-x": "100%",
      duration: 1.4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    },
    0
  );
  refs.main.current = tl;
}

function organicBorderDraw(el: HTMLElement, refs: HoverAnimRefs): void {
  killHoverTweens(refs);
  const tl = gsap.timeline();
  tl.to(el, {
    y: -1,
    scale: 1.01,
    "--button-border-opacity": 0.55,
    duration: 0.2,
    ease: "power2.out",
  })
    .to(el, {
      "--button-border-top": "100%",
      duration: 0.16,
      ease: "power2.out",
    })
    .to(
      el,
      {
        "--button-border-right": "100%",
        duration: 0.12,
        ease: "power2.out",
      },
      "-=0.03"
    )
    .to(
      el,
      {
        "--button-border-bottom": "100%",
        duration: 0.16,
        ease: "power2.out",
      },
      "-=0.02"
    )
    .to(
      el,
      {
        "--button-border-left": "100%",
        duration: 0.12,
        ease: "power2.out",
      },
      "-=0.03"
    );
  refs.main.current = tl;
}

function nudgeIcon(
  icon: Element,
  hoverType: ButtonHoverType,
  refs: HoverAnimRefs
): void {
  refs.icon.current = gsap.to(icon, {
    x: hoverType === "floatingLift" ? 1 : 3,
    duration: 0.22,
    ease: "power2.out",
    overwrite: "auto",
  });
}

export function runHoverPreset(
  el: HTMLElement,
  icon: Element | null,
  hoverType: ButtonHoverType,
  refs: HoverAnimRefs
): void {
  const isIconOnly = el.dataset.iconOnly === "true";

  switch (hoverType) {
    case "breathing":
      breathing(el, refs);
      break;
    case "softGlowEnergy":
      softGlowEnergy(el, refs);
      break;
    case "waveFill":
      waveFill(el, refs);
      break;
    case "floatingLift":
      floatingLift(el, refs);
      break;
    case "petalRipple":
      petalRipple(el, refs);
      break;
    case "energyLineSweep":
      energyLineSweep(el, refs);
      break;
    case "zenBlurFocus":
      zenBlurFocus(el, refs);
      break;
    case "textFloat":
      textFloat(el, icon, refs);
      break;
    case "gradientShift":
      gradientShift(el, refs);
      break;
    case "organicBorderDraw":
      organicBorderDraw(el, refs);
      break;
  }

  if (icon && hoverType !== "textFloat" && !isIconOnly) {
    nudgeIcon(icon, hoverType, refs);
  }
}
