import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupaUser } from '@supabase/supabase-js';

interface Profile {
  nome: string;
  sobrenome?: string;
  sobre: string;
  email: string;
  plano: 'Free' | 'Elite' | 'Elite Plus' | 'Max';
  telefone?: string;
  empresa?: string;
  avatarUrl?: string;
  inviteValidated: boolean;
  abuseBlocked: boolean;
  lgpdAccepted?: boolean;
  cashBalance: number;
}

interface SavedEbook {
  toolKey: string;
  toolName: string;
  categoryKey: string;
  savedAt: string;
}

interface ProfileRecord {
  nome: string;
  sobrenome: string | null;
  sobre: string;
  email: string;
  plano: string;
  telefone: string | null;
  empresa: string | null;
  avatar_url: string | null;
  invite_validated: boolean;
  abuse_blocked: boolean;
  lgpd_accepted: boolean | null;
  cash_balance: number | null;
}

interface AuthContextType {
  user: (Profile & { id: string }) | null;
  isAdmin: boolean;
  savedEbooks: SavedEbook[];
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (nome: string, sobrenome: string, email: string, password: string, lgpdAccepted: boolean) => Promise<string | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  upgradeToPro: () => Promise<void>;
  updateUser: (data: Partial<Omit<Profile, 'inviteValidated' | 'abuseBlocked'>>) => Promise<void>;
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
    nome: profile?.nome || (typeof supaUser.user_metadata?.nome === 'string' ? supaUser.user_metadata.nome : '') || (typeof supaUser.user_metadata?.full_name === 'string' ? supaUser.user_metadata.full_name : ''),
    sobrenome: profile?.sobrenome || (typeof (profile as ProfileRecord)?.sobrenome === 'string' ? (profile as ProfileRecord).sobrenome : undefined) || (typeof supaUser.user_metadata?.sobrenome === 'string' ? supaUser.user_metadata.sobrenome : undefined),
    sobre: profile?.sobre || (typeof supaUser.user_metadata?.sobre === 'string' ? supaUser.user_metadata.sobre : ''),
    email: profile?.email || supaUser.email || '',
    plano: (profile?.plano === 'Max' || profile?.plano === 'Mentorado') ? 'Max' : (profile?.plano === 'Elite Plus') ? 'Elite Plus' : (profile?.plano === 'Elite' || profile?.plano === 'Pro') ? 'Elite' : 'Free',
    telefone: profile?.telefone || undefined,
    empresa: profile?.empresa || undefined,
    avatarUrl: (profile as ProfileRecord)?.avatar_url || (profile as Profile)?.avatarUrl || undefined,
    inviteValidated: (profile as ProfileRecord)?.invite_validated ?? (profile as Profile)?.inviteValidated ?? false,
    abuseBlocked: (profile as ProfileRecord)?.abuse_blocked ?? (profile as Profile)?.abuseBlocked ?? false,
    lgpdAccepted: (profile as ProfileRecord)?.lgpd_accepted ?? (profile as Profile)?.lgpdAccepted ?? false,
    cashBalance: Number((profile as ProfileRecord)?.cash_balance ?? (profile as Profile)?.cashBalance ?? 0),
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

