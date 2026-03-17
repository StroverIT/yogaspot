import { useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight, Chrome, Sparkles } from 'lucide-react';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const { login, register } = useAuth();
  const router = useRouter();

  const reset = () => {
    setEmail('');
    setPassword('');
    setName('');
  };

  const switchMode = (newMode: 'login' | 'register') => {
    reset();
    setMode(newMode);
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            {mode === 'login' ? 'Добре дошли обратно' : 'Присъединете се'}
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">
            {mode === 'login' ? 'Вход в YogaSpot' : 'Създайте акаунт'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'login' ? 'Влезте, за да продължите към вашата практика' : 'Регистрирайте се безплатно за секунди'}
          </p>
        </div>

        <div className="flex rounded-xl bg-muted p-1 mb-6">
          {(['login', 'register'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => switchMode(tab)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                mode === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              <span>{tab === 'login' ? 'Вход' : 'Регистрация'}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 overflow-hidden relative min-h-[400px]">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3 text-base rounded-xl"
                  onClick={async () => {
                    await login('google.user@gmail.com', 'google');
                    toast.success('Успешен вход с Google!');
                    router.push('/');
                  }}
                >
                  <Chrome className="h-5 w-5" />
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
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
                {/* Role selector */}
                <div className="space-y-2">
                  <Label>Тип акаунт</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          role === r.value
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
