"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth, type User } from "@/contexts/AuthContext";
import type { NavUser } from "@/lib/nav-user";
import { Button } from "@/components/ui/button";
import { Heart, User as UserIcon, LogOut } from "lucide-react";
import Hamburger from "hamburger-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import AuthModal from "@/components/AuthModal";

const LOGO_SCROLL_THRESHOLD_PX = 8;
const LOGO_LARGE = { width: "7rem", height: "7rem" }; // h-28 w-28
const LOGO_COMPACT = { width: "7rem", height: "6rem" }; // w-28 h-24
const DESKTOP_NAV_LINK_CLASS =
  "relative text-foreground/70 transition-all duration-300 ease-out hover:text-primary hover:-translate-y-0.5 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const ICON_BUTTON_CLASS =
  "border border-transparent bg-background/70 text-foreground/80 backdrop-blur-sm transition-all duration-300 ease-out hover:border-primary/15 hover:bg-background hover:text-primary hover:shadow-md hover:shadow-primary/10 active:translate-y-0";
const HEART_ICON_BUTTON_CLASS =
  "hover:[&_svg]:rotate-[12deg] hover:[&_svg]:scale-125";
const PROFILE_ICON_BUTTON_CLASS =
  "hover:[&_svg]:scale-110 hover:[&_svg]:-translate-y-0.5";
const LOGOUT_ICON_BUTTON_CLASS =
  "hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 hover:text-destructive hover:before:bg-destructive/10 hover:border-destructive/15 hover:shadow-destructive/10";
const AUTH_GHOST_BUTTON_CLASS =
  "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary active:translate-y-0";
const AUTH_PRIMARY_BUTTON_CLASS =
  "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25 active:translate-y-0";
const MOBILE_ITEM_CLASS =
  "block w-full rounded-md px-3 py-2 text-left transition-all duration-300 ease-out hover:bg-primary/10 hover:text-primary hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

function navUserToUser(n: NavUser): User {
  return {
    id: n.id,
    name: n.name,
    email: n.email,
    role: n.role,
    favorites: [],
  };
}

type NavigationProps = { initialUser?: NavUser | null };

