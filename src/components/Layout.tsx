"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, User, LogOut, Menu, X, Facebook, Instagram } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import AuthModal from "@/components/AuthModal";

/** Replace with your brand pages when ready. */
const FOOTER_SOCIAL = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
} as const;

const LOGO_SCROLL_THRESHOLD_PX = 8;
const LOGO_LARGE = { width: "7rem", height: "7rem" }; // h-28 w-28
const LOGO_COMPACT = { width: "7rem", height: "6rem" }; // w-28 h-24

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
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

  const handleFavoritesClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md py-2">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">

          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 md:gap-3"
            aria-label="Zenno — начало. По-лесният път към йога"
          >
            <div
              ref={logoWrapRef}
              className="relative h-12 w-12 shrink-0 md:h-28 md:w-28"
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
              className="text-foreground/70 hover:text-primary transition-colors"
            >
              Открий студио
            </Link>
            {isAuthenticated && user?.role === 'business' && (
              <Link
                href="/dashboard"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                Табло
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                Админ панел
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/favorites" onClick={handleFavoritesClick}>
              <Button variant="ghost" size="icon"><Heart className="h-5 w-5" /></Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
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
                <Button variant="ghost" onClick={() => router.push("/auth")}>Вход</Button>
                <Button onClick={() => router.push("/auth")}>Регистрация</Button>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3 font-body">
            <Link href="/discover" className="block py-2" onClick={() => setMobileOpen(false)}>Открий студио</Link>
            <button
              className="block py-2 w-full text-left"
              onClick={() => {
                setMobileOpen(false);
                if (!isAuthenticated) { setAuthModalOpen(true); } else { router.push("/favorites"); }
              }}
            >
              Любими
            </button>
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="block py-2" onClick={() => setMobileOpen(false)}>Профил</Link>
                {user?.role === 'business' && <Link href="/dashboard" className="block py-2" onClick={() => setMobileOpen(false)}>Табло</Link>}
                {user?.role === 'admin' && <Link href="/admin" className="block py-2" onClick={() => setMobileOpen(false)}>Админ панел</Link>}
                <button className="block py-2 text-destructive" onClick={() => { logout(); router.push("/"); setMobileOpen(false); }}>Изход</button>
              </>
            ) : (
              <>
                <Link href="/auth" className="block py-2" onClick={() => setMobileOpen(false)}>Вход</Link>
                <Link href="/auth" className="block py-2 font-semibold text-primary" onClick={() => setMobileOpen(false)}>Регистрация</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 min-h-0 overflow-x-clip">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-black text-neutral-400">
        <div className="container mx-auto px-4 py-14 md:py-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12 text-sm leading-relaxed">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 shrink-0">
                <Image
                  src="/homepage/logo.png"
                  alt=""
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <span className="font-display text-xl font-semibold tracking-tight text-white">
                Zenno
              </span>
            </div>
            <p className="max-w-sm">
              Zenno е marketplace за йога, който свързва практикуващи с най-добрите студиа. Открий,
              избери и практикувай.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href={FOOTER_SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-colors hover:border-white/35 hover:bg-white/10 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.75} />
              </a>
              <a
                href={FOOTER_SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-colors hover:border-white/35 hover:bg-white/10 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.75} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-display text-base font-semibold text-white mb-4 tracking-tight">
              Бързи връзки
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/discover?nearMe=true"
                  className="hover:text-white transition-colors"
                >
                  Студия наблизо
                </Link>
              </li>
              <li>
                <Link
                  href="/discover?ratingSort=desc"
                  className="hover:text-white transition-colors"
                >
                  Топ оценени
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  Как работи
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base font-semibold text-white mb-4 tracking-tight">
              За студиа
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/auth" className="hover:text-white transition-colors">
                  Добави студио
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@Zenno.bg?subject=%D0%97%D0%B0%D0%BF%D0%B8%D1%82%D0%B2%D0%B0%D0%BD%D0%B5%20%D0%B7%D0%B0%20%D1%86%D0%B5%D0%BD%D0%BE%D1%80%D0%B0%D0%B7%D0%BF%D0%B8%D1%81"
                  className="hover:text-white transition-colors"
                >
                  Ценоразпис
                </a>
              </li>
              <li>
                <a href="mailto:info@Zenno.bg" className="hover:text-white transition-colors">
                  Контакт
                </a>
              </li>
            </ul>
            <p className="mt-6 text-xs text-neutral-500">
              <a href="mailto:info@Zenno.bg" className="hover:text-neutral-300 transition-colors">
                info@Zenno.bg
              </a>
              <span className="mx-2 text-white/20">·</span>
              <a href="tel:+35920000000" className="hover:text-neutral-300 transition-colors">
                +359 2 000 0000
              </a>
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-6 text-center text-xs text-neutral-500">
            © 2026 Zenno. Всички права запазени.
          </div>
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={() => router.push("/favorites")}
      />
    </div>
  );
};

export default Layout;
