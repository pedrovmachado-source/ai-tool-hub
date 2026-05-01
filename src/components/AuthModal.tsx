import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, Loader2, Mail, CheckCircle2 } from 'lucide-react';

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
  const [sobre, setSobre] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (!email || !password) { setError('Preencha todos os campos.'); return; }
    setSubmitting(true);
    setError('');
    const err = await login(email, password);
    setSubmitting(false);
    if (err) { setError(err); } else { onClose(); }
  };

  const handleRegister = async () => {
    if (!nome || !sobre || !email || !password || !confirmPassword) { setError('Preencha todos os campos.'); return; }
    if (password.length < 8) { setError('Senha deve ter no mínimo 8 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem. Verifique e tente novamente.'); return; }
    setSubmitting(true);
    setError('');
    const err = await register(nome, sobre, email, password);
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
              <p className="text-center text-sm text-muted-foreground">Não tem conta? <button onClick={() => { setError(''); setSuccess(''); onSwitch('register'); }} className="text-brand-blue underline">Cadastre-se grátis</button></p>
            </>
          )}

          {mode === 'register' && !success && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Sobrenome</label><input value={sobre} onChange={e => setSobre(e.target.value)} placeholder="Sobrenome" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
              </div>
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
