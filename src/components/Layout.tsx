"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, User, LogOut, Menu, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import AuthModal from "@/components/AuthModal";

const LOGO_SCROLL_THRESHOLD_PX = 8;
const LOGO_LARGE = { width: "7rem", height: "7rem" }; // h-28 w-28
const LOGO_COMPACT = { width: "7rem", height: "6rem" }; // w-28 h-24

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const logoModeRef = useRef<"large" | "compact" | null>(null);

  useLayoutEffect(() => {
    const el = logoWrapRef.current;
    if (!el) return;

    const mdQuery = window.matchMedia("(min-width: 768px)");
    const isCompact = () => window.scrollY > LOGO_SCROLL_THRESHOLD_PX;

    const applyDesktop = (animate: boolean) => {
      const compact = isCompact();
      const mode: "large" | "compact" = compact ? "compact" : "large";
      const target = compact ? LOGO_COMPACT : LOGO_LARGE;

      if (animate && logoModeRef.current === mode) return;
      if (!animate) {
        gsap.set(el, target);
        logoModeRef.current = mode;
        return;
      }
      logoModeRef.current = mode;
      gsap.to(el, {
        ...target,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onScroll = () => {
      requestAnimationFrame(() => {
        if (!mdQuery.matches) return;
        applyDesktop(true);
      });
    };

    const onMdChange = () => {
      if (!mdQuery.matches) {
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: "width,height" });
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
      gsap.killTweensOf(el);
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
            className="flex items-center"
            aria-label="Zenno — начало"
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

      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-muted-foreground">
          <div>
            <div className="flex items-center mb-3">
              <div className="relative h-28 w-28">
                <Image
                  src="/homepage/logo.png"
                  alt="Zenno"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 80px, 96px"
                />
              </div>
            </div>
            <p>Твоят портал към йога студиа в България. Открий, запиши се и практикувай.</p>
          </div>
          <div>
            <h4 className="font-display text-lg text-foreground mb-3">Навигация</h4>
            <ul className="space-y-2">
              <li><Link href="/discover" className="hover:text-primary transition-colors">Открий студио</Link></li>
              <li><Link href="/auth" className="hover:text-primary transition-colors">Вход / Регистрация</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg text-foreground mb-3">Контакт</h4>
            <p>info@Zenno.bg</p>
            <p className="mt-1">+359 2 000 0000</p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © 2026 Zenno. Всички права запазени.
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
