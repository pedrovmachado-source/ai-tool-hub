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

interface SavedEbook {
  toolKey: string;
  toolName: string;
  categoryKey: string;
  savedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  savedEbooks: SavedEbook[];
  login: (email: string, password: string) => boolean;
  register: (nome: string, sobre: string, email: string, password: string) => boolean;
  adminLogin: (username: string, password: string) => boolean;
  logout: () => void;
  upgradeToPro: () => void;
  updateUser: (data: Partial<User>) => void;
  saveEbook: (toolKey: string, toolName: string, categoryKey: string) => void;
  unsaveEbook: (toolKey: string) => void;
  isEbookSaved: (toolKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('adai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('adai_admin') === 'true');
  const [savedEbooks, setSavedEbooks] = useState<SavedEbook[]>(() => {
    const saved = localStorage.getItem('adai_saved_ebooks');
    return saved ? JSON.parse(saved) : [];
  });

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
      const u: User = { id: user?.id ?? 0, nome: user?.nome ?? 'Admin', sobre: user?.sobre ?? '', email: user?.email ?? 'admin@adai.com', plano: 'Pro' };
      setUser(u);
      localStorage.setItem('adai_user', JSON.stringify(u));
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

  const saveEbook = useCallback((toolKey: string, toolName: string, categoryKey: string) => {
    setSavedEbooks(prev => {
      if (prev.some(e => e.toolKey === toolKey)) return prev;
      const updated = [...prev, { toolKey, toolName, categoryKey, savedAt: new Date().toISOString() }];
      localStorage.setItem('adai_saved_ebooks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unsaveEbook = useCallback((toolKey: string) => {
    setSavedEbooks(prev => {
      const updated = prev.filter(e => e.toolKey !== toolKey);
      localStorage.setItem('adai_saved_ebooks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isEbookSaved = useCallback((toolKey: string) => {
    return savedEbooks.some(e => e.toolKey === toolKey);
  }, [savedEbooks]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, savedEbooks, login, register, adminLogin, logout, upgradeToPro, updateUser, saveEbook, unsaveEbook, isEbookSaved }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
