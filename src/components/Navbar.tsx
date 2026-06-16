import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Menu, Bookmark, X, GraduationCap, Sparkles, Globe2, Wand2, BookOpen, Shield, ChevronRight, LogOut, Video, CreditCard, Star, Zap, Rocket, Users, Facebook, PenTool, Layout } from 'lucide-react';


import QuizModal from './QuizModal';
import NicheLessonsModal from './NicheLessonsModal';
import PurchasedAccountsModal from './PurchasedAccountsModal';
import CashBalance from './CashBalance';
import AddCashModal from './AddCashModal';
import { supabase } from '@/integrations/supabase/client';
import logoAdai from '@/assets/logo.png';
import { planLabel, planBadgeClass, isPaid } from '@/lib/plan';

const ICON_MAP: Record<string, typeof Sparkles> = {
  Sparkles, Globe2, Wand2, BookOpen, GraduationCap, Shield, Video, CreditCard, Star, Zap, Rocket, Users, Facebook, PenTool, Layout
};

interface NavItem { key: string; label: string; icon: string; color: string; target: string; enabled: boolean; sort_order: number; }

const DEFAULT_ITEMS: NavItem[] = [
  { key: 'menu', label: 'Ais', icon: 'Sparkles', color: 'text-white', target: 'ferramentas', enabled: true, sort_order: 1 },
  { key: 'offers', label: 'Ofertas validadas', icon: 'Sparkles', color: 'text-white', target: 'ofertas', enabled: true, sort_order: 2 },
  { key: 'alunos', label: 'Área do Mentorado', icon: 'Users', color: 'text-white', target: 'alunos', enabled: true, sort_order: 3 },
  { key: 'creative-edit', label: 'Criativos', icon: 'Wand2', color: 'text-white', target: 'creative-edit', enabled: true, sort_order: 4 },
  { key: 'copywrite', label: 'Copywrite', icon: 'PenTool', color: 'text-white', target: 'copywrite', enabled: true, sort_order: 5 },
  { key: 'fb-accounts', label: 'Contas de Facebook Ads', icon: 'Facebook', color: 'text-white', target: 'fb-accounts', enabled: true, sort_order: 6 },
  { key: 'purchased', label: 'Contas Compradas', icon: 'CreditCard', color: 'text-white', target: 'https://billing.stripe.com/p/login/test_6oE8xU1v0fXn5EYcMM', enabled: true, sort_order: 7 },
  { key: 'site-creation', label: 'Comprar Site', icon: 'Globe2', color: 'text-white', target: 'site-creation', enabled: true, sort_order: 8 },
  { key: 'lessons', label: 'Aulas gravadas', icon: 'GraduationCap', color: 'text-white', target: 'mentorias', enabled: true, sort_order: 9 },
];