const Navigation: React.FC<NavigationProps> = ({ initialUser = null }) => {
  const { status } = useSession();
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const supplementUser =
    status === "loading" && initialUser ? navUserToUser(initialUser) : null;
  const user = authUser ?? supplementUser;
  const isAuthenticatedNav =
    status === "loading" ? !!initialUser : isAuthenticated;
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  /** Keeps the panel mounted until the GSAP close timeline finishes. */
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileMenuTlRef = useRef<gsap.core.Timeline | null>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const sloganWrapRef = useRef<HTMLDivElement>(null);
  const sloganInnerRef = useRef<HTMLSpanElement>(null);
  const logoModeRef = useRef<"large" | "compact" | null>(null);

  useLayoutEffect(() => {
    const el = logoWrapRef.current;
    const sloganWrap = sloganWrapRef.current;
    if (!el) return;

    const mdQuery = window.matchMedia("(min-width: 768px)");
    const isCompact = () => window.scrollY > LOGO_SCROLL_THRESHOLD_PX;

    const measureSloganWidth = () => sloganInnerRef.current?.scrollWidth ?? 0;

    const syncSlogan = (animate: boolean, compact: boolean) => {
      if (!sloganWrap || !mdQuery.matches) return;
      const fullW = measureSloganWidth();
      if (fullW <= 0) return;

      if (!animate) {
        gsap.set(sloganWrap, { width: compact ? 0 : fullW, overflow: "hidden" });
        return;
      }
      gsap.to(sloganWrap, {
        width: compact ? 0 : fullW,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const applyDesktop = (animate: boolean) => {
      const compact = isCompact();
      const mode: "large" | "compact" = compact ? "compact" : "large";
      const target = compact ? LOGO_COMPACT : LOGO_LARGE;

      if (animate && logoModeRef.current === mode) return;
      if (!animate) {
        gsap.set(el, target);
        logoModeRef.current = mode;
        syncSlogan(false, compact);
        return;
      }
      logoModeRef.current = mode;
      gsap.to(el, {
        ...target,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
      syncSlogan(true, compact);
    };

    const onScroll = () => {
      requestAnimationFrame(() => {
        if (!mdQuery.matches) return;
        applyDesktop(true);
      });
    };

    const onMdChange = () => {
      if (!mdQuery.matches) {
        gsap.killTweensOf([el, sloganWrap].filter(Boolean));
        gsap.set(el, { clearProps: "width,height" });
        if (sloganWrap) {
          gsap.set(sloganWrap, { clearProps: "width" });
        }
        logoModeRef.current = null;
        return;
      }
      logoModeRef.current = null;
      applyDesktop(false);
    };

    if (mdQuery.matches) {
      applyDesktop(false);
    } else {
      gsap.set(el, { clearProps: "width,height" });
      logoModeRef.current = null;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    mdQuery.addEventListener("change", onMdChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      mdQuery.removeEventListener("change", onMdChange);
      gsap.killTweensOf([el, sloganWrap].filter(Boolean));
    };
  }, []);

  const setMobileMenuOpen = useCallback((next: boolean) => {
    if (next) setMobileMenuMounted(true);
    setMobileOpen(next);
  }, []);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [setMobileMenuOpen]);

  useLayoutEffect(() => {
    if (!mobileMenuMounted) return;
    const el = mobilePanelRef.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = el.querySelectorAll<HTMLElement>("[data-mobile-nav-item]");

    mobileMenuTlRef.current?.kill();

    if (mobileOpen) {
      if (reduced) {
        gsap.set(el, { clearProps: "clipPath" });
        gsap.set(items, { clearProps: "opacity,transform" });
        return;
      }
      gsap.set(el, { clipPath: "inset(0 0 100% 0)" });
      gsap.set(items, { opacity: 0, y: 14 });
      const tl = gsap.timeline();
      tl.to(el, {
        clipPath: "inset(0 0 0% 0)",
        duration: 0.5,
        ease: "power4.out",
      }).to(
        items,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.065,
          ease: "power2.out",
        },
        "-=0.32"
      );
      mobileMenuTlRef.current = tl;
      return () => {
        mobileMenuTlRef.current?.kill();
      };
    }

    if (reduced) {
      setMobileMenuMounted(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => setMobileMenuMounted(false),
    });
    tl.to(items, {
      opacity: 0,
      y: -10,
      duration: 0.22,
      stagger: { each: 0.038, from: "end" },
      ease: "power2.in",
    }).to(
      el,
      {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.38,
        ease: "power3.in",
      },
      "-=0.08"
    );
    mobileMenuTlRef.current = tl;

    return () => {
      mobileMenuTlRef.current?.kill();
    };
  }, [mobileOpen, mobileMenuMounted]);

  const handleFavoritesClick = (e: React.MouseEvent) => {
    if (!isAuthenticatedNav) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md py-2">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">

          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 md:gap-3"
            aria-label="Zenno — начало. По-лесният път към йога"
          >
            <div
              ref={logoWrapRef}
              className="relative shrink-0 h-28 w-28"
            >
              <Image
                src="/homepage/logo.png"
                alt="Zenno"
                fill
                className="object-contain p-1"
                sizes="(max-width: 768px) 48px, 96px"
                priority
              />
            </div>
            <div
              ref={sloganWrapRef}
              className="hidden min-w-0 overflow-hidden md:block -ml-4"
            >
              <span
                ref={sloganInnerRef}
                className="block whitespace-nowrap font-display font-semibold tracking-tight text-foreground md:text-xl"
              >
                По-лесният път към йога
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-body text-sm font-medium">
            <Link
              href="/discover"
              className={DESKTOP_NAV_LINK_CLASS}
            >
              Открий студио
            </Link>
            {isAuthenticatedNav && user?.role === 'business' && (
              <Link
                href="/dashboard"
                className={DESKTOP_NAV_LINK_CLASS}
              >
                Табло
              </Link>
            )}
            {isAuthenticatedNav && user?.role === 'admin' && (
              <Link
                href="/admin"
                className={DESKTOP_NAV_LINK_CLASS}
              >
                Админ панел
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/favorites" onClick={handleFavoritesClick}>
              <Button
                variant="ghost"
                size="icon"
                hoverType="petalRipple"
                className={`${ICON_BUTTON_CLASS} ${HEART_ICON_BUTTON_CLASS}`}
              >
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            {isAuthenticatedNav ? (
              <>
                <Link href="/profile/history">
                  <Button
                    variant="ghost"
                    size="icon"
                    hoverType="softGlowEnergy"
                    className={`${ICON_BUTTON_CLASS} ${PROFILE_ICON_BUTTON_CLASS}`}
                  >
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  hoverType="energyLineSweep"
                  className={`${ICON_BUTTON_CLASS} ${LOGOUT_ICON_BUTTON_CLASS}`}
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className={AUTH_GHOST_BUTTON_CLASS}
                  onClick={() => router.push("/auth")}
                >
                  Вход
                </Button>
                <Button className={AUTH_PRIMARY_BUTTON_CLASS} onClick={() => router.push("/auth?type=register")}>
                  Регистрация
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden text-foreground [&_.hamburger-react]:rounded-md [&_.hamburger-react]:hover:bg-accent [&_.hamburger-react]:hover:text-accent-foreground">
            <Hamburger
              toggled={mobileOpen}
              toggle={setMobileMenuOpen}
              size={22}
              label={mobileOpen ? "Затвори менюто" : "Отвори менюто"}
              color="currentColor"
            />
          </div>
        </div>

        {mobileMenuMounted && (
          <div
            ref={mobilePanelRef}
            className="md:hidden overflow-hidden border-t border-border bg-background font-body will-change-[clip-path]"
            aria-hidden={!mobileOpen}
            inert={!mobileOpen}
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/discover"
                className={MOBILE_ITEM_CLASS}
                data-mobile-nav-item
                onClick={closeMobileMenu}
              >
                Открий студио
              </Link>
              <button
                type="button"
                className={MOBILE_ITEM_CLASS}
                data-mobile-nav-item
                onClick={() => {
                  closeMobileMenu();
                  if (!isAuthenticatedNav) {
                    setAuthModalOpen(true);
                  } else {
                    router.push("/favorites");
                  }
                }}
              >
                Любими
              </button>
              {isAuthenticatedNav ? (
                <>
                  <Link
                    href="/profile/history"
                    className={MOBILE_ITEM_CLASS}
                    data-mobile-nav-item
                    onClick={closeMobileMenu}
                  >
                    Профил
                  </Link>
                  {user?.role === "business" && (
                    <Link
                      href="/dashboard"
                      className={MOBILE_ITEM_CLASS}
                      data-mobile-nav-item
                      onClick={closeMobileMenu}
                    >
                      Табло
                    </Link>
                  )}
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className={MOBILE_ITEM_CLASS}
                      data-mobile-nav-item
                      onClick={closeMobileMenu}
                    >
                      Админ панел
                    </Link>
                  )}
                  <button
                    type="button"
                    className={`${MOBILE_ITEM_CLASS} text-destructive hover:bg-destructive/10 hover:text-destructive`}
                    data-mobile-nav-item
                    onClick={() => {
                      logout();
                      router.push("/");
                      closeMobileMenu();
                    }}
                  >
                    Изход
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className={MOBILE_ITEM_CLASS}
                    data-mobile-nav-item
                    onClick={closeMobileMenu}
                  >
                    Вход
                  </Link>
                  <Link
                    href="/auth"
                    className={`${MOBILE_ITEM_CLASS} font-semibold text-primary`}
                    data-mobile-nav-item
                    onClick={closeMobileMenu}
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
};

export default Navigation;
