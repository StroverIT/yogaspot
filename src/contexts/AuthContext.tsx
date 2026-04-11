import React, { createContext, useContext, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export type UserRole = 'client' | 'business' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  favorites: string[];
  image?: string | null;
}

export type LoginWithGoogleOptions = {
  /** Final destination after Google sign-in (and after role sync, if used). */
  callbackUrl?: string;
  /** From the register flow: persist `business` after OAuth (DB default is client). */
  registrationRole?: UserRole;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (options?: LoginWithGoogleOptions) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const sessionUser = session?.user as (User & { role?: UserRole }) | undefined;

  const login = useCallback(async (email: string, password: string) => {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      throw new Error(res.error);
    }
  }, []);

  const loginWithGoogle = useCallback(async (options?: LoginWithGoogleOptions) => {
    let next = options?.callbackUrl;
    if (!next && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const qs = window.location.search;
      next = path.startsWith('/auth') ? '/' : `${path}${qs}`;
    }
    if (!next) next = '/';

    const registrationRole = options?.registrationRole;
    const oauthCallback =
      registrationRole === 'business'
        ? `/api/auth/complete-google?role=business&next=${encodeURIComponent(next)}`
        : next;

    await signIn('google', { callbackUrl: oauthCallback });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: UserRole) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Registration failed');
      }

      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    void signOut({ redirect: false });
  }, []);

  const mappedUser: User | null = sessionUser
    ? {
        id: sessionUser.id,
        name: sessionUser.name ?? '',
        email: sessionUser.email ?? '',
        role: (sessionUser.role as UserRole) ?? 'client',
        favorites: [],
        image: (sessionUser as { image?: string | null }).image ?? null,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: mappedUser,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!mappedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
