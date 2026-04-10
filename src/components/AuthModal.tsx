import { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { GoogleGIcon } from '@/components/icons/brand-icons';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AuthModal = ({ open, onOpenChange, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<'choice' | 'login' | 'register'>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const { login, register } = useAuth();

  const reset = () => {
    setMode('choice');
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Моля, попълнете всички полета.'); return; }
    try {
      await login(email, password);
      toast.success('Успешен вход!');
      handleClose(false);
      onSuccess?.();
    } catch { toast.error('Грешка при вход.'); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Моля, попълнете всички полета.'); return; }
    try {
      await register(name, email, password, role);
      toast.success('Успешна регистрация!');
      handleClose(false);
      onSuccess?.();
    } catch { toast.error('Грешка при регистрация.'); }
  };

  const handleGoogleLogin = async () => {
    // Mock Google login
    await login('google.user@gmail.com', 'google');
    toast.success('Успешен вход с Google!');
    handleClose(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {mode === 'choice' && (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="font-display text-2xl">Добре дошли в Zenno</DialogTitle>
              <DialogDescription>Влезте, за да запазите любимите си студиа</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-4">
              <Button variant="outline" className="w-full h-12 gap-3 text-base" onClick={handleGoogleLogin}>
                <GoogleGIcon className="h-5 w-5 shrink-0" />
                Продължи с Google
              </Button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">или</span></div>
              </div>
              <Button variant="outline" className="w-full h-12 gap-3 text-base" onClick={() => setMode('login')}>
                <Mail className="h-5 w-5" />
                Вход с имейл
              </Button>
              <p className="text-center text-sm text-muted-foreground pt-2">
                Нямате акаунт?{' '}
                <button onClick={() => setMode('register')} className="text-primary hover:underline font-medium">Регистрирайте се</button>
              </p>
            </div>
          </>
        )}

        {mode === 'login' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Вход с имейл</DialogTitle>
              <DialogDescription>Въведете данните за вашия акаунт</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="modal-email">Имейл</Label>
                <Input id="modal-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="вашият@имейл.бг" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-password">Парола</Label>
                <Input id="modal-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full">Вход</Button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => setMode('choice')} className="text-muted-foreground hover:text-foreground">← Назад</button>
                <button type="button" onClick={() => setMode('register')} className="text-primary hover:underline font-medium">Регистрация</button>
              </div>
            </form>
          </>
        )}

        {mode === 'register' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Създайте акаунт</DialogTitle>
              <DialogDescription>Присъединете се към Zenno</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'client' as UserRole, label: 'Потребител' },
                  { value: 'business' as UserRole, label: 'Бизнес' },
                ]).map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${role === r.value ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                      }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-name">Име</Label>
                <Input id="modal-name" value={name} onChange={e => setName(e.target.value)} placeholder="Вашето име" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-email">Имейл</Label>
                <Input id="modal-reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="вашият@имейл.бг" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-password">Парола</Label>
                <Input id="modal-reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full">Регистрация</Button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => setMode('choice')} className="text-muted-foreground hover:text-foreground">← Назад</button>
                <button type="button" onClick={() => setMode('login')} className="text-primary hover:underline font-medium">Вход</button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
