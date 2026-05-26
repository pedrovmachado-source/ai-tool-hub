import { useEffect, useState } from 'react';
import { usePlanConfig } from '@/hooks/usePlanConfig';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import ToolCard from '@/components/ToolCard';
import EbookModal from '@/components/EbookModal';
import ProPage from '@/components/ProPage';
import AdminPanel from '@/components/AdminPanel';
import LessonsPage from '@/components/LessonsPage';
import ContentSectionPage from '@/components/ContentSectionPage';
import SiteCreationPage from '@/components/SiteCreationPage';
import PromptsLibrary from '@/components/PromptsLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Lock, ArrowRight, Sparkles } from 'lucide-react';
import type { Tool, Category } from '@/data/tools-data';

export default function Index() {
  const navigate = useNavigate();
  const { plan } = usePlanConfig();
  const { user, isAdmin } = useAuth();
  const { categories, loading, error, fetchCategories } = useCategories();
  const initialPage = typeof window !== 'undefined' ? sessionStorage.getItem('adai:initialPage') : null;
  const [page, setPage] = useState(initialPage || 'home');
  const initialCat = typeof window !== 'undefined' ? sessionStorage.getItem('adai:initialCategory') : null;
  const [activeCategory, setActiveCategory] = useState(initialCat || 'texto');
  const [searchQuery, setSearchQuery] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [ebookModal, setEbookModal] = useState<{ tool: Tool; category: Category } | null>(null);
  const [serverAdminVerified, setServerAdminVerified] = useState<boolean | null>(null);
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);

  useEffect(() => {
    if (user?.abuseBlocked) {
      navigate('/bloqueado');
      return;
    }
    if (initialCat) sessionStorage.removeItem('adai:initialCategory');
    if (initialPage) sessionStorage.removeItem('adai:initialPage');
  }, [user, navigate]);

  const handleNavigate = (target: string) => {
    if (target === 'home') { navigate('/'); return; }
    if (target === 'profile') { navigate('/perfil'); return; }
    setPage(target);
  };

  useEffect(() => {
    if (categories.length > 0 && !categories.some(c => c.key === activeCategory)) {
      setActiveCategory(categories[0].key);
    }
  }, [activeCategory, categories]);

  // Server-side admin verification before rendering admin panel
  useEffect(() => {
    if (page !== 'admin') return;
    if (!user) {
      setServerAdminVerified(false);
      return;
    }
    setVerifyingAdmin(true);
    setServerAdminVerified(null);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-admin');
        if (error) throw error;
        setServerAdminVerified(!!(data as any)?.isAdmin);
      } catch (e) {
        console.error('Admin verification failed', e);
        setServerAdminVerified(false);
      } finally {
        setVerifyingAdmin(false);
      }
    })();
  }, [page, user]);

  const category = categories.find(c => c.key === activeCategory);

  const isFreeTool = (t: Tool) => {
    const b = (t.badge || '').toLowerCase();
    return b.includes('grát') || b.includes('grat') || b === 'free' || b.includes('100%') || b.includes('gratuit');
  };

  const baseTools = searchQuery
    ? categories.flatMap(c => c.tools.map(t => ({ tool: t, category: c }))).filter(({ tool }) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.badge.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : category ? category.tools.map(t => ({ tool: t, category })) : [];

  const filteredTools = freeOnly ? baseTools.filter(({ tool }) => isFreeTool(tool)) : baseTools;

  const handleOpenEbook = (tool: Tool, cat: Category) => {
    const canAccess = isAdmin || (user && user.plano === 'Pro');
    if (!canAccess) {
      setPage('pro');
      return;
    }
    setEbookModal({ tool, category: cat });
  };

  if (page === 'admin') {
    if (verifyingAdmin || serverAdminVerified === null) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Verificando permissões…</div>
        </div>
      );
    }
    if (isAdmin || serverAdminVerified) {
      return <AdminPanel onBack={() => { setServerAdminVerified(null); setPage('home'); }} onCategoriesChanged={fetchCategories} />;
    }
    // Not an admin — bounce back home
    if (page === 'admin') setPage('home');
    return null;
  }
  if (page === 'pro') return <ProPage onBack={() => setPage('home')} onNavigate={handleNavigate} />;
  if (page === 'lessons') return <LessonsPage onBack={() => setPage('home')} />;
  if (page === 'site-creation') return <SiteCreationPage onBack={() => setPage('home')} />;
  if (page === 'offers' || page === 'creative-edit') {
    return <ContentSectionPage slug={page} onBack={() => setPage('home')} onUpgrade={() => setPage('pro')} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white/40 font-bold uppercase tracking-widest text-[10px] animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="max-w-md text-center">
          <h1 className="font-serif-display text-4xl text-white mb-4">Falha de Conexão</h1>
          <p className="text-sm text-white/40 mb-8 font-light">{error}</p>
          <button
            onClick={() => void fetchCategories()}
            className="h-14 px-10 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs transition-all hover:scale-[1.05]"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white/20 font-sans">
      <Navbar onNavigate={handleNavigate} onOpenSavedEbook={(toolKey, categoryKey) => {
        const cat = categories.find(c => c.key === categoryKey);
        const tool = cat?.tools.find(t => t.key === toolKey);
        if (tool && cat) setEbookModal({ tool, category: cat });
      }} />

      {/* Hero */}
      <div className="relative pt-20 pb-16 sm:pt-24 sm:pb-24 px-6 text-center overflow-hidden">
        {/* Glass Orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[140px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-smooth mb-10 border border-white/5">
            <Sparkles className="w-3 h-3 text-white/50" />
            <span className="text-[10px] font-bold text-white/70 tracking-[0.2em] uppercase">Curadoria Elite 2026</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-serif-display text-white tracking-tighter leading-[0.9] mb-8">
            Arsenal de <em className="italic font-normal">Inteligência</em>.
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-white/40 leading-relaxed mb-12 font-light">
            O guia definitivo com as ferramentas de IA mais poderosas para infoprodutores que buscam domínio absoluto e escala brutal.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000" />
            <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden">
              <Search size={20} className="absolute left-6 text-white/20" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar no ecossistema..."
                className="w-full pl-16 pr-8 py-5 bg-transparent text-white placeholder:text-white/20 focus:outline-none text-lg font-light"
              />
            </div>
          </div>

          {/* Filters & Pro CTA */}
          <div className="flex flex-col items-center gap-6 mt-10">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setFreeOnly(v => !v)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  freeOnly
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                {freeOnly ? '✓ Somente Gratuitas' : 'Filtrar Gratuitas'}
              </button>

              {(!user || user.plano !== 'Pro') && (
                <button
                  onClick={() => setPage('pro')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-amber text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  ⚡ Seja Pro · R${plan.price}
                </button>
              )}
            </div>

            {(!user || user.plano !== 'Pro') && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                <Lock size={12} className="shrink-0" /> E-books exclusivos para assinantes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      {!searchQuery && <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} categories={categories} />}

      {/* Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Intro Panel */}
        {!searchQuery && category && (
          <div className="glass-smooth border border-white/5 rounded-[3rem] p-8 sm:p-12 mb-12 flex flex-col lg:flex-row justify-between gap-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl font-serif-display text-white mb-6 leading-tight">{category.introTitle}</h2>
              <p className="text-white/40 text-base font-light leading-relaxed mb-8">{category.introText}</p>
              <div className="flex flex-wrap gap-3">
                {category.whenTags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/5 border border-white/5">{tag}</span>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex lg:flex-col gap-4 overflow-x-auto lg:shrink-0 pb-2 lg:pb-0 no-scrollbar">
              {category.stats.map((s, i) => (
                <div key={i} className="glass-smooth border border-white/5 rounded-2xl p-6 text-center min-w-[140px] hover:bg-white/5 transition-colors">
                  <div className="text-3xl font-serif-display text-white mb-1">{s.num}</div>
                  <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && (
          <div className="mb-8 flex items-center gap-3">
            <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{filteredTools.length} resultado(s) para</span>
            <span className="text-white font-serif-display text-xl italic">"{searchQuery}"</span>
          </div>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map(({ tool, category: cat }) => (
            <ToolCard key={tool.key} tool={tool} category={cat} onOpenEbook={() => handleOpenEbook(tool, cat)} />
          ))}
        </div>

        {/* Prompts Section */}
        {!searchQuery && category && (
          <div className="mt-24">
            <PromptsLibrary category={category} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/5 bg-black text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="text-[10px] font-bold text-white/10 uppercase tracking-[0.5em]">
            &copy; 2026 CONVERT CLUB · ARSENAL ESTRATÉGICO
          </div>
          <p className="text-[9px] text-white/5 uppercase tracking-[0.2em] max-w-xl leading-relaxed">
            AdAI · Guia de Inteligência Artificial para Empreendedores · Todos os links são externos e oficiais de cada plataforma
          </p>
        </div>
      </footer>

      {/* Ebook Modal */}
      {ebookModal && (
        <EbookModal tool={ebookModal.tool} category={ebookModal.category} isOpen={true} onClose={() => setEbookModal(null)} />
      )}
    </div>
  );
}
