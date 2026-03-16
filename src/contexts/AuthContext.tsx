import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'client' | 'business' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  favorites: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('yoga_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    // Mock login
    const mockUser: User = {
      id: 'u1',
      name: email.split('@')[0],
      email,
      role: email.includes('admin') ? 'admin' : email.includes('biz') ? 'business' : 'client',
      favorites: [],
    };
    setUser(mockUser);
    localStorage.setItem('yoga_user', JSON.stringify(mockUser));
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string, role: UserRole) => {
    const mockUser: User = { id: `u_${Date.now()}`, name, email, role, favorites: [] };
    setUser(mockUser);
    localStorage.setItem('yoga_user', JSON.stringify(mockUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('yoga_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
