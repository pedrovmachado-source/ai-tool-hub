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
import SiteCreationPage from '@/components/SiteCreationPage';
import PromptsLibrary from '@/components/PromptsLibrary';
import UserProfile from '@/components/UserProfile';
import UnderConstruction from '@/components/UnderConstruction';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Lock } from 'lucide-react';
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
    if (target === 'comprar-cash') { navigate('/comprar-cash'); return; }
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
  
  const constructionPages = ['creative-edit', 'copywrite'];
  
  if (page === 'site-creation') {
    return <SiteCreationPage onBack={() => navigate('/menu')} />;
  }
  
  if (page === 'fb-accounts') {
    return <ContentSectionPage slug={page} onBack={() => navigate('/menu')} onUpgrade={() => setPage('pro')} />;
  }

  if (constructionPages.includes(page)) {
    return (
      <UnderConstruction>
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
    <div className="flex flex-col min-h-screen pt-[100px] sm:pt-[116px]">
      <Meta title="Ferramentas de IA | Convert Club" description="Descubra as melhores IAs para turbinar seu negócio com e-books e prompts exclusivos." />
      <header>
        <Navbar onNavigate={handleNavigate} onOpenSavedEbook={(toolKey, categoryKey) => {
          const cat = categories.find(c => c.key === categoryKey);
          const tool = cat?.tools.find(t => t.key === toolKey);
          if (tool && cat) setEbookModal({ tool, category: cat });
        }} />
      </header>

      {/* Hero */}
      <div className="bg-navy py-10 sm:py-14 px-4 sm:px-8 text-center border-b border-white/5">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-muted-foreground text-[10px] sm:text-xs px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-4 sm:mb-5">
          ✨ Curadoria atualizada em 2026
        </div>
        <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl leading-tight text-primary-foreground tracking-tight mb-3">
          Descubra as melhores <em className="text-white italic">IAs</em> para<br className="hidden sm:inline" /> turbinar seu negócio
        </h2>
        <p className="text-[13px] sm:text-[15px] text-muted-foreground/60 max-w-[520px] mx-auto leading-relaxed">
          Guia completo com as ferramentas de inteligência artificial mais poderosas para empreendedores. Com e-books, prompts prontos e passo a passo.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto mt-5 sm:mt-6 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Buscar ferramentas de IA"
            placeholder="Buscar ferramentas de IA..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-primary-foreground/10 text-primary-foreground placeholder:text-muted-foreground/40 border border-primary-foreground/10 focus:outline-none focus:border-white/40"
          />
        </div>

        {/* Free filter toggle */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setFreeOnly(v => !v)}
            className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs px-3 sm:px-3.5 py-1.5 rounded-full border transition-all ${
              freeOnly
                ? 'bg-white text-navy border-white shadow-brand-sm'
                : 'bg-primary-foreground/5 text-muted-foreground border-primary-foreground/15 hover:border-white/50 hover:text-white'
            }`}
          >
            🆓 {freeOnly ? 'Mostrando só IAs 100% gratuitas' : 'Filtrar IAs 100% gratuitas'}
          </button>
        </div>

        {(!user || !isPaid(user.plano)) && (
          <div className="flex flex-col items-center gap-3 mt-5">
            <div className="flex items-center justify-center gap-2 text-[12px] sm:text-[13px] text-muted-foreground/40 text-center px-2">
              <Lock size={14} className="shrink-0" /> E-books completos exclusivos para assinantes Elite
            </div>
            <button
              onClick={() => setPage('pro')}
              className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full bg-white/10 border border-white/25 text-white hover:bg-white/20 transition-all"
            >
              ⚡ Seja Elite · R${plan.price} {plan.period === 'vitalicio' ? '(acesso vitalício)' : ''}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {!searchQuery && <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} categories={categories} />}

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {/* Intro Panel */}
        {!searchQuery && category && (
          <div className="bg-card border border-border rounded-xl p-5 sm:p-7 mb-6 sm:mb-7 flex flex-col md:flex-row justify-between md:items-start gap-5 md:gap-8">
            <div className="min-w-0">
              <h2 className="font-serif-display text-xl sm:text-2xl mb-2">{category.introTitle}</h2>
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-6 sm:leading-7 max-w-[580px]">{category.introText}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {category.whenTags.map(tag => (
                  <span key={tag} className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full border border-border text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex md:flex-col gap-2 md:shrink-0 overflow-x-auto md:overflow-visible -mx-1 px-1 md:mx-0 md:px-0">
              {category.stats.map((s, i) => (
                <div key={i} className="bg-secondary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-center min-w-[90px] sm:min-w-[100px] shrink-0">
                  <div className="text-base sm:text-xl font-medium">{s.num}</div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && (
          <p className="text-sm text-muted-foreground mb-4">{filteredTools.length} resultado(s) para "{searchQuery}"</p>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
      <footer className="bg-navy py-10 px-4 mt-12 border-t border-white/5">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center gap-8">

          
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground/40">AdAI · Guia de Inteligência Artificial para Empreendedores</p>
            <p className="text-[10px] text-muted-foreground/20">Todos os links são externos e oficiais de cada plataforma</p>
          </div>
        </div>
      </footer>

      {/* Ebook Modal */}
      {ebookModal && (
        <EbookModal tool={ebookModal.tool} category={ebookModal.category} isOpen={true} onClose={() => setEbookModal(null)} />
      )}
    </div>
  );
}
