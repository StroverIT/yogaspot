import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from 'next-auth/react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { GoogleGIcon } from '@/components/icons/brand-icons';
import { Spinner } from '@/components/ui/spinner';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const { login, loginWithGoogle, register } = useAuth();
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const reset = () => {
    setEmail('');
    setPassword('');
    setName('');
  };

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  useEffect(() => {
    const typeParam = searchParams?.get('type');
    const nextMode: 'login' | 'register' =
      typeParam === 'register' ? 'register' : 'login';
    setMode(nextMode);
    reset();
  }, [searchParams]);

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  const switchMode = (newMode: 'login' | 'register') => {
    reset();
    router.push(`/auth?type=${newMode}`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Моля, попълнете всички полета.'); return; }
    try {
      await login(email, password);
      toast.success('Успешен вход!');
      router.push("/");
    } catch { toast.error('Грешка при вход.'); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Моля, попълнете всички полета.'); return; }
    try {
      await register(name, email, password, role);
      toast.success('Успешна регистрация!');
      router.push("/");
    } catch { toast.error('Грешка при регистрация.'); }
  };

  const roles: { value: UserRole; label: string; desc: string; emoji: string }[] = [
    { value: 'client', label: 'Потребител', desc: 'Търсите и записвате йога класове', emoji: '🧘' },
    { value: 'business', label: 'Бизнес', desc: 'Управлявате йога студио', emoji: '🏢' },
  ];

  const modeOffset = mode === 'login' ? 'translateX(0%)' : 'translateX(-50%)';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="overflow-hidden mb-4">
            <div
              className="flex w-[200%] transition-transform duration-700 ease-auth-tab"
              style={{ transform: modeOffset }}
            >
              <div className="w-1/2 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  Добре дошли обратно
                </div>
              </div>
              <div className="w-1/2 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  Присъединете се
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex w-[200%] transition-transform duration-700 ease-auth-tab"
              style={{ transform: modeOffset }}
            >
              <h1 className="w-1/2 font-display text-4xl font-bold text-foreground">Вход в Zenno</h1>
              <h1 className="w-1/2 font-display text-4xl font-bold text-foreground">Създайте акаунт</h1>
            </div>
          </div>

          <div className="overflow-hidden mt-2">
            <div
              className="flex w-[200%] transition-transform duration-700 ease-auth-tab"
              style={{ transform: modeOffset }}
            >
              <p className="w-1/2 text-muted-foreground">Влезте, за да продължите към вашата практика</p>
              <p className="w-1/2 text-muted-foreground">Регистрирайте се безплатно за секунди</p>
            </div>
          </div>
        </div>

        <div className="relative flex rounded-xl bg-muted p-1 mb-6">
          <div
            className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-lg bg-background shadow-sm transition-transform duration-700 ease-auth-tab"
            style={{ transform: mode === 'login' ? 'translateX(0%)' : 'translateX(100%)' }}
          />
          {(['login', 'register'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => switchMode(tab)}
              className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors duration-300 ${mode === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                }`}
            >
              <span>{tab === 'login' ? 'Вход' : 'Регистрация'}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden relative">
          <div
            className="flex w-[200%] items-start transition-transform duration-700 ease-auth-tab"
            style={{ transform: modeOffset }}
          >
            <div className="w-1/2 shrink-0 p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3 text-base rounded-xl"
                  onClick={async () => {
                    try {
                      await loginWithGoogle();
                    } catch (err) {
                      console.error(err);
                      toast.error('Грешка при вход с Google.');
                    }
                  }}
                >
                  <GoogleGIcon className="h-5 w-5 shrink-0" />
                  Продължи с Google
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">или с имейл</span></div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-email">Имейл</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="вашият@имейл.бг" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Парола</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base rounded-xl gap-2">
                  Вход <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Нямате акаунт?{' '}
                  <button type="button" onClick={() => switchMode('register')} className="text-primary hover:underline font-medium">
                    Регистрирайте се
                  </button>
                </p>
              </form>
            </div>

            <div className="w-1/2 shrink-0 p-8">
              <form onSubmit={handleRegister} className="space-y-5">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3 text-base rounded-xl"
                  onClick={async () => {
                    try {
                      await loginWithGoogle({ registrationRole: role });
                    } catch (err) {
                      console.error(err);
                      toast.error('Грешка при регистрация с Google.');
                    }
                  }}
                >
                  <GoogleGIcon className="h-5 w-5 shrink-0" />
                  Регистрирайте се с Google
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">или с имейл</span></div>
                </div>

                <div className="space-y-2">
                  <Label>Тип акаунт</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${role === r.value
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-muted-foreground/30'
                          }`}
                      >
                        <div className="text-2xl mb-1">{r.emoji}</div>
                        <p className="font-semibold text-foreground text-sm">{r.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-name">Име</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="reg-name" value={name} onChange={e => setName(e.target.value)} placeholder="Вашето име" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Имейл</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="вашият@имейл.бг" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Парола</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base rounded-xl gap-2">
                  Регистрация <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Имате акаунт?{' '}
                  <button type="button" onClick={() => switchMode('login')} className="text-primary hover:underline font-medium">
                    Влезте
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
