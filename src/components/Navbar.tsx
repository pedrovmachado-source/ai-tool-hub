import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

export default function Navbar({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, isAdmin, logout } = useAuth();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' | 'admin' }>({ open: false, mode: 'login' });

  return (
    <>
      <nav className="bg-navy h-[72px] px-8 flex items-center justify-between sticky top-0 z-[200]">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-primary-foreground text-xl font-semibold tracking-tight">
          <div className="w-10 h-10 bg-brand-blue rounded-[10px] flex items-center justify-center">
            <Sparkles size={20} className="text-primary-foreground" />
          </div>
          <div>
            <span>AdAI</span>
            <span className="block text-[11px] font-normal text-muted-foreground/60 leading-none mt-0.5">Guia de IAs para Empreendedores</span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <button onClick={() => setAuthModal({ open: true, mode: 'login' })} className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-primary-foreground/80 bg-primary-foreground/[0.08] hover:bg-primary-foreground/[0.15] transition-colors">Entrar</button>
              <button onClick={() => setAuthModal({ open: true, mode: 'register' })} className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-primary-foreground bg-brand-blue hover:opacity-90 transition-opacity">Cadastrar</button>
            </>
          ) : (
            <>
              {user.plano === 'Free' && (
                <button onClick={() => onNavigate('pro')} className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-primary-foreground bg-gradient-to-r from-brand-amber to-brand-amber/80 hover:opacity-90 transition-opacity">⚡ Seja Pro</button>
              )}
              {isAdmin && (
                <button onClick={() => onNavigate('admin')} className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-primary-foreground bg-brand-red/80 hover:opacity-90 transition-opacity">Admin</button>
              )}
              <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 bg-primary-foreground/[0.08] hover:bg-primary-foreground/[0.15] pl-1.5 pr-3 py-1 rounded-full transition-colors">
                <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center text-[11px] font-medium text-primary-foreground">{user.nome[0]}</div>
                <span className="text-[13px] text-primary-foreground">{user.nome}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${user.plano === 'Pro' ? 'bg-brand-amber text-primary-foreground' : 'bg-primary-foreground/[0.15] text-muted-foreground/60'}`}>{user.plano === 'Pro' ? 'PRO' : 'FREE'}</span>
              </button>
              <button onClick={logout} className="px-3 py-1.5 rounded-lg text-[13px] text-primary-foreground/60 hover:text-primary-foreground/80 transition-colors">Sair</button>
            </>
          )}
        </div>
      </nav>

      <AuthModal isOpen={authModal.open} mode={authModal.mode} onClose={() => setAuthModal({ ...authModal, open: false })} onSwitch={mode => setAuthModal({ open: true, mode })} />
    </>
  );
}
