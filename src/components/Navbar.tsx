import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, Bookmark, X } from 'lucide-react';
import AuthModal from './AuthModal';
import QuizModal from './QuizModal';
import logoAdai from '@/assets/logo.png';

export default function Navbar({ onNavigate, onOpenSavedEbook }: { onNavigate: (page: string) => void; onOpenSavedEbook?: (toolKey: string, categoryKey: string) => void }) {
  const { user, isAdmin, logout, savedEbooks, unsaveEbook } = useAuth();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({ open: false, mode: 'login' });
  const [showSaved, setShowSaved] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <>
      <nav className="bg-brand-blue h-[72px] px-8 flex items-center justify-between sticky top-0 z-[200]">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-white text-xl font-semibold tracking-tight">
          <div className="w-10 h-10 rounded-[10px] overflow-hidden flex items-center justify-center bg-navy">
            <img src={logoAdai} alt="AdAI" className="w-full h-full object-cover" />
          </div>
          <div>
            <span>AdAI</span>
            <span className="block text-[11px] font-normal text-white/80 leading-none mt-0.5">Guia de IAs para Empreendedores</span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => setShowSaved(true)}
              className="relative px-2.5 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-colors"
              title="E-books salvos"
            >
              <Bookmark size={18} />
              {savedEbooks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-amber text-[9px] font-bold text-white flex items-center justify-center">{savedEbooks.length}</span>
              )}
            </button>
          )}
          {!user ? (
            <>
              <button onClick={() => setAuthModal({ open: true, mode: 'login' })} className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-white bg-white/15 hover:bg-white/25 transition-colors">Entrar</button>
              <button onClick={() => setAuthModal({ open: true, mode: 'register' })} className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-navy bg-white hover:bg-white/90 transition-colors">Cadastrar</button>
            </>
          ) : (
            <>
              {user.plano === 'Free' && (
                <button onClick={() => onNavigate('pro')} className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-white bg-gradient-to-r from-brand-amber to-brand-amber/80 hover:opacity-90 transition-opacity">⚡ Seja Pro</button>
              )}
              <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 pl-1.5 pr-3 py-1 rounded-full transition-colors">
                <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-[11px] font-medium text-white">{user.nome[0]}</div>
                <span className="text-[13px] text-white">{user.nome}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${user.plano === 'Pro' ? 'bg-brand-amber text-white' : 'bg-white/25 text-white'}`}>{user.plano === 'Pro' ? 'PRO' : 'FREE'}</span>
              </button>
              <button onClick={logout} className="px-3 py-1.5 rounded-lg text-[13px] text-white/85 hover:text-white hover:bg-white/10 transition-colors">Sair</button>
            </>
          )}
        </div>
      </nav>

      {/* Admin hamburger */}
      {isAdmin && (
        <button
          onClick={() => onNavigate('admin')}
          className="fixed top-[80px] left-3 z-[199] w-10 h-10 rounded-lg bg-navy border border-primary-foreground/10 hover:bg-primary-foreground/[0.15] flex items-center justify-center transition-colors shadow-lg"
          title="Painel Administrativo"
        >
          <Menu size={20} className="text-primary-foreground" />
        </button>
      )}

      {/* Saved Ebooks Drawer */}
      {showSaved && (
        <div className="fixed inset-0 z-[300]" onClick={() => setShowSaved(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute right-0 top-0 h-full w-full max-w-[380px] bg-card shadow-2xl flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-base font-semibold flex items-center gap-2"><Bookmark size={16} /> E-books salvos</h3>
              <button onClick={() => setShowSaved(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {savedEbooks.length === 0 ? (
                <div className="text-center py-16">
                  <Bookmark size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Nenhum e-book salvo ainda.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Abra um e-book e clique em "Salvar" para guardá-lo aqui.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedEbooks.map(eb => (
                    <div key={eb.toolKey} className="flex items-center justify-between bg-secondary rounded-lg p-3 group">
                      <button
                        onClick={() => { setShowSaved(false); onOpenSavedEbook?.(eb.toolKey, eb.categoryKey); }}
                        className="text-left flex-1 min-w-0"
                      >
                        <div className="text-sm font-medium truncate">{eb.toolName}</div>
                        <div className="text-[11px] text-muted-foreground">{new Date(eb.savedAt).toLocaleDateString('pt-BR')}</div>
                      </button>
                      <button onClick={() => unsaveEbook(eb.toolKey)} className="text-muted-foreground hover:text-brand-red p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Remover">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModal.open}
        mode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        onSwitch={mode => setAuthModal({ open: true, mode })}
        onRegistered={() => {
          setTimeout(() => setShowQuiz(true), 500);
        }}
      />

      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onRecommend={(toolKey, categoryKey) => {
          onOpenSavedEbook?.(toolKey, categoryKey);
        }}
      />
    </>
  );
}