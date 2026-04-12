import type { Session } from 'next-auth';
import type { UserRole } from '@/contexts/AuthContext';

export type NavUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
};

export function sessionToNavUser(session: Session | null): NavUser | null {
  if (!session?.user) return null;
  const u = session.user as {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    image?: string | null;
  };
  const email = u.email ?? '';
  const id = u.id ?? '';
  if (!email && !id) return null;
  return {
    id,
    name: u.name ?? '',
    email,
    role: (u.role as UserRole) ?? 'client',
    image: typeof u.image === 'string' && u.image.length > 0 ? u.image : null,
  };
}
