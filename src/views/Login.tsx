import { useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Моля, попълнете всички полета.'); return; }
    try {
      await login(email, password);
      toast.success("Успешен вход!");
      router.push("/");
    } catch { toast.error('Грешка при вход.'); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Добре дошли</h1>
          <p className="text-muted-foreground mt-2">Влезте в акаунта си</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-8">
          <div className="space-y-2">
            <Label htmlFor="email">Имейл</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="вашият@имейл.бг" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Парола</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">Вход</Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">или</span></div>
          </div>
          <Button type="button" variant="outline" className="w-full" disabled>
            Вход с Google (изисква backend)
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Нямате акаунт?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">Регистрирайте се</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
