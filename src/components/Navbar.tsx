import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, Bookmark, X, GraduationCap, Sparkles, Globe2, Wand2, BookOpen, Shield, ChevronRight, LogOut, Video, CreditCard, Star, Zap, Rocket } from 'lucide-react';
import AuthModal from './AuthModal';
import QuizModal from './QuizModal';
import NicheLessonsModal from './NicheLessonsModal';
import { supabase } from '@/integrations/supabase/client';
import logoAdai from '@/assets/logo.png';
import { planLabel, planBadgeClass, isPaid } from '@/lib/plan';

const ICON_MAP: Record<string, typeof Sparkles> = {
  Sparkles, Globe2, Wand2, BookOpen, GraduationCap, Shield, Video, CreditCard, Star, Zap, Rocket,
};

interface NavItem { key: string; label: string; icon: string; color: string; target: string; enabled: boolean; sort_order: number; }

const DEFAULT_ITEMS: NavItem[] = [
  { key: 'offers', label: 'Ofertas validadas', icon: 'Sparkles', color: 'text-brand-amber', target: 'offers', enabled: true, sort_order: 1 },
  { key: 'site-creation', label: 'Criação de site', icon: 'Globe2', color: 'text-brand-blue-medium', target: 'site-creation', enabled: true, sort_order: 2 },
  { key: 'creative-edit', label: 'Edição de criativo', icon: 'Wand2', color: 'text-brand-teal', target: 'creative-edit', enabled: true, sort_order: 3 },
  { key: 'niche-lessons', label: 'Aulas por nicho', icon: 'BookOpen', color: 'text-brand-green', target: 'niche-lessons', enabled: true, sort_order: 4 },
  { key: 'lessons', label: 'Aulas gravadas', icon: 'GraduationCap', color: 'text-brand-blue-medium', target: 'lessons', enabled: true, sort_order: 5 },
];

export default function Navbar({ onNavigate, onOpenSavedEbook, hideAuth }: { onNavigate: (page: string) => void; onOpenSavedEbook?: (toolKey: string, categoryKey: string) => void; hideAuth?: boolean }) {
  const { user, isAdmin, logout, savedEbooks, unsaveEbook } = useAuth();
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({ open: false, mode: 'login' });
  const [showSaved, setShowSaved] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNiche, setShowNiche] = useState(false);
  const [menuItems, setMenuItems] = useState<NavItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'nav_menu_items').maybeSingle();
      const arr = (data?.value as any);
      if (Array.isArray(arr) && arr.length) {
        setMenuItems(arr.filter((i: NavItem) => i.enabled).sort((a: NavItem, b: NavItem) => a.sort_order - b.sort_order));
      }
    })();
  }, []);

  const go = (target: string) => {
    setShowMenu(false);
    if (target === 'niche-lessons') { setShowNiche(true); return; }
    onNavigate(target);
  };

  return (
    <>
      <nav className="bg-navy h-[64px] sm:h-[72px] px-3 sm:px-8 grid grid-cols-[auto_auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_1fr] items-center sticky top-0 z-[200] gap-2">
        {user && (
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-colors justify-self-start"
            title="Menu"
          >
            <Menu size={20} />
          </button>
        )}

        <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-white text-xl font-semibold tracking-tight justify-self-start">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] overflow-hidden flex items-center justify-center bg-navy">
            <img src={logoAdai} alt="AdAI" className="w-full h-full object-cover" />
          </div>
        </button>

        <button onClick={() => onNavigate('home')} className="text-center justify-self-center text-white min-w-0">
          <span className="block text-base sm:text-xl font-semibold tracking-tight leading-none">AdAI</span>
          <span className="hidden sm:block text-[11px] font-normal text-white leading-none mt-1">Guia de IAs para Empreendedores</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 justify-self-end">
          {user && (
            <button
              onClick={() => setShowSaved(true)}
              className="relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-colors"
              title="E-books salvos"
            >
              <Bookmark size={16} className="sm:hidden" />
              <Bookmark size={18} className="hidden sm:inline" />
              {savedEbooks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-amber text-[9px] font-bold text-white flex items-center justify-center">{savedEbooks.length}</span>
              )}
            </button>
          )}
          {!user && !hideAuth ? (
            <>
              <button onClick={() => setAuthModal({ open: true, mode: 'login' })} className="px-2.5 sm:px-4 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium text-white bg-white/15 hover:bg-white/25 transition-colors">Entrar</button>
              <button onClick={() => setAuthModal({ open: true, mode: 'register' })} className="px-2.5 sm:px-4 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium text-navy bg-white hover:bg-white/90 transition-colors">Cadastrar</button>
            </>
          ) : !user ? null : (
            <>
              {!isPaid(user.plano) && (
                <button onClick={() => onNavigate('pro')} className="px-2.5 sm:px-4 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium text-white bg-gradient-to-r from-brand-amber to-brand-amber/80 hover:opacity-90 transition-opacity whitespace-nowrap">⚡<span className="hidden sm:inline"> Assinar</span></button>
              )}
              <button onClick={() => onNavigate('profile')} className="flex items-center gap-1.5 sm:gap-2 bg-white/15 hover:bg-white/25 pl-1 sm:pl-1.5 pr-2 sm:pr-3 py-1 rounded-full transition-colors max-w-[140px] sm:max-w-none">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-navy flex items-center justify-center text-[11px] font-medium text-white shrink-0">{user.nome[0]}</div>
                <span className="text-[12px] sm:text-[13px] text-white truncate hidden xs:inline sm:inline">{user.nome}</span>
                <span className={`text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${planBadgeClass(user.plano)}`}>{planLabel(user.plano)}</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Side Menu Drawer */}
      {showMenu && (
        <div className="fixed inset-0 z-[300]" onClick={() => setShowMenu(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 h-full w-full max-w-[320px] bg-card shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-base font-semibold">Menu</h3>
              <button onClick={() => setShowMenu(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {menuItems.map(({ key, label, icon, color, target }) => {
                const Icon = ICON_MAP[icon] || Sparkles;
                return (
                  <button key={key} onClick={() => go(target)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors text-left">
                    <span className="flex items-center gap-3">
                      <Icon size={18} className={color} />
                      <span className="text-sm">{label}</span>
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground/40" />
                  </button>
                );
              })}
              {isAdmin && (
                <>
                  <div className="my-2 border-t border-border" />
                  <button onClick={() => go('admin')} className="w-full flex items-center justify-between px-5 py-3 hover:bg-secondary transition-colors text-left">
                    <span className="flex items-center gap-3">
                      <Shield size={18} className="text-brand-red" />
                      <span className="text-sm">Painel administrativo</span>
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground/40" />
                  </button>
                </>
              )}
              <div className="my-2 border-t border-border" />
              <button onClick={() => { setShowMenu(false); logout(); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary transition-colors text-left text-sm text-muted-foreground">
                <LogOut size={18} /> Sair
              </button>
            </div>
          </div>
        </div>
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

      {showNiche && (
        <NicheLessonsModal onClose={() => setShowNiche(false)} onUpgrade={() => { setShowNiche(false); onNavigate('pro'); }} />
      )}
    </>
  );
}
