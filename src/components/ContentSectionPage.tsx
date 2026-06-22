import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { meetsMinPlan } from '@/lib/plan';
import { ArrowLeft, Play, FileText, Image as ImageIcon, Lock, FileText as TextIcon, ShoppingCart, ArrowRight, Wallet, Sparkles, ExternalLink, Check, Plus } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PdfModal, VideoModal, ImageModal, getEmbedUrl } from '@/lib/lessonViewers';
import OfferModal from './OfferModal';
import PurchasedAccountsModal from './PurchasedAccountsModal';
import PaymentSelectionModal from './PaymentSelectionModal';
import { toast } from 'sonner';

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
  examples?: { label: string; url: string }[] | null;
}

function toEmbedUrl(url: string): string {
  // Google Drive: /file/d/{id}/view -> /file/d/{id}/preview
  const gdrive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (gdrive) return `https://drive.google.com/file/d/${gdrive[1]}/preview`;
  const gdriveOpen = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (gdriveOpen) return `https://drive.google.com/file/d/${gdriveOpen[1]}/preview`;
  return getEmbedUrl(url) || url;
}

interface ContentSectionData {
  section: Section | null;
  items: Item[];
}

async function fetchContentSection(slug: string): Promise<ContentSectionData> {
  const [sRes, iRes] = await Promise.all([
    supabase.from('content_sections').select('*').eq('slug', slug).maybeSingle(),
    supabase.from('content_items').select('*').eq('section_slug', slug).order('sort_order'),
  ]);

  return {
    section: (sRes.data as Section | null) || null,
    items: (iRes.data as Item[] | null) || [],
  };
}