  const fetchProfile = useCallback(async (supaUser: SupaUser): Promise<ProfileRecord | null> => {
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
      nome: typeof supaUser.user_metadata?.nome === 'string' ? supaUser.user_metadata.nome : (typeof supaUser.user_metadata?.full_name === 'string' ? supaUser.user_metadata.full_name : ''),
      sobrenome: typeof supaUser.user_metadata?.sobrenome === 'string' ? supaUser.user_metadata.sobrenome : '',
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

      return fallbackData || null;
    }

    const { data: createdData, error: createdError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supaUser.id)
      .maybeSingle();

    if (createdError) {
      throw createdError;
    }

    return createdData || null;
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
      
      // Redirect logic after login
      if (event === 'SIGNED_IN' && session?.user) {
        // We need to wait for profile sync to decide where to go
        // But for Google users specifically, we check if they have name/surname
        const isGoogle = session.user.app_metadata.provider === 'google' || 
                        session.user.identities?.some(id => id.provider === 'google');
        
        // If it's a new login or Google login, we might need to redirect
        // We'll let the Profile/CompleteProfile pages handle the specific checks if possible
        // but a baseline redirect to /menu or /completar-perfil is good
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
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? translateAuthError(error.message) : null;
    } catch (err) {
      console.error('Login error:', err);
      return 'Erro inesperado ao fazer login. Tente novamente.';
    }
  }, []);

  const translateAuthError = (msg: string): string => {
    const m = msg.toLowerCase();
    if (m.includes('password is known to be weak') || m.includes('pwned') || (m.includes('weak') && m.includes('password'))) {
      return 'Esta senha é considerada fraca ou já vazada em outros sites. Escolha uma senha mais forte (use letras, números e símbolos).';
    }
    if (m.includes('password should be at least')) return 'A senha deve ter no mínimo 8 caracteres.';
    if (m.includes('user already registered') || m.includes('already registered') || m.includes('already exists') || m.includes('email already taken')) {
      return 'Este e-mail já está cadastrado. Tente fazer login.';
    }
    if (m.includes('invalid login credentials') || m.includes('invalid credentials')) return 'E-mail ou senha incorretos.';
    if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
    if (m.includes('invalid email') || m.includes('email is invalid')) return 'E-mail inválido. Verifique se digitou corretamente.';
    if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Aguarde um momento e tente novamente.';
    if (m.includes('network') || m.includes('failed to fetch')) return 'Erro de conexão. Verifique sua internet e tente novamente.';
    
    // Add translations for common Portuguese messages if any are returned by Supabase
    if (m.includes('email já cadastrado')) return 'Este e-mail já está cadastrado. Tente fazer login.';
    if (m.includes('credenciais inválidas')) return 'E-mail ou senha incorretos.';
    
    return msg;
  };

  const register = useCallback(async (nome: string, sobrenome: string, email: string, password: string, lgpdAccepted: boolean): Promise<string | null> => {
    const redirectUrl = `${window.location.origin}/`;
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { 
          data: { 
            nome: nome.trim(), 
            sobrenome: sobrenome.trim(),
            sobre: '',
            lgpd_accepted: lgpdAccepted,
            lgpd_accepted_at: lgpdAccepted ? new Date().toISOString() : null
          }, 
          emailRedirectTo: redirectUrl 
        },
      });
      
      if (error) return translateAuthError(error.message);
      
      // If auto-confirm is enabled, we might already have a session
      if (data?.session) {
        await syncSession(data.session);
      }
      
      return null;
    } catch (err) {
      console.error('Registration error:', err);
      return 'Erro inesperado ao criar conta. Tente novamente.';
    }
  }, [syncSession]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setSavedEbooks([]);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      return error ? translateAuthError(error.message) : null;
    } catch (err) {
      console.error('Reset password error:', err);
      return 'Erro inesperado ao solicitar recuperação. Tente novamente.';
    }
  }, []);

  const upgradeToPro = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data?.subscribed) {
        setUser(prev => prev ? { ...prev, plano: 'Elite' } : null);
      }
    } catch (e) {
      console.error('Falha ao verificar assinatura', e);
    }
  }, [user]);

  const updateUser = useCallback(async (data: Partial<Omit<Profile, 'inviteValidated' | 'abuseBlocked'>>) => {
    if (!user) return;
    
    // Map camelCase to snake_case for Supabase
    const updateData: any = { ...data };
    if (data.avatarUrl !== undefined) {
      updateData.avatar_url = data.avatarUrl;
      delete updateData.avatarUrl;
    }
    if (data.lgpdAccepted !== undefined) {
      updateData.lgpd_accepted = data.lgpdAccepted;
      updateData.lgpd_accepted_at = data.lgpdAccepted ? new Date().toISOString() : null;
      delete updateData.lgpdAccepted;
    }
    
    // Profiles table columns are mostly snake_case but some are used as camelCase in code
    // Let's ensure consistency with the DB types
    const { error } = await supabase.from('profiles').update(updateData).eq('user_id', user.id);
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
    <AuthContext.Provider value={{ user, isAdmin, savedEbooks, loading, login, register, logout, resetPassword, upgradeToPro, updateUser, saveEbook, unsaveEbook, isEbookSaved }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
