import { useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Моля, попълнете всички полета.'); return; }
    try {
      await register(name, email, password, role);
      toast.success("Успешна регистрация!");
      router.push("/");
    } catch { toast.error('Грешка при регистрация.'); }
  };

  const roles: { value: UserRole; label: string; desc: string }[] = [
    { value: 'client', label: 'Потребител', desc: 'Търсите и записвате йога класове' },
    { value: 'business', label: 'Бизнес', desc: 'Управлявате йога студио' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Създайте акаунт</h1>
          <p className="text-muted-foreground mt-2">Присъединете се към Zenno</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-8">
          <div className="space-y-2">
            <Label>Тип акаунт</Label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${role === r.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                    }`}
                >
                  <p className="font-semibold text-foreground text-sm">{r.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Име</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Вашето име" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Имейл</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="вашият@имейл.бг" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Парола</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">Регистрация</Button>
          <p className="text-center text-sm text-muted-foreground">
            Имате акаунт?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">Влезте</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