export default function ContentSectionPage({ slug, onBack, onUpgrade }: { slug: string; onBack: () => void; onUpgrade: () => void }) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data = { section: null, items: [] }, isLoading: loading } = useQuery({
    queryKey: ['content-section', slug],
    queryFn: () => fetchContentSection(slug),
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const { section, items } = data;
  const [video, setVideo] = useState<Item | null>(null);
  const [pdf, setPdf] = useState<Item | null>(null);
  const [image, setImage] = useState<Item | null>(null);
  const [offer, setOffer] = useState<Item | null>(null);
  const [showPurchasedModal, setShowPurchasedModal] = useState(false);
  
  const [infoItem, setInfoItem] = useState<Item | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [paymentSelection, setPaymentSelection] = useState<{ isOpen: boolean; priceId: string; productId: string; productTitle: string; items?: { price: string; productId: string; quantity: number }[] }>({
    isOpen: false,
    priceId: '',
    productId: '',
    productTitle: ''
  });
  const isOffers = slug === 'offers';

  const canAccess = true; // Liberado para todos conforme solicitado

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0 || !isAdmin) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .in('id', Array.from(selectedIds));
      
      if (!error) {
        queryClient.setQueryData<ContentSectionData>(['content-section', slug], prev => prev ? {
          ...prev,
          items: prev.items.filter(i => !selectedIds.has(i.id)),
        } : prev);
        setSelectedIds(new Set());
      }
    } finally {
      setIsDeleting(false);
    }
  };

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

  const canAccessFull = true; // Liberado para todos conforme solicitado

  const grouped = topics.length > 0
    ? Object.fromEntries(topics.map(t => [t, items.filter(i => i.topic === t)]))
    : null;
  const untopiced = topics.length > 0 ? items.filter(i => !i.topic) : items;

  const renderItems = (list: Item[]) => (
    <div className={`grid grid-cols-2 ${slug === 'creative-edit' ? 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
      {list.map(i => (
        <ItemCard key={i.id} item={i}
          isOffers={isOffers}
          isCreative={slug === 'creative-edit'}
          isAdmin={isAdmin}
          isSelected={selectedIds.has(i.id)}
          onSelect={() => toggleSelection(i.id)}
          onVideo={() => setVideo(i)}
          onPdf={() => setPdf(i)}
          onImage={() => setImage(i)}
          onOffer={() => setOffer(i)}
          onInfo={() => setInfoItem(i)}
          onBuy={(priceId, productId, title) => setPaymentSelection({ isOpen: true, priceId, productId, productTitle: title })}

        />
      ))}
    </div>
  );

  const renderFbTower = (list: Item[]) => (
    <FbAccountsTower
      items={list}
      isAdmin={isAdmin}
      selectedIds={selectedIds}
      onSelect={toggleSelection}
      onCheckoutCart={(cartItems, title) =>
        setPaymentSelection({ isOpen: true, priceId: '', productId: '', productTitle: title, items: cartItems })
      }
    />
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

            <div className="flex items-center gap-4">
              {slug === 'fb-accounts' && (
                <button 
                  onClick={() => setShowPurchasedModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 text-brand-blue-medium hover:bg-brand-blue/30 transition-all group"
                >
                  <ShoppingCart size={14} className="text-brand-blue-medium" />
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase">Contas Compradas</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth border border-white/5">
              {slug === 'copywrite' ? <TextIcon className="w-3 h-3 text-white/50" /> : 
               slug === 'fb-accounts' ? <ShoppingCart className="w-3 h-3 text-white/50" /> :
               <ImageIcon className="w-3 h-3 text-white/50" />}
              <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">
                {slug === 'copywrite' ? 'Copywriting de Elite' : 
                 slug === 'fb-accounts' ? 'Contas & BMs' :
                 'Visual Assets'}
              </span>
            </div>

            {isAdmin && selectedIds.size > 0 && (
              <button 
                onClick={deleteSelected}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30 transition-all group disabled:opacity-50"
              >
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase">
                  {isDeleting ? 'Excluindo...' : `Excluir Selecionados (${selectedIds.size})`}
                </span>
              </button>
            )}
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
        ) : slug === 'fb-accounts' ? (
          renderFbTower(items)
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
      <PaymentSelectionModal 
        isOpen={paymentSelection.isOpen}
        onClose={() => setPaymentSelection(prev => ({ ...prev, isOpen: false }))}
        priceId={paymentSelection.priceId}
        productId={paymentSelection.productId}
        productTitle={paymentSelection.productTitle}
        items={paymentSelection.items}
      />
      

      {/* Info Modal for Creative Edit */}
      <Dialog open={!!infoItem} onOpenChange={(open) => !open && setInfoItem(null)}>
        <DialogContent className="max-w-3xl bg-[#141414] border-white/10 text-white rounded-[2.5rem] overflow-hidden p-0 gap-0 shadow-2xl">
          <div className="relative aspect-video w-full bg-black">
            {infoItem?.video_url ? (
              <iframe
                key={infoItem.id}
                src={getEmbedUrl(infoItem.video_url) || infoItem.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : infoItem?.image_url ? (
              <img src={infoItem.image_url} alt={infoItem.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5">
                <ImageIcon className="w-20 h-20 text-white/10" />
              </div>
            )}
          </div>

          <div className="px-8 pt-6 pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth mb-4 border border-white/10">
              <Sparkles size={12} className="text-white/60" />
              <span className="text-[10px] font-bold text-white/60 tracking-[0.2em] uppercase">{infoItem?.topic || 'Criativo Elite'}</span>
            </div>
            <h2 className="text-3xl font-serif-display tracking-tight text-white mb-2">{infoItem?.title}</h2>
            <p className="text-white/40 text-sm font-light">{infoItem?.description}</p>
          </div>

          <ScrollArea className="max-h-[30vh] px-8 pb-4">
            <div className="prose prose-invert max-w-none">
              {infoItem?.body && (
                <div className="text-white/70 font-light leading-relaxed whitespace-pre-wrap mt-4">
                  {infoItem.body}
                </div>
              )}
              {infoItem?.example_url && (
                <a
                  href={infoItem.example_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all items-center gap-2"
                >
                  <ExternalLink size={14} className="text-white/40" /> Ver Exemplo Real
                </a>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-white/5 flex justify-end bg-[#1a1a1a]">
             <button 
              onClick={() => setInfoItem(null)}
              className="px-8 py-3 rounded-full border border-white/5 text-white/40 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
             >
               Fechar
             </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemCard({ 
  item, isOffers, isCreative, isAdmin, isSelected, onSelect, onVideo, onPdf, onImage, onOffer, onInfo, onBuy 
}: {
  item: Item;
  isOffers?: boolean;
  isCreative?: boolean;
  isAdmin?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onVideo: () => void;
  onPdf: () => void;
  onImage: () => void;
  onOffer?: () => void;
  onInfo?: () => void;
  onBuy: (priceId: string, productId: string, title: string) => void;
}) {
  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const priceId = (item.body && item.body.startsWith('price_')) 
      ? item.body 
      : 'price_1Tc4wzQP3tL0cIWnFFTaNhgJ';
    onBuy(priceId, item.id, item.title);
  };


  const handleClick = () => {
    if (isCreative && onInfo) return onInfo();
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

  if (isCreative) {
    return (
      <button 
        onClick={handleClick}
        className={`group relative w-full glass-smooth transition-all duration-700 rounded-[2rem] border flex flex-col text-left overflow-hidden hover:scale-[1.02] hover:-translate-y-2 ${
          isSelected ? 'bg-white/20 border-white/40 shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'hover:bg-white/10 border-white/5 bg-white/[0.02]'
        }`}
      >
        {/* Image / Icon Container with portrait aspect ratio */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/5">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/[0.05] to-transparent">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                {icon}
              </div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          {/* Tag */}
          <div className="absolute top-6 left-6">
            <div className="inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">
              {item.topic || 'Criativo'}
            </div>
          </div>

          {/* Selection indicator for Admin */}
          {isAdmin && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
              className={`absolute top-6 right-6 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center transition-all ${
                isSelected ? 'bg-white text-black border-white' : 'bg-black/40 hover:bg-white hover:text-black'
              }`}
            >
              {isSelected ? <Check size={14} /> : <Plus size={14} />}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-8 flex flex-col flex-1">
          <h4 className="text-2xl font-serif-display text-white mb-3 tracking-tight group-hover:tracking-wide transition-all line-clamp-2">{item.title}</h4>
          <p className="text-white/40 text-sm font-light leading-relaxed mb-8 line-clamp-3">{item.description}</p>
          
          <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Ver Detalhes</span>
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:border-white/20 transition-all">
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </button>
    );
  }

  if (item.kind === 'text') {
    return (
      <div 
        onClick={isAdmin ? onSelect : undefined}
        className={`group relative p-8 glass-smooth transition-all duration-500 rounded-[2.5rem] border h-full flex flex-col ${
          isSelected ? 'bg-white/20 border-white/40' : 'hover:bg-white/10 border-white/5'
        } ${isAdmin ? 'cursor-pointer' : ''}`}
      >
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
          <div className="flex flex-col gap-3 mt-auto">
            <button 
              onClick={handleBuy}
              className="w-full py-3 px-6 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
            >
              Comprar Agora
            </button>
          </div>
        )}


        {item.buy_url && item.section_slug !== 'fb-accounts' && (
          <div className="mt-auto">
            <button 
              onClick={handleBuy}
              className="w-full py-3 px-6 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              Comprar Agora
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={isAdmin ? onSelect : handleClick}
      className={`group relative text-left glass-smooth transition-all duration-500 rounded-[2.5rem] border flex flex-col h-full overflow-hidden ${
        isSelected ? 'bg-white/20 border-white/40' : 'hover:bg-white/10 border-white/5'
      } ${isAdmin ? 'cursor-pointer' : ''}`}
    >
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
          <div className="flex flex-col gap-3 mt-auto">
            <button 
              onClick={handleBuy}
              className="w-full py-3 px-6 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Comprar Agora
            </button>
          </div>
        ) : (

          <button onClick={handleClick} className="mt-auto pt-6 flex items-center text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] group/btn">
             Ver Detalhes <ArrowRight size={12} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}

function parsePriceToCents(input: string | null | undefined): number {
  if (!input) return 0;
  // Accept formats like "R$ 100,00", "100.50", "1.299,90", "1299"
  const cleaned = String(input)
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '') // remove thousand dots
    .replace(',', '.');
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function FbAccountsTower({
  items,
  isAdmin,
  selectedIds,
  onSelect,
  onCheckoutCart,
}: {
  items: Item[];
  isAdmin?: boolean;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onCheckoutCart: (cartItems: { price: string; productId: string; quantity: number }[], title: string) => void;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});

  const priceFor = (item: Item) => {
    if (item.body && item.body.startsWith('price_')) return item.body;
    return 'price_1Tc4wzQP3tL0cIWnFFTaNhgJ';
  };

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };
  const removeOne = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if ((next[id] || 0) <= 1) delete next[id];
      else next[id] = next[id] - 1;
      return next;
    });
  };
  const removeAll = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };
  const clearCart = () => setCart({});

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => {
      const item = items.find(i => i.id === id);
      return item ? { item, qty } : null;
    })
    .filter(Boolean) as { item: Item; qty: number }[];

  const totalCents = cartEntries.reduce(
    (sum, { item, qty }) => sum + parsePriceToCents(item.description) * qty,
    0,
  );
  const totalItems = cartEntries.reduce((sum, { qty }) => sum + qty, 0);

  const { user, refreshCashBalance } = useAuth();
  const [paying, setPaying] = useState(false);
  const balanceCents = Math.round((user?.cashBalance || 0));
  const insufficient = totalCents > balanceCents;

  const handleCheckout = async () => {
    if (cartEntries.length === 0 || paying) return;
    if (!user) {
      toast.error('Faça login para concluir a compra.');
      return;
    }
    if (insufficient) {
      toast.error(`Saldo insuficiente. Faltam ${formatBRL(totalCents - balanceCents)}. Adicione saldo para continuar.`);
      return;
    }
    setPaying(true);
    try {
      for (const { item, qty } of cartEntries) {
        const unit = parsePriceToCents(item.description);
        for (let i = 0; i < qty; i++) {
          const { data, error } = await supabase.rpc('spend_cash', {
            p_user: user.id,
            p_amount: unit,
            p_product: item.id,
          });
          if (error) throw error;
          const res = data as { success: boolean; error?: string } | null;
          if (!res?.success) throw new Error(res?.error || 'Falha ao processar pagamento');
        }
      }
      await refreshCashBalance();
      toast.success('Compra realizada com sucesso! Veja em "Minhas Contas".');
      clearCart();
    } catch (err) {
      console.error('Cash checkout error:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao processar pagamento.');
    } finally {
      setPaying(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
      {/* List (left) */}
      <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={14} className="text-white/40" />
            <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">
              Contas & BMs · {items.length}
            </span>
          </div>
          <span className="hidden lg:inline text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">
            Adicione ao carrinho →
          </span>
        </div>

        <div className="flex flex-col">
          {items.map((item, idx) => {
            const isSelected = selectedIds.has(item.id);
            const qty = cart[item.id] || 0;
            const priceCents = parsePriceToCents(item.description);
            return (
              <div
                key={item.id}
                className={`group relative w-full text-left px-5 py-4 flex items-center gap-4 border-b border-white/5 last:border-b-0 transition-all ${
                  qty > 0
                    ? 'bg-gradient-to-r from-brand-blue/15 via-brand-blue/5 to-transparent'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <span
                  className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all ${
                    qty > 0 ? 'bg-brand-blue-medium' : 'bg-transparent group-hover:bg-white/20'
                  }`}
                />
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold tabular-nums transition-all shrink-0 ${
                    qty > 0
                      ? 'bg-brand-blue/25 text-brand-blue-medium border border-brand-blue/40'
                      : 'bg-white/5 text-white/40 border border-white/5'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{item.title}</div>
                  {item.topic && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase truncate">
                        {item.topic}
                      </span>
                      {item.title === 'Facebook com BM - Estrangeiro' && (
                        <span className="text-[9px] font-extrabold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.55)] ring-1 ring-emerald-300/60 animate-pulse">
                          Recomendado
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-sm font-bold text-brand-blue-medium tabular-nums mt-1">
                    {priceCents > 0 ? formatBRL(priceCents) : item.description || 'Sob consulta'}
                  </div>
                </div>


                {qty > 0 ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => removeOne(item.id)}
                      className="w-8 h-8 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center"
                      aria-label="Remover um"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-white w-5 text-center tabular-nums">{qty}</span>
                    <button
                      onClick={() => addToCart(item.id)}
                      className="w-8 h-8 rounded-lg bg-white text-black hover:scale-105 transition-all flex items-center justify-center"
                      aria-label="Adicionar mais um"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item.id)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-white text-black text-[11px] font-bold uppercase tracking-[0.15em] hover:scale-[1.03] active:scale-[0.97] transition-all"
                  >
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart (right) */}
      <div className="lg:sticky lg:top-28 h-fit">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/15 border border-brand-blue/30">
              <ShoppingCart size={12} className="text-brand-blue-medium" />
              <span className="text-[10px] font-bold text-brand-blue-medium tracking-[0.2em] uppercase">
                Carrinho · {totalItems}
              </span>
            </div>
            {totalItems > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] font-bold text-white/40 hover:text-white tracking-[0.15em] uppercase transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {cartEntries.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart size={32} className="mx-auto mb-4 text-white/10" />
              <p className="text-white/40 text-sm">Seu carrinho está vazio</p>
              <p className="text-white/20 text-xs mt-2">
                Clique em <span className="text-white/40 font-bold">+ Add</span> ao lado de uma conta para adicioná-la.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col divide-y divide-white/5 mb-6 max-h-[360px] overflow-y-auto pr-1">
                {cartEntries.map(({ item, qty }) => {
                  const unit = parsePriceToCents(item.description);
                  return (
                    <div key={item.id} className="py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{item.title}</div>
                        <div className="text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase mt-0.5">
                          {formatBRL(unit)} · un
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => removeOne(item.id)}
                          className="w-7 h-7 rounded-md border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="text-xs font-bold text-white w-5 text-center tabular-nums">{qty}</span>
                        <button
                          onClick={() => addToCart(item.id)}
                          className="w-7 h-7 rounded-md bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeAll(item.id)}
                          className="ml-1 w-7 h-7 rounded-md text-white/30 hover:text-red-400 transition-all flex items-center justify-center"
                          title="Remover do carrinho"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-sm font-bold text-white tabular-nums w-20 text-right shrink-0">
                        {formatBRL(unit * qty)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-4 mb-3 flex items-baseline justify-between">
                <span className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">Total</span>
                <span className="text-2xl font-serif-display text-white tabular-nums">
                  {formatBRL(totalCents)}
                </span>
              </div>

              <div className="mb-6 flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2">
                <span className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase flex items-center gap-1.5">
                  <Wallet size={12} /> Saldo
                </span>
                <span className={`text-sm font-bold tabular-nums ${insufficient ? 'text-red-400' : 'text-brand-green'}`}>
                  {formatBRL(balanceCents)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={paying || insufficient}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  insufficient
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.15)]'
                } ${paying ? 'opacity-60 cursor-wait' : ''}`}
              >
                <Wallet size={14} />
                {paying ? 'Processando…' : insufficient ? `Adicione ${formatBRL(totalCents - balanceCents)} de saldo` : 'Pagar com Saldo'}
              </button>


              <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-brand-green" /> Entrega rápida
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-brand-green" /> Suporte incluso
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

