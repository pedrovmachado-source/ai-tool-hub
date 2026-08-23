import { useEffect, useState } from 'react';
import Meta from '@/components/Meta';
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
import FbAccountsPage from '@/components/FbAccountsPage';
import SiteCreationPage from '@/components/SiteCreationPage';
import PromptsLibrary from '@/components/PromptsLibrary';
import UserProfile from '@/components/UserProfile';
import UnderConstruction from '@/components/UnderConstruction';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Lock, Sparkles, ArrowRight } from 'lucide-react';
import type { Tool, Category } from '@/data/tools-data';
import { isPaid } from '@/lib/plan';

type VerifyAdminResponse = { isAdmin?: boolean };

export default function Index({ initialPage: propPage, initialCategory: propCat }: { initialPage?: string | null; initialCategory?: string | null }) {
  const navigate = useNavigate();
  const { plan } = usePlanConfig();
  const { user, isAdmin } = useAuth();
  const initialPage = propPage || (typeof window !== 'undefined' ? sessionStorage.getItem('adai:initialPage') : null);
  const [page, setPage] = useState(initialPage || 'home');
  const needsCategories = !['site-creation', 'fb-accounts', 'creative-edit', 'copywrite', 'offers', 'pro', 'lessons'].includes(page);
  const { categories, loading, error, fetchCategories } = useCategories({ enabled: needsCategories });
  
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
      navigate('/bloqueado', { replace: true });
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
    
    if (target === 'auth') { navigate('/auth'); return; }
    if (['copywrite', 'site-creation', 'creative-edit', 'fb-accounts'].includes(target)) {
      navigate(`/${target}`);
      return;
    }
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
        setServerAdminVerified(!!(data as VerifyAdminResponse | null)?.isAdmin);
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
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-muted-foreground">Verificando permissões…</div>
        </div>
      );
    }
    if (isAdmin || serverAdminVerified) {
      return <AdminPanel onBack={() => { setServerAdminVerified(null); navigate('/menu'); }} onCategoriesChanged={fetchCategories} />;
    }
    // Not an admin — bounce back
    navigate('/menu');
    return null;
  }
  if (page === 'pro') return <ProPage onBack={() => navigate('/menu')} onNavigate={handleNavigate} />;
  if (page === 'lessons') return <LessonsPage onBack={() => navigate('/menu')} />;
  
  const constructionPages = ['copywrite'];
  
  if (page === 'site-creation') {
    return <SiteCreationPage onBack={() => navigate('/menu')} />;
  }
  
  if (page === 'fb-accounts') {
    return <FbAccountsPage onBack={() => navigate('/menu')} />;
  }

  if (page === 'creative-edit') {
    return <ContentSectionPage slug={page} onBack={() => navigate('/menu')} onUpgrade={() => setPage('pro')} />;
  }

  if (constructionPages.includes(page)) {
    return (
      <UnderConstruction onBack={() => navigate('/menu')}>
        <ContentSectionPage slug={page} onBack={() => navigate('/menu')} onUpgrade={() => setPage('pro')} />
      </UnderConstruction>
    );
  }
  
  if (page === 'offers') {
    return <ContentSectionPage slug={page} onBack={() => navigate('/menu')} onUpgrade={() => setPage('pro')} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <h1 className="font-serif-display text-3xl text-foreground mb-3">Não foi possível carregar o site</h1>
          <p className="text-sm text-muted-foreground mb-5">{error}</p>
          <button
            onClick={() => void fetchCategories()}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white/20 font-sans overflow-x-hidden pt-[92px] sm:pt-[116px]">
      <Meta title="Ferramentas de IA | Convert Club" description="Descubra as melhores IAs para turbinar seu negócio com e-books e prompts exclusivos." />
      <header>
        <Navbar onNavigate={handleNavigate} onOpenSavedEbook={(toolKey, categoryKey) => {
          const cat = categories.find(c => c.key === categoryKey);
          const tool = cat?.tools.find(t => t.key === toolKey);
          if (tool && cat) setEbookModal({ tool, category: cat });
        }} />
      </header>

      {/* Hero */}
      <div className="relative px-6 py-16 sm:py-20 border-b border-white/5">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] rounded-full bg-white/5 blur-[120px]" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[80%] rounded-full bg-white/5 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg glass-smooth mb-6 border border-white/5">
            <Sparkles className="w-3 h-3 text-white/50" />
            <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">Curadoria 2026</span>
          </div>

          <h1 className="font-serif-display text-4xl md:text-6xl leading-[1.05] tracking-tight text-white mb-6">
            Descubra as melhores <em className="italic font-normal">IAs</em><br className="hidden sm:inline" /> para escalar seu negócio
          </h1>
          <p className="text-white/40 text-base sm:text-lg max-w-2xl mx-auto font-light">
            Guia completo com as ferramentas de inteligência artificial mais poderosas para empreendedores. Com e-books, prompts prontos e passo a passo.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto mt-10 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Buscar ferramentas de IA"
              placeholder="Buscar ferramentas de IA..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm glass-smooth text-white placeholder:text-white/25 border border-white/10 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Free filter toggle */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              onClick={() => setFreeOnly(v => !v)}
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-lg border transition-all duration-500 ${
                freeOnly
                  ? 'bg-white text-black border-white'
                  : 'glass-smooth text-white/50 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              {freeOnly ? 'Só IAs 100% gratuitas' : 'Filtrar IAs gratuitas'}
            </button>
          </div>

          {(!user || !isPaid(user.plano)) && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="flex items-center justify-center gap-2 text-[12px] sm:text-[13px] text-white/30 text-center px-2 font-light">
                <Lock size={14} className="shrink-0" /> E-books completos exclusivos para assinantes Elite
              </div>
              <button
                onClick={() => setPage('pro')}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] px-6 py-3 rounded-lg glass-smooth border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-500"
              >
                Seja Elite · R${plan.price} {plan.period === 'vitalicio' ? '(vitalício)' : ''}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {!searchQuery && <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} categories={categories} />}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Intro Panel */}
        {!searchQuery && category && (
          <div className="glass-smooth border border-white/5 rounded-[2.5rem] p-8 sm:p-10 mb-10 flex flex-col md:flex-row justify-between md:items-start gap-8">
            <div className="min-w-0">
              <h2 className="font-serif-display text-2xl sm:text-3xl text-white mb-3">{category.introTitle}</h2>
              <p className="text-sm text-white/30 leading-relaxed font-light max-w-[580px]">{category.introText}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {category.whenTags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-white/40">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex md:flex-col gap-3 md:shrink-0 overflow-x-auto md:overflow-visible -mx-1 px-1 md:mx-0 md:px-0">
              {category.stats.map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-center min-w-[100px] shrink-0">
                  <div className="text-xl font-serif-display text-white">{s.num}</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">{filteredTools.length} resultado(s) para "{searchQuery}"</p>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(({ tool, category: cat }) => (
            <ToolCard key={tool.key} tool={tool} category={cat} onOpenEbook={() => handleOpenEbook(tool, cat)} />
          ))}
        </div>

        {/* Prompts Section */}
        {!searchQuery && category && (
          <PromptsLibrary category={category} />
        )}
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="text-[9px] text-white/10 font-bold uppercase tracking-[0.5em]">
          &copy; 2026 CONVERT CLUB · BUILT FOR THE 1%
        </div>
      </footer>

      {/* Ebook Modal */}
      {ebookModal && (
        <EbookModal tool={ebookModal.tool} category={ebookModal.category} isOpen={true} onClose={() => setEbookModal(null)} />
      )}
    </div>
  );
}

