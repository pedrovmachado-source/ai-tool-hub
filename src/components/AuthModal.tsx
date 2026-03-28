import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';

interface AuthModalProps {
  mode: 'login' | 'register' | 'admin';
  isOpen: boolean;
  onClose: () => void;
  onSwitch: (mode: 'login' | 'register' | 'admin') => void;
}

export default function AuthModal({ mode, isOpen, onClose, onSwitch }: AuthModalProps) {
  const { login, register, adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [sobre, setSobre] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = () => {
    if (!email || !password) { setError('Preencha todos os campos.'); return; }
    if (login(email, password)) { onClose(); } else { setError('Credenciais inválidas.'); }
  };

  const handleRegister = () => {
    if (!nome || !sobre || !email || !password) { setError('Preencha todos os campos.'); return; }
    if (password.length < 8) { setError('Senha deve ter no mínimo 8 caracteres.'); return; }
    if (register(nome, sobre, email, password)) { onClose(); } else { setError('Erro ao criar conta.'); }
  };

  const handleAdmin = () => {
    if (adminLogin(adminUser, password)) { onClose(); } else { setError('Credenciais de admin inválidas.'); }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: 'rgba(10,10,30,0.65)' }} onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-[440px] animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
          <h2 className="text-lg font-medium">
            {mode === 'login' ? 'Entrar na sua conta' : mode === 'register' ? 'Criar conta gratuita' : 'Acesso Administrador'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary"><X size={18} /></button>
        </div>
        <div className="p-6">
          {error && <p className="text-sm text-brand-red mb-3">{error}</p>}

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
              <button onClick={handleLogin} className="w-full py-2.5 bg-navy text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Entrar</button>
              <div className="flex items-center gap-3 my-4 text-muted-foreground text-xs"><div className="flex-1 border-t border-border" /><span>ou</span><div className="flex-1 border-t border-border" /></div>
              <p className="text-center text-sm text-muted-foreground">Não tem conta? <button onClick={() => { setError(''); onSwitch('register'); }} className="text-brand-blue underline">Cadastre-se grátis</button></p>
              <p className="text-center text-xs text-muted-foreground mt-2"><button onClick={() => { setError(''); onSwitch('admin'); }} className="text-brand-blue underline">Acesso administrador</button></p>
            </>
          )}

          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Sobrenome</label><input value={sobre} onChange={e => setSobre(e.target.value)} placeholder="Sobrenome" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
              </div>
              <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
              <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
              <button onClick={handleRegister} className="w-full py-2.5 bg-navy text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Criar conta grátis</button>
              <p className="text-center text-xs text-muted-foreground mt-4">Já tem conta? <button onClick={() => { setError(''); onSwitch('login'); }} className="text-brand-blue underline">Entrar</button></p>
            </>
          )}

          {mode === 'admin' && (
            <>
              <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">Usuário admin</label><input value={adminUser} onChange={e => setAdminUser(e.target.value)} placeholder="admin" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
              <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-brand-blue" /></div>
              <button onClick={handleAdmin} className="w-full py-2.5 bg-navy text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Entrar como Admin</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
