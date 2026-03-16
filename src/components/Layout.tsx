import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
import logo from '@/assets/logo.png';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary tracking-tight">
            <img src={logo} alt="YogaSpot" className="h-9 w-9 object-contain" />
            YogaSpot
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-body text-sm font-medium">
            <Link to="/discover" className="text-foreground/70 hover:text-primary transition-colors">
              Открий студио
            </Link>
            {isAuthenticated && user?.role === 'business' && (
              <Link to="/dashboard" className="text-foreground/70 hover:text-primary transition-colors">
                Табло
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="text-foreground/70 hover:text-primary transition-colors">
                Админ панел
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/favorites" onClick={handleFavoritesClick}>
              <Button variant="ghost" size="icon"><Heart className="h-5 w-5" /></Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => { logout(); navigate('/'); }}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>Вход</Button>
                <Button onClick={() => navigate('/auth')}>Регистрация</Button>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3 font-body">
            <Link to="/discover" className="block py-2" onClick={() => setMobileOpen(false)}>Открий студио</Link>
            <button
              className="block py-2 w-full text-left"
              onClick={() => {
                setMobileOpen(false);
                if (!isAuthenticated) { setAuthModalOpen(true); } else { navigate('/favorites'); }
              }}
            >
              Любими
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block py-2" onClick={() => setMobileOpen(false)}>Профил</Link>
                {user?.role === 'business' && <Link to="/dashboard" className="block py-2" onClick={() => setMobileOpen(false)}>Табло</Link>}
                {user?.role === 'admin' && <Link to="/admin" className="block py-2" onClick={() => setMobileOpen(false)}>Админ панел</Link>}
                <button className="block py-2 text-destructive" onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}>Изход</button>
              </>
            ) : (
              <>
                <Link to="/auth" className="block py-2" onClick={() => setMobileOpen(false)}>Вход</Link>
                <Link to="/auth" className="block py-2 font-semibold text-primary" onClick={() => setMobileOpen(false)}>Регистрация</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-muted-foreground">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="YogaSpot" className="h-8 w-8 object-contain" />
              <h4 className="font-display text-lg text-foreground">YogaSpot</h4>
            </div>
            <p>Твоят портал към йога студиа в България. Открий, запиши се и практикувай.</p>
          </div>
          <div>
            <h4 className="font-display text-lg text-foreground mb-3">Навигация</h4>
            <ul className="space-y-2">
              <li><Link to="/discover" className="hover:text-primary transition-colors">Открий студио</Link></li>
              <li><Link to="/auth" className="hover:text-primary transition-colors">Вход / Регистрация</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg text-foreground mb-3">Контакт</h4>
            <p>info@yogaspot.bg</p>
            <p className="mt-1">+359 2 000 0000</p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © 2026 YogaSpot. Всички права запазени.
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={() => navigate('/favorites')}
      />
    </div>
  );
};

export default Layout;
