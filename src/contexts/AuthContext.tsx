import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: number;
  nome: string;
  sobre: string;
  email: string;
  plano: 'Free' | 'Pro';
  telefone?: string;
  empresa?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  register: (nome: string, sobre: string, email: string, password: string) => boolean;
  adminLogin: (username: string, password: string) => boolean;
  logout: () => void;
  upgradeToPro: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('adai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('adai_admin') === 'true');

  const login = useCallback((email: string, _password: string) => {
    if (!email) return false;
    const u: User = { id: Date.now(), nome: email.split('@')[0], sobre: '', email, plano: 'Free' };
    setUser(u);
    localStorage.setItem('adai_user', JSON.stringify(u));
    return true;
  }, []);

  const register = useCallback((nome: string, sobre: string, email: string, _password: string) => {
    if (!email || !nome) return false;
    const u: User = { id: Date.now(), nome, sobre, email, plano: 'Free' };
    setUser(u);
    localStorage.setItem('adai_user', JSON.stringify(u));
    return true;
  }, []);

  const adminLogin = useCallback((username: string, password: string) => {
    const admins = [
      { user: 'admin', pass: 'AdAI@2025!' },
      { user: 'dono', pass: 'AdAI@Dono2025!' },
    ];
    const found = admins.find(a => a.user === username && a.pass === password);
    if (found) {
      setIsAdmin(true);
      localStorage.setItem('adai_admin', 'true');
      if (!user) {
        const u: User = { id: 0, nome: 'Admin', sobre: '', email: 'admin@adai.com', plano: 'Pro' };
        setUser(u);
        localStorage.setItem('adai_user', JSON.stringify(u));
      }
      return true;
    }
    return false;
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('adai_user');
    localStorage.removeItem('adai_admin');
  }, []);

  const upgradeToPro = useCallback(() => {
    if (user) {
      const updated = { ...user, plano: 'Pro' as const };
      setUser(updated);
      localStorage.setItem('adai_user', JSON.stringify(updated));
    }
  }, [user]);

  const updateUser = useCallback((data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('adai_user', JSON.stringify(updated));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, adminLogin, logout, upgradeToPro, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
