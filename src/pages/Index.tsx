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
import UserProfile from '@/components/UserProfile';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Lock, Sparkles, Zap } from 'lucide-react';
import type { Tool, Category } from '@/data/tools-data';
import { isPaid } from '@/lib/plan';

export default function Index({ initialPage: propPage, initialCategory: propCat }: { initialPage?: string | null; initialCategory?: string | null }) {
  const navigate = useNavigate();
  const { plan } = usePlanConfig();
  const { user, isAdmin } = useAuth();
  const { categories, loading, error, fetchCategories } = useCategories();
  
  const initialPage = propPage || (typeof window !== 'undefined' ? sessionStorage.getItem('adai:initialPage') : null);
  const [page, setPage] = useState(initialPage || 'home');
  
  const initialCat = propCat || (typeof window !== 'undefined' ? sessionStorage.getItem('adai:initialCategory') : null);
  const [activeCategory, setActiveCategory] = useState(initialCat || 'texto');
  const [searchQuery, setSearchQuery] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [ebookModal, setEbookModal] = useState<{ tool: Tool; category: Category } | null>(null);
  const [serverAdminVerified, setServerAdminVerified] = useState<boolean | null>(null);
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);

  useEffect(() => {
    if (propPage) setPage(propPage);
  }, [propPage]);

  useEffect(() => {
    if (propCat) setActiveCategory(propCat);
  }, [propCat]);

  useEffect(() => {
    if (user?.abuseBlocked) {
      navigate('/bloqueado');
      return;
    }
    if (initialCat) sessionStorage.removeItem('adai:initialCategory');
    if (initialPage) sessionStorage.removeItem('adai:initialPage');
  }, [user, navigate, initialCat, initialPage]);

  const handleNavigate = (target: string) => {
    if (target === 'home') { navigate('/'); return; }
    if (target === 'profile') { navigate('/perfil'); return; }
    if (target === 'ofertas' || target === 'offers') { navigate('/ofertas'); return; }
    if (target === 'mentorias') { navigate('/mentorias'); return; }
    if (target === 'alunos') { navigate('/alunos'); return; }
    setPage(target);
  };

  useEffect(() => {
    if (categories.length > 0 && !categories.some(c => c.key === activeCategory)) {
      setActiveCategory(categories[0].key);
    }
  }, [activeCategory, categories]);

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
    const canAccess = isAdmin || isPaid(user?.plano);
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
          <div className="text-white/20 font-bold uppercase tracking-widest animate-pulse">Verificando permissões…</div>
        </div>
      );
    }
    if (isAdmin || serverAdminVerified) {
      return <AdminPanel onBack={() => { setServerAdminVerified(null); navigate('/menu'); }} onCategoriesChanged={fetchCategories} />;
    }
    navigate('/menu');
    return null;
  }
  if (page === 'pro') return <ProPage onBack={() => navigate('/menu')} onNavigate={handleNavigate} />;
  if (page === 'lessons') return <LessonsPage onBack={() => navigate('/menu')} />;
  if (page === 'site-creation') return <SiteCreationPage onBack={() => navigate('/menu')} />;
  if (page === 'offers' || page === 'creative-edit') {
    return <ContentSectionPage slug={page} onBack={() => navigate('/menu')} onUpgrade={() => setPage('pro')} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white/20 font-bold uppercase tracking-widest animate-pulse">Carregando Ecossistema…</div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="max-w-md text-center glass-morphism p-12 rounded-[2rem] border border-white/5">
          <h1 className="font-serif-display text-3xl text-white mb-6">Falha na Conexão</h1>
          <p className="text-sm text-white/40 mb-8 font-light">{error}</p>
          <button
            onClick={() => void fetchCategories()}
            className="inline-flex items-center justify-center rounded-full bg-white text-black px-8 py-3 text-sm font-bold transition-all hover:scale-105"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-[72px] sm:pt-[88px] bg-black text-white selection:bg-brand-violet/20 font-sans">
      <Navbar onNavigate={handleNavigate} onOpenSavedEbook={(toolKey, categoryKey) => {
        const cat = categories.find(c => c.key === categoryKey);
        const tool = cat?.tools.find(t => t.key === toolKey);
        if (tool && cat) setEbookModal({ tool, category: cat });
      }} />

      <main className="flex-1 relative">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-violet/5 blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] rounded-full bg-brand-emerald/5 blur-[100px]" />
        </div>

        <div className="relative z-10 py-16 sm:py-24 px-6 text-center border-b border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 glass-morphism text-brand-emerald text-[10px] sm:text-xs px-4 py-1.5 rounded-full mb-8 border border-white/5 animate-fade-in">
            <Sparkles size={12} />
            <span className="font-bold tracking-widest uppercase">Curadoria Elite 2026</span>
          </div>
          
          <h1 className="font-serif-display text-4xl sm:text-6xl leading-[1.1] text-white tracking-tight mb-8 max-w-4xl mx-auto animate-slide-up">
            Inteligência Artificial para <br />
            <em className="gradient-text not-italic">Resultados Inegociáveis</em>
          </h1>
          
          <p className="text-base sm:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed mb-12 font-light animate-slide-up [animation-delay:200ms]">
            O guia definitivo com as ferramentas mais poderosas do mercado digital. E-books exclusivos, prompts validados e estratégias de implementação.
          </p>

          <div className="max-w-xl mx-auto relative animate-slide-up [animation-delay:400ms]">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, função ou categoria..."
              className="w-full pl-14 pr-6 py-5 rounded-2xl text-base bg-white/5 text-white placeholder:text-white/10 border border-white/5 focus:outline-none focus:border-brand-violet/50 focus:bg-white/10 transition-all backdrop-blur-md"
            />
          </div>

          <div className="flex flex-col items-center gap-6 mt-12 animate-slide-up [animation-delay:600ms]">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setFreeOnly(v => !v)}
                className={`inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all ${
                  freeOnly
                    ? 'bg-brand-emerald text-black border-brand-emerald shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-white/5 text-white/40 border-white/5 hover:border-brand-emerald/50 hover:text-brand-emerald'
                }`}
              >
                {freeOnly ? '✓ IAs 100% Gratuitas' : 'Filtrar IAs 100% Gratuitas'}
              </button>
            </div>

            {(!user || !isPaid(user.plano)) && (
              <div className="flex flex-col items-center gap-4 py-6 px-8 rounded-3xl glass-morphism border border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-white/30 uppercase tracking-[0.2em]">
                  <Lock size={12} /> Acesso Elite Restrito
                </div>
                <button
                  onClick={() => setPage('pro')}
                  className="inline-flex items-center gap-3 text-sm font-bold px-8 py-4 rounded-full bg-white text-black hover:bg-white/90 transition-all hover:scale-105 hover-glow"
                >
                  <Zap size={16} /> Tornar-se Membro Elite
                </button>
              </div>
            )}
          </div>
        </div>

        {!searchQuery && (
          <div className="sticky top-[72px] sm:top-[88px] z-[90] bg-black/60 backdrop-blur-xl border-b border-white/5">
            <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} categories={categories} />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-16 flex-1 w-full">
          {!searchQuery && category && (
            <div className="glass-morphism rounded-[3rem] p-10 sm:p-14 mb-16 flex flex-col lg:flex-row justify-between lg:items-center gap-10 border border-white/5">
              <div className="max-w-2xl text-left">
                <h2 className="font-serif-display text-3xl sm:text-4xl text-white mb-6 tracking-tight">{category.introTitle}</h2>
                <p className="text-base text-white/40 leading-relaxed font-light mb-8">{category.introText}</p>
                <div className="flex flex-wrap gap-2">
                  {category.whenTags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold px-4 py-2 rounded-full glass-morphism text-white/30 uppercase tracking-widest border border-white/5">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex lg:flex-col gap-4 overflow-x-auto pb-4 lg:pb-0 lg:shrink-0">
                {category.stats.map((s, i) => (
                  <div key={i} className="glass-morphism rounded-2xl px-8 py-5 text-center min-w-[140px] border border-white/5">
                    <div className="text-2xl font-serif-display text-white">{s.num}</div>
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && (
            <div className="mb-12">
              <h2 className="text-white/40 text-sm font-bold uppercase tracking-[0.2em]">{filteredTools.length} resultados encontrados</h2>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {filteredTools.map(({ tool, category: cat }) => (
              <ToolCard key={tool.key} tool={tool} category={cat} onOpenEbook={() => handleOpenEbook(tool, cat)} />
            ))}
          </div>

          {!searchQuery && category && (
            <div className="mt-32">
              <PromptsLibrary category={category} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-black/40 backdrop-blur-xl py-20 px-6 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <div className="font-serif-display text-2xl text-white tracking-tighter opacity-50">CONVERT CLUB</div>
          <div className="text-[9px] text-white/10 font-bold uppercase tracking-[0.5em]">
            &copy; 2026 CONVERT CLUB · BUILT FOR THE 1%
          </div>
        </div>
      </footer>

      {ebookModal && (
        <EbookModal tool={ebookModal.tool} category={ebookModal.category} isOpen={true} onClose={() => setEbookModal(null)} />
      )}
    </div>
  );
}
