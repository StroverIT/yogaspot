import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
            className="flex items-center shrink-0 rounded-xl overflow-hidden ring-1 ring-border/60 shadow-sm"
            aria-label="Zenno — начало"
          >
            <div className="relative h-12 w-12 md:h-14 md:w-14">
              <Image
                src="/homepage/logo.png"
                alt="Zenno"
                fill
                className="object-contain p-1"
                sizes="(max-width: 768px) 48px, 56px"
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

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-muted-foreground">
          <div>
            <div className="flex items-center mb-3">
              <div className="relative h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-xl overflow-hidden ring-1 ring-border/60 bg-black">
                <Image
                  src="/homepage/logo.png"
                  alt="Zenno"
                  fill
                  className="object-contain p-1.5"
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