export default function Navbar({ onNavigate, onOpenSavedEbook, hideAuth }: { onNavigate: (page: string) => void; onOpenSavedEbook?: (toolKey: string, categoryKey: string) => void; hideAuth?: boolean }) {
  const { user, isAdmin, logout, savedEbooks, unsaveEbook, refreshCashBalance } = useAuth();
  const location = useLocation();
  const isMenuPage = location.pathname === '/menu';
  const navigate = (path: string) => onNavigate(path.replace('/', '')); // Helper to use internal navigation
  const [showSaved, setShowSaved] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMenuExiting, setIsMenuExiting] = useState(false);
  const [showNiche, setShowNiche] = useState(false);
  const [menuItems, setMenuItems] = useState<NavItem[]>(DEFAULT_ITEMS);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showPurchasedModal, setShowPurchasedModal] = useState(false);
  const [showAddCash, setShowAddCash] = useState(false);


  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'nav_menu_items').maybeSingle();
      const arr = (data?.value as any);
      if (Array.isArray(arr) && arr.length) {
        setMenuItems(arr.filter((i: NavItem) => i.enabled).sort((a: NavItem, b: NavItem) => a.sort_order - b.sort_order));
      }
    })();
  }, []);

  const closeMenu = () => {
    setIsMenuExiting(true);
    setTimeout(() => {
      setShowMenu(false);
      setIsMenuExiting(false);
    }, 300);
  };

  const go = (target: string) => {
    closeMenu();
    if (target.startsWith('http')) {
      window.open(target, '_blank');
      return;
    }
    if (target === 'purchased') { setShowPurchasedModal(true); return; }
    if (target === 'niche-lessons') { setShowNiche(true); return; }
    onNavigate(target);
  };

  return (
    <>
      <nav className="bg-black/80 backdrop-blur-xl h-[64px] sm:h-[88px] px-3 sm:px-12 grid grid-cols-[auto_1fr_auto] sm:grid-cols-3 items-center fixed top-0 left-0 right-0 z-[200] gap-2 sm:gap-4 border-b border-white/5 transition-all duration-300">
        <div className="flex items-center gap-2 sm:gap-4 justify-self-start min-w-0">
          {user && (
            <button
              onClick={() => setShowMenu(true)}
              className="p-1.5 sm:p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-colors shrink-0"
              title="Menu"
            >
              <Menu size={18} className="sm:hidden" />
              <Menu size={20} className="hidden sm:block" />
            </button>
          )}

          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-white text-xl font-semibold tracking-tight shrink-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 glass-smooth">
              <img src={logoAdai} alt="AdAI" className="w-full h-full object-cover" />
            </div>
          </button>
        </div>

        <button onClick={() => onNavigate('home')} className="flex flex-col text-center justify-self-center text-white min-w-0 px-1" aria-label="Convert Club Home">
          <h1 className="block text-[13px] sm:text-xl font-semibold tracking-tighter leading-none truncate">CONVERT CLUB</h1>
          <span className="hidden sm:block text-[9px] font-bold text-white/40 tracking-[0.3em] uppercase leading-none mt-2">Elite Community</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 justify-self-end min-w-0">
          {user && (
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <CashBalance cents={user.cashBalance || 0} onClick={() => setShowAddCash(true)} />

              <button
                onClick={() => setShowSaved(true)}
                className="relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-colors shrink-0"
                title="E-books salvos"
              >
                <Bookmark size={16} className="sm:hidden" />
                <Bookmark size={18} className="hidden sm:inline" />
                {savedEbooks.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-md bg-white text-[9px] font-bold text-black flex items-center justify-center">{savedEbooks.length}</span>
                )}
              </button>
            </div>
          )}
          {!user && !hideAuth ? (
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate('auth')} className="px-2.5 sm:px-4 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium text-black bg-white hover:bg-white/90 transition-colors">Acessar</button>
            </div>
          ) : !user ? null : (
            <>
              <button onClick={() => onNavigate('profile')} className="flex items-center gap-1.5 sm:gap-2 bg-white/15 hover:bg-white/25 p-0.5 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-full transition-colors shrink-0" title={`${user.nome} ${user.sobrenome || ''}`}>
                <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-[11px] font-medium text-white shrink-0 overflow-hidden border border-white/10">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={`${user.nome} ${user.sobrenome || ''}`} className="w-full h-full object-cover" />
                  ) : (
                    user.nome?.[0] || '?'
                  )}
                </div>
                <span className="text-[13px] text-white truncate hidden md:inline max-w-[120px]">{user.nome} {user.sobrenome}</span>
                <span className={`hidden sm:inline text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 ${planBadgeClass(user.plano)}`}>{planLabel(user.plano)}</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Side Menu Drawer */}
      {showMenu && (
        <div className="fixed inset-0 z-[300]" onClick={closeMenu}>
          <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${isMenuExiting ? 'animate-fade-out' : 'animate-fade-in'}`} />
          <div 
            className={`absolute left-0 top-0 h-full w-full max-w-[320px] bg-black shadow-2xl flex flex-col border-r border-white/5 ${isMenuExiting ? 'animate-slide-out-left' : 'animate-slide-in-left'}`} 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => go('menu')}>
              <h3 className="text-base font-serif-display text-white">Menu</h3>
              <button onClick={(e) => { e.stopPropagation(); closeMenu(); }} className="text-white/40 hover:text-white p-1 rounded-md hover:bg-white/10"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-2 relative">
              {menuItems.map(({ key, label, icon, color, target }) => {
                const Icon = ICON_MAP[icon] || Sparkles;
                const hasSubmenu = false;
                const submenuOptions: string[] = [];

                return (
                  <div 
                    key={key} 
                    className="relative group/nav-item"
                    onMouseEnter={() => hasSubmenu && setHoveredItem(key)}
                    onMouseLeave={() => hasSubmenu && setHoveredItem(null)}
                  >
                    <button 
                      onClick={() => !hasSubmenu && go(target)} 
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left group"
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} className="text-white/60 group-hover:text-white transition-colors" />
                        <span className="text-sm font-light text-white/70 group-hover:text-white transition-colors">{label}</span>
                      </span>
                      <ChevronRight size={14} className={`text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all ${hasSubmenu ? 'rotate-0 group-hover/nav-item:rotate-90' : ''}`} />
                    </button>

                    {hasSubmenu && (
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${hoveredItem === key ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-white/5 py-1">
                          {submenuOptions.map((subItem) => (
                            <button
                              key={subItem}
                              onClick={() => go(target)}
                              className="w-full px-12 py-3 text-left text-xs font-light text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              {subItem}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {isAdmin && (
                <>
                  <div className="my-2 border-t border-white/5" />
                  <button onClick={() => go('admin')} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left group">
                    <span className="flex items-center gap-3">
                      <Shield size={18} className="text-white/60 group-hover:text-white transition-colors" />
                      <span className="text-sm font-light text-white/70 group-hover:text-white transition-colors">Painel administrativo</span>
                    </span>
                    <ChevronRight size={14} className="text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </>
              )}
              <div className="my-2 border-t border-white/5" />
              <button onClick={() => { setShowMenu(false); logout(); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left text-sm font-light text-white/40 hover:text-white">
                <LogOut size={18} /> Sair
              </button>
            </div>
            <div className="px-5 py-3 border-t border-white/5 text-[10px] text-white/30 tracking-[0.2em] uppercase font-bold">
              Convert Club · v0.02
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

      {/* Auth UI is now handled by the /auth page */}

      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onRecommend={(toolKey, categoryKey) => {
          onOpenSavedEbook?.(toolKey, categoryKey);
        }}
      />
      <PurchasedAccountsModal isOpen={showPurchasedModal} onClose={() => setShowPurchasedModal(false)} />
      <AddCashModal isOpen={showAddCash} onClose={() => setShowAddCash(false)} onDeposited={() => void refreshCashBalance()} />

      {showNiche && (
        <NicheLessonsModal onClose={() => setShowNiche(false)} onUpgrade={() => { setShowNiche(false); onNavigate('pro'); }} />
      )}
    </>
  );
}
