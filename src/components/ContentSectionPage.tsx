import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { meetsMinPlan } from '@/lib/plan';
import { ArrowLeft, Play, FileText, Image as ImageIcon, Lock, FileText as TextIcon, ShoppingCart, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PdfModal, VideoModal, ImageModal } from '@/lib/lessonViewers';
import OfferModal from './OfferModal';
import PurchasedAccountsModal from './PurchasedAccountsModal';

interface Section {
  slug: string;
  title: string;
  description: string;
  intro: string;
  cover_url: string | null;
  min_plan: 'Free' | 'Elite' | 'Elite Plus' | 'Max';
}

interface Item {
  id: string;
  section_slug: string;
  topic: string | null;
  title: string;
  description: string;
  kind: 'video' | 'pdf' | 'image' | 'text';
  video_url: string | null;
  pdf_path: string | null;
  image_url: string | null;
  body: string | null;
  example_url: string | null;
  buy_url: string | null;
  sort_order: number;
}

export default function ContentSectionPage({ slug, onBack, onUpgrade }: { slug: string; onBack: () => void; onUpgrade: () => void }) {
  const { user, isAdmin } = useAuth();
  const [section, setSection] = useState<Section | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState<Item | null>(null);
  const [pdf, setPdf] = useState<Item | null>(null);
  const [image, setImage] = useState<Item | null>(null);
  const [offer, setOffer] = useState<Item | null>(null);
  const [showPurchasedModal, setShowPurchasedModal] = useState(false);
  const isOffers = slug === 'offers';

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [sRes, iRes] = await Promise.all([
          supabase.from('content_sections').select('*').eq('slug', slug).maybeSingle(),
          supabase.from('content_items').select('*').eq('section_slug', slug).order('sort_order'),
        ]);
        if (!active) return;
        if (sRes.data) setSection(sRes.data as Section);
        if (iRes.data) setItems(iRes.data as Item[]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [slug]);

  const canAccess = isAdmin || (section && meetsMinPlan(user?.plano, section.min_plan));

  const topics = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => { if (i.topic) set.add(i.topic); });
    return Array.from(set);
  }, [items]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando…</div>;
  }
  if (!section) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-muted-foreground">Seção não encontrada.</p>
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Voltar</button>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-smooth p-12 rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <Lock size={24} className="text-white/10" />
          </div>
          <h2 className="text-3xl font-serif-display mb-4">{section.title}</h2>
          <p className="text-white/40 font-light mb-8">
            Este conteúdo é reservado para membros <strong className="text-white">{section.min_plan}</strong>. Eleve seu nível para acessar.
          </p>
          <div className="flex flex-col gap-4">
            <button onClick={() => onUpgrade()} className="w-full py-4 rounded-full bg-white text-black font-bold hover:scale-[1.02] transition-transform">
              Fazer Upgrade Agora
            </button>
            <button onClick={onBack} className="w-full py-4 rounded-full border border-white/5 text-white/40 text-sm font-bold hover:bg-white/5 transition-colors">
              Voltar ao Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const grouped = topics.length > 0
    ? Object.fromEntries(topics.map(t => [t, items.filter(i => i.topic === t)]))
    : null;
  const untopiced = topics.length > 0 ? items.filter(i => !i.topic) : items;

  const renderItems = (list: Item[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map(i => (
        <ItemCard key={i.id} item={i}
          isOffers={isOffers}
          onVideo={() => setVideo(i)}
          onPdf={() => setPdf(i)}
          onImage={() => setImage(i)}
          onOffer={() => setOffer(i)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 font-sans overflow-x-hidden">
      {/* Header Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 px-6 border-b border-white/5 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <button onClick={onBack} className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth border border-white/5 text-white/50 hover:text-white transition-colors group">
              <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Voltar ao Menu</span>
            </button>

            {slug === 'fb-accounts' && (
              <button 
                onClick={() => setShowPurchasedModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 text-brand-blue-medium hover:bg-brand-blue/30 transition-all group"
              >
                <ShoppingCart size={14} className="text-brand-blue-medium" />
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase">Acessar Contas Compradas</span>
              </button>
            )}
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth mb-6 border border-white/5">
            {slug === 'copywrite' ? <TextIcon className="w-3 h-3 text-white/50" /> : 
             slug === 'fb-accounts' ? <ShoppingCart className="w-3 h-3 text-white/50" /> :
             <ImageIcon className="w-3 h-3 text-white/50" />}
            <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">
              {slug === 'copywrite' ? 'Copywriting de Elite' : 
               slug === 'fb-accounts' ? 'Contas & BMs' :
               'Visual Assets'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif-display tracking-tight text-white mb-6 leading-tight">
            {section.title.split(' ').map((word, i) => (
              i === section.title.split(' ').length - 1 ? <em key={i} className="italic font-normal"> {word}</em> : <span key={i}>{word} </span>
            ))}
          </h1>
          <p className="text-white/40 text-lg max-w-2xl font-light leading-relaxed">
            {section.intro || section.description}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhum conteúdo disponível ainda.</p>
        ) : grouped ? (
          <Tabs defaultValue={topics[0]} className="w-full">
            <TabsList className="inline-flex h-auto p-1 bg-white/5 rounded-full mb-12 border border-white/5">
              {topics.map(t => (
                <TabsTrigger 
                  key={t} 
                  value={t}
                  className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-black transition-all"
                >
                  {t}
                </TabsTrigger>
              ))}
              {untopiced.length > 0 && (
                <TabsTrigger value="__other" className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-black transition-all">
                  Outros
                </TabsTrigger>
              )}
            </TabsList>
            {topics.map(t => (
              <TabsContent key={t} value={t} className="mt-4">
                {renderItems(grouped[t])}
              </TabsContent>
            ))}
            {untopiced.length > 0 && (
              <TabsContent value="__other" className="mt-4">{renderItems(untopiced)}</TabsContent>
            )}
          </Tabs>
        ) : (
          renderItems(items)
        )}
      </div>

      {video && video.video_url && (
        <VideoModal title={video.title} url={video.video_url} onClose={() => setVideo(null)} />
      )}
      {pdf && pdf.pdf_path && (
        <PdfModal title={pdf.title} path={pdf.pdf_path} onClose={() => setPdf(null)} />
      )}
      {image && image.image_url && (
        <ImageModal title={image.title} url={image.image_url} onClose={() => setImage(null)} />
      )}
      <PurchasedAccountsModal isOpen={showPurchasedModal} onClose={() => setShowPurchasedModal(false)} />
    </div>
  );
}

function ItemCard({ item, isOffers, onVideo, onPdf, onImage, onOffer }: {
  item: Item;
  isOffers?: boolean;
  onVideo: () => void;
  onPdf: () => void;
  onImage: () => void;
  onOffer?: () => void;
}) {
  const handleBuy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Use the Price ID stored in item.body (fallback to a dummy if empty)
      const priceId = (item.body && item.body.startsWith('price_')) 
        ? item.body 
        : 'price_1Tc4wzQP3tL0cIWnFFTaNhgJ';
        
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, mode: 'payment' }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const handleClick = () => {
    if (isOffers && onOffer) return onOffer();
    if (item.kind === 'video') return onVideo();
    if (item.kind === 'pdf') return onPdf();
    if (item.kind === 'image') return onImage();
  };

  const icon = item.kind === 'video' ? <Play size={16} className="text-brand-blue-medium" />
    : item.kind === 'pdf' ? <FileText size={16} className="text-brand-green" />
    : item.kind === 'image' ? <ImageIcon size={16} className="text-brand-amber" />
    : item.section_slug === 'fb-accounts' ? <ShoppingCart size={16} className="text-brand-blue-medium" />
    : <TextIcon size={16} className="text-muted-foreground" />;

  if (item.kind === 'text') {
    return (
      <div className="group relative p-8 glass-smooth hover:bg-white/10 transition-all duration-500 rounded-[2.5rem] border border-white/5 h-full flex flex-col">
        <div className="w-12 h-12 bg-white/5 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
          {icon}
        </div>
        <h4 className="text-xl font-serif-display text-white mb-4">{item.title}</h4>
        {item.description && (
          <p className={`mb-4 leading-relaxed ${
            item.section_slug === 'fb-accounts' 
              ? 'text-brand-blue-medium text-lg font-bold' 
              : 'text-white/30 text-xs font-light'
          }`}>
            {item.description}
          </p>
        )}

        {item.section_slug === 'fb-accounts' && (
          <button 
            onClick={handleBuy}
            className="w-full py-3 px-6 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Comprar Agora
          </button>
        )}

      </div>
    );
  }

  return (
    <div className="group relative text-left glass-smooth hover:bg-white/10 transition-all duration-500 rounded-[2.5rem] border border-white/5 flex flex-col h-full overflow-hidden">
      {item.kind === 'image' && item.image_url && (
        <div className="w-full aspect-video overflow-hidden mb-6">
           <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        </div>
      )}
      
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            {icon}
          </div>
          <h4 className="text-lg font-serif-display text-white">{item.title}</h4>
        </div>
        
        {item.description && <p className="text-white/30 text-xs font-light leading-relaxed mb-6">{item.description}</p>}
        
        {item.section_slug === 'fb-accounts' ? (
          <button 
            onClick={handleBuy}
            className="w-full py-3 px-6 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all mt-auto"
          >
            Comprar Agora
          </button>
        ) : (
          <button onClick={handleClick} className="mt-auto pt-6 flex items-center text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] group/btn">
             Ver Detalhes <ArrowRight size={12} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
