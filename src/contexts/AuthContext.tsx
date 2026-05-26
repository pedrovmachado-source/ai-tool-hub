import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupaUser } from '@supabase/supabase-js';

interface Profile {
  nome: string;
  sobre: string;
  email: string;
  plano: 'Free' | 'Pro' | 'Max';
  telefone?: string;
  empresa?: string;
  inviteValidated: boolean;
}

interface SavedEbook {
  toolKey: string;
  toolName: string;
  categoryKey: string;
  savedAt: string;
}

interface ProfileRecord {
  nome: string;
  sobre: string;
  email: string;
  plano: string;
  telefone: string | null;
  empresa: string | null;
  invite_validated: boolean;
}

interface AuthContextType {
  user: (Profile & { id: string }) | null;
  isAdmin: boolean;
  savedEbooks: SavedEbook[];
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (nome: string, email: string, password: string) => Promise<string | null>;
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
  const authSyncRef = useRef(0);

  const buildUserFromProfile = useCallback((supaUser: SupaUser, profile?: ProfileRecord | Partial<Profile> | null): Profile & { id: string } => ({
    id: supaUser.id,
    nome: profile?.nome || (typeof supaUser.user_metadata?.nome === 'string' ? supaUser.user_metadata.nome : ''),
    sobre: profile?.sobre || (typeof supaUser.user_metadata?.sobre === 'string' ? supaUser.user_metadata.sobre : ''),
    email: profile?.email || supaUser.email || '',
    plano: profile?.plano === 'Max' ? 'Max' : profile?.plano === 'Pro' ? 'Pro' : 'Free',
    telefone: profile?.telefone || undefined,
    empresa: profile?.empresa || undefined,
    inviteValidated: (profile as ProfileRecord)?.invite_validated ?? (profile as Profile)?.inviteValidated ?? false,
  }), []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAdmin(false);
    setSavedEbooks([]);
    setLoading(false);
  }, []);

  const checkAdminRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!error) {
      return !!data;
    }

    const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('verify-admin');

    if (fallbackError) {
      throw fallbackError;
    }

    return !!(fallbackData as { isAdmin?: boolean } | null)?.isAdmin;
  }, []);

  const fetchProfile = useCallback(async (supaUser: SupaUser) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supaUser.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }

    const payload = {
      user_id: supaUser.id,
      nome: typeof supaUser.user_metadata?.nome === 'string' ? supaUser.user_metadata.nome : '',
      sobre: typeof supaUser.user_metadata?.sobre === 'string' ? supaUser.user_metadata.sobre : '',
      email: supaUser.email || '',
    };

    const { error: insertError } = await supabase.from('profiles').insert(payload);

    if (insertError) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supaUser.id)
        .maybeSingle();

      if (fallbackError) {
        throw fallbackError;
      }

      if (fallbackData) {
        return {
          nome: fallbackData.nome,
          sobre: fallbackData.sobre,
          email: fallbackData.email,
          plano: fallbackData.plano,
          telefone: fallbackData.telefone,
          empresa: fallbackData.empresa,
          invite_validated: fallbackData.invite_validated,
        } satisfies ProfileRecord;
      }

      throw insertError;
    }

    const { data: createdData, error: createdError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supaUser.id)
      .maybeSingle();

    if (createdError) {
      throw createdError;
    }

    return createdData
      ? {
          nome: createdData.nome,
          sobre: createdData.sobre,
          email: createdData.email,
          plano: createdData.plano,
          telefone: createdData.telefone,
          empresa: createdData.empresa,
          invite_validated: createdData.invite_validated,
        } satisfies ProfileRecord
      : null;
  }, []);

  const fetchSavedEbooks = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('saved_ebooks')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(e => ({
        toolKey: e.tool_key,
        toolName: e.tool_name,
        categoryKey: e.category_key,
        savedAt: e.saved_at,
      }));
  }, []);

  const syncSession = useCallback(async (session: Session | null) => {
    const syncId = ++authSyncRef.current;

    if (!session?.user) {
      clearAuthState();
      return;
    }

    setLoading(true);

    try {
      const currentUser = session.user;
      const [profileResult, adminResult, savedResult] = await Promise.allSettled([
        fetchProfile(currentUser),
        checkAdminRole(currentUser.id),
        fetchSavedEbooks(currentUser.id),
      ]);

      if (authSyncRef.current !== syncId) {
        return;
      }

      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
      setUser(buildUserFromProfile(currentUser, profile));
      setIsAdmin(adminResult.status === 'fulfilled' ? adminResult.value : false);
      setSavedEbooks(savedResult.status === 'fulfilled' ? savedResult.value : []);

      if (profileResult.status === 'rejected') {
        console.error('Falha ao sincronizar perfil do usuário', profileResult.reason);
      }
      if (adminResult.status === 'rejected') {
        console.error('Falha ao verificar permissão administrativa', adminResult.reason);
      }
      if (savedResult.status === 'rejected') {
        console.error('Falha ao carregar e-books salvos', savedResult.reason);
      }
    } catch (error) {
      if (authSyncRef.current !== syncId) {
        return;
      }

      console.error('Falha ao restaurar sessão', error);
      setUser(buildUserFromProfile(session.user));
      setIsAdmin(false);
      setSavedEbooks([]);
    } finally {
      if (authSyncRef.current === syncId) {
        setLoading(false);
      }
    }
  }, [buildUserFromProfile, checkAdminRole, clearAuthState, fetchProfile, fetchSavedEbooks]);

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      void syncSession(session);
      
      // Fix for Google Login infinite loading / redirect
      if (event === 'SIGNED_IN') {
        // Redireciona para /menu após o login bem-sucedido
        // Usamos window.location para garantir que qualquer estado de popup seja limpo
        if (window.location.pathname === '/' || window.location.pathname === '') {
          window.location.href = '/menu';
        }
      }
    });

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!active) return;
        void syncSession(session);
      })
      .catch((error) => {
        console.error('Falha ao recuperar sessão inicial', error);
        if (active) {
          clearAuthState();
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [clearAuthState, syncSession]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? translateAuthError(error.message) : null;
  }, []);

  const translateAuthError = (msg: string): string => {
    const m = msg.toLowerCase();
    if (m.includes('password is known to be weak') || m.includes('pwned') || m.includes('weak') && m.includes('password')) {
      return 'Esta senha é considerada fraca ou já vazada em outros sites. Escolha uma senha mais forte (use letras, números e símbolos).';
    }
    if (m.includes('password should be at least')) return 'A senha deve ter no mínimo 8 caracteres.';
    if (m.includes('user already registered') || m.includes('already registered') || m.includes('already exists')) {
      return 'Este e-mail já está cadastrado. Tente fazer login.';
    }
    if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
    if (m.includes('invalid email')) return 'E-mail inválido.';
    if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Aguarde um momento e tente novamente.';
    if (m.includes('network')) return 'Erro de conexão. Verifique sua internet e tente novamente.';
    return msg;
  };

  const register = useCallback(async (nome: string, email: string, password: string): Promise<string | null> => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, sobre: '' }, emailRedirectTo: redirectUrl },
    });
    return error ? translateAuthError(error.message) : null;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setSavedEbooks([]);
  }, []);

  const upgradeToPro = useCallback(async () => {
    // Now handled by Stripe checkout + check-subscription sync
    // This manually syncs by calling check-subscription
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data?.subscribed) {
        setUser(prev => prev ? { ...prev, plano: 'Pro' } : null);
      }
    } catch (e) {
      console.error('Falha ao verificar assinatura', e);
    }
  }, [user]);

  const updateUser = useCallback(async (data: Partial<Omit<Profile, 'inviteValidated'>>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(data).eq('user_id', user.id);
    if (!error) {
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
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
        ...prev.filter(e => e.toolKey !== toolKey),
      ]);
    }
  }, [user]);

  const unsaveEbook = useCallback(async (toolKey: string) => {
    if (!user) return;
    const { error } = await supabase.from('saved_ebooks').delete().eq('user_id', user.id).eq('tool_key', toolKey);
    if (!error) {
      setSavedEbooks(prev => prev.filter(e => e.toolKey !== toolKey));
    }
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
