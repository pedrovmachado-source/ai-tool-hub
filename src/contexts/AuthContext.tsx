import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupaUser } from '@supabase/supabase-js';

interface Profile {
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
  user: (Profile & { id: string }) | null;
  isAdmin: boolean;
  savedEbooks: SavedEbook[];
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (nome: string, sobre: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  updateUser: (data: Partial<Profile>) => Promise<void>;
  saveEbook: (toolKey: string, toolName: string, categoryKey: string) => Promise<void>;
  unsaveEbook: (toolKey: string) => Promise<void>;
  isEbookSaved: (toolKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(Profile & { id: string }) | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedEbooks, setSavedEbooks] = useState<SavedEbook[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  }, []);

  const fetchProfile = useCallback(async (supaUser: SupaUser) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supaUser.id)
      .single();

    if (data) {
      setUser({
        id: supaUser.id,
        nome: data.nome,
        sobre: data.sobre,
        email: data.email,
        plano: (data.plano as 'Free' | 'Pro') || 'Free',
        telefone: data.telefone || undefined,
        empresa: data.empresa || undefined,
      });
    }
  }, []);

  const fetchSavedEbooks = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('saved_ebooks')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (data) {
      setSavedEbooks(data.map(e => ({
        toolKey: e.tool_key,
        toolName: e.tool_name,
        categoryKey: e.category_key,
        savedAt: e.saved_at,
      })));
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user);
        await checkAdminRole(session.user.id);
        await fetchSavedEbooks(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setSavedEbooks([]);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchProfile(session.user);
        await checkAdminRole(session.user.id);
        await fetchSavedEbooks(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, checkAdminRole, fetchSavedEbooks]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const register = useCallback(async (nome: string, sobre: string, email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, sobre } },
    });
    return error ? error.message : null;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setSavedEbooks([]);
  }, []);

  const upgradeToPro = useCallback(async () => {
    if (!user) return;
    await supabase.from('profiles').update({ plano: 'Pro' }).eq('user_id', user.id);
    setUser(prev => prev ? { ...prev, plano: 'Pro' } : null);
  }, [user]);

  const updateUser = useCallback(async (data: Partial<Profile>) => {
    if (!user) return;
    await supabase.from('profiles').update(data).eq('user_id', user.id);
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, [user]);

  const saveEbook = useCallback(async (toolKey: string, toolName: string, categoryKey: string) => {
    if (!user) return;
    const { error } = await supabase.from('saved_ebooks').insert({
      user_id: user.id,
      tool_key: toolKey,
      tool_name: toolName,
      category_key: categoryKey,
    });
    if (!error) {
      setSavedEbooks(prev => [
        { toolKey, toolName, categoryKey, savedAt: new Date().toISOString() },
        ...prev,
      ]);
    }
  }, [user]);

  const unsaveEbook = useCallback(async (toolKey: string) => {
    if (!user) return;
    await supabase.from('saved_ebooks').delete().eq('user_id', user.id).eq('tool_key', toolKey);
    setSavedEbooks(prev => prev.filter(e => e.toolKey !== toolKey));
  }, [user]);

  const isEbookSaved = useCallback((toolKey: string) => {
    return savedEbooks.some(e => e.toolKey === toolKey);
  }, [savedEbooks]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, savedEbooks, loading, login, register, logout, upgradeToPro, updateUser, saveEbook, unsaveEbook, isEbookSaved }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
