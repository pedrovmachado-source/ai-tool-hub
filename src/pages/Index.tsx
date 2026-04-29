import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import ToolCard from '@/components/ToolCard';
import EbookModal from '@/components/EbookModal';
import ProPage from '@/components/ProPage';
import AdminPanel from '@/components/AdminPanel';
import LessonsPage from '@/components/LessonsPage';
import PromptsLibrary from '@/components/PromptsLibrary';
import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Lock } from 'lucide-react';
import type { Tool, Category } from '@/data/tools-data';

export default function Index() {
  const navigate = useNavigate();
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
    if (initialCat) sessionStorage.removeItem('adai:initialCategory');
    if (initialPage) sessionStorage.removeItem('adai:initialPage');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-muted-foreground">Verificando permissões…</div>
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
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigate={handleNavigate} onOpenSavedEbook={(toolKey, categoryKey) => {
        const cat = categories.find(c => c.key === categoryKey);
        const tool = cat?.tools.find(t => t.key === toolKey);
        if (tool && cat) setEbookModal({ tool, category: cat });
      }} />

      {/* Hero */}
      <div className="bg-navy py-14 px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-blue/15 border border-brand-blue/30 text-brand-blue-medium text-xs px-4 py-1.5 rounded-full mb-5">
          ✨ Curadoria atualizada em 2026
        </div>
        <h1 className="font-serif-display text-4xl leading-tight text-primary-foreground tracking-tight mb-3">
          Descubra as melhores <em className="text-brand-blue-medium italic">IAs</em> para<br />turbinar seu negócio
        </h1>
        <p className="text-[15px] text-muted-foreground/60 max-w-[520px] mx-auto leading-relaxed">
          Guia completo com as ferramentas de inteligência artificial mais poderosas para empreendedores. Com e-books, prompts prontos e passo a passo.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto mt-6 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar ferramentas de IA..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-primary-foreground/10 text-primary-foreground placeholder:text-muted-foreground/40 border border-primary-foreground/10 focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Free filter toggle */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setFreeOnly(v => !v)}
            className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border transition-all ${
              freeOnly
                ? 'bg-brand-green text-primary-foreground border-brand-green shadow-brand-sm'
                : 'bg-primary-foreground/5 text-muted-foreground border-primary-foreground/15 hover:border-brand-green/50 hover:text-brand-green'
            }`}
          >
            🆓 {freeOnly ? 'Mostrando só IAs 100% gratuitas' : 'Filtrar IAs 100% gratuitas'}
          </button>
        </div>

        {!user && (
          <div className="flex items-center justify-center gap-2 mt-5 text-[13px] text-muted-foreground/40">
            <Lock size={14} /> E-books completos exclusivos para assinantes Pro
          </div>
        )}
      </div>

      {/* Tabs */}
      {!searchQuery && <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} categories={categories} />}

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-6 py-8 flex-1">
        {/* Intro Panel */}
        {!searchQuery && category && (
          <div className="bg-card border border-border rounded-xl p-7 mb-7 flex justify-between items-start gap-8">
            <div>
              <h2 className="font-serif-display text-2xl mb-2">{category.introTitle}</h2>
              <p className="text-sm text-muted-foreground leading-7 max-w-[580px]">{category.introText}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {category.whenTags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {category.stats.map((s, i) => (
                <div key={i} className="bg-secondary rounded-lg px-4 py-2.5 text-center min-w-[100px]">
                  <div className="text-xl font-medium">{s.num}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && (
          <p className="text-sm text-muted-foreground mb-4">{filteredTools.length} resultado(s) para "{searchQuery}"</p>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <footer className="bg-navy py-8 text-center mt-12">
        <p className="text-xs text-muted-foreground/40">AdAI · Guia de Inteligência Artificial para Empreendedores · Todos os links são externos e oficiais de cada plataforma</p>
      </footer>

      {/* Ebook Modal */}
      {ebookModal && (
        <EbookModal tool={ebookModal.tool} category={ebookModal.category} isOpen={true} onClose={() => setEbookModal(null)} />
      )}
    </div>
  );
}
