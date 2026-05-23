import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { lovable } from '@/integrations/lovable';

interface AuthModalProps {
  mode: 'login' | 'register';
  isOpen: boolean;
  onClose: () => void;
  onSwitch: (mode: 'login' | 'register') => void;
  onRegistered?: () => void;
}

export default function AuthModal({ mode, isOpen, onClose, onSwitch, onRegistered }: AuthModalProps) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setError('');
    const result = await lovable.auth.signInWithOAuth('google');
    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) { setError('Preencha todos os campos.'); return; }
    setSubmitting(true);
    setError('');
    const err = await login(email, password);
    setSubmitting(false);
    if (err) { setError(err); } else { onClose(); }
  };

  const handleRegister = async () => {
    if (!nome || !email || !password || !confirmPassword) { setError('Preencha todos os campos.'); return; }
    if (password.length < 8) { setError('Senha deve ter no mínimo 8 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem. Verifique e tente novamente.'); return; }
    setSubmitting(true);
    setError('');
    const err = await register(nome, email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
      onRegistered?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: 'rgba(10,10,30,0.65)' }} onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-[440px] animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
          <h2 className="text-lg font-medium">
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar conta gratuita'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary"><X size={18} /></button>
        </div>
        <div className="p-6">
          {error && <p className="text-sm text-brand-red mb-3">{error}</p>}
          {success && <p className="text-sm text-green-600 mb-3">{success}</p>}

          {mode === 'login' && (
            <>
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" />
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" />
              </div>
              <button onClick={handleLogin} disabled={submitting} className="w-full py-2.5 bg-navy text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Entrar
              </button>
              <div className="flex items-center gap-3 my-4 text-muted-foreground text-xs"><div className="flex-1 border-t border-border" /><span>ou</span><div className="flex-1 border-t border-border" /></div>
              <button 
                onClick={handleGoogleSignIn} 
                disabled={submitting} 
                className="w-full py-2.5 bg-white border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar com Google
              </button>
              <p className="text-center text-sm text-muted-foreground">Não tem conta? <button onClick={() => { setError(''); setSuccess(''); onSwitch('register'); }} className="text-brand-blue underline">Cadastre-se grátis</button></p>
            </>
          )}

          {mode === 'register' && !success && (
            <>
              <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
              <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
              <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
              <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">Confirmar senha</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Digite a senha novamente" className={`w-full px-3 py-2 border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue ${confirmPassword && password !== confirmPassword ? 'border-brand-red' : 'border-border'}`} /></div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-brand-red -mt-2 mb-3">As senhas não coincidem.</p>
              )}
              <button onClick={handleRegister} disabled={submitting} className="w-full py-2.5 bg-navy text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Criar conta grátis
              </button>
              <div className="flex items-center gap-3 my-4 text-muted-foreground text-xs"><div className="flex-1 border-t border-border" /><span>ou</span><div className="flex-1 border-t border-border" /></div>
              <button 
                onClick={handleGoogleSignIn} 
                disabled={submitting} 
                className="w-full py-2.5 bg-white border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Cadastrar com Google
              </button>
              <p className="text-center text-xs text-muted-foreground mt-4">Já tem conta? <button onClick={() => { setError(''); setSuccess(''); onSwitch('login'); }} className="text-brand-blue underline">Entrar</button></p>
            </>
          )}

          {mode === 'register' && success && (
            <div className="flex flex-col items-center text-center py-6 px-2">
              <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mb-4 animate-fade-in">
                <Mail size={32} className="text-brand-blue" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Verifique seu e-mail</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Enviamos um link de confirmação para:
              </p>
              <p className="text-sm font-semibold text-foreground bg-secondary px-4 py-2 rounded-lg mb-4 break-all">
                {email}
              </p>
              <div className="flex items-start gap-2 bg-secondary/50 rounded-lg p-3 mb-5 w-full">
                <CheckCircle2 size={16} className="text-brand-teal mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground text-left">
                  Clique no link enviado para ativar sua conta. Verifique também a <span className="font-medium text-foreground">caixa de spam</span> caso não encontre o e-mail.
                </p>
              </div>
              <button
                onClick={() => { setError(''); setSuccess(''); onSwitch('login'); }}
                className="w-full py-2.5 bg-navy text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Ir para login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
