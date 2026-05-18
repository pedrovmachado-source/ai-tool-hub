import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { meetsMinPlan } from '@/lib/plan';
import { ArrowLeft, Play, FileText, Image as ImageIcon, Lock, FileText as TextIcon, ShoppingCart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PdfModal, VideoModal, ImageModal } from '@/lib/lessonViewers';
import OfferModal from './OfferModal';

interface Section {
  slug: string;
  title: string;
  description: string;
  intro: string;
  cover_url: string | null;
  min_plan: 'Free' | 'Pro' | 'Max';
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
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto py-20 px-6 text-center">
          <Lock size={42} className="mx-auto mb-4 text-muted-foreground/50" />
          <h1 className="font-serif-display text-3xl mb-3">{section.title}</h1>
          <p className="text-muted-foreground mb-6">
            Conteúdo exclusivo para assinantes <strong>{section.min_plan}</strong>.
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={onBack} className="px-4 py-2 rounded-lg border border-border text-sm">Voltar</button>
            <button onClick={onUpgrade} className="px-4 py-2 rounded-lg bg-brand-amber text-white text-sm font-medium">⚡ Assinar</button>
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
    <div className="min-h-screen bg-background">
      <div className="bg-navy py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4">
            <ArrowLeft size={16} /> Voltar
          </button>
          <h1 className="font-serif-display text-3xl text-white mb-2">{section.title}</h1>
          <p className="text-sm text-white/60">{section.intro || section.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhum conteúdo disponível ainda.</p>
        ) : grouped ? (
          <Tabs defaultValue={topics[0]}>
            <TabsList className="flex-wrap h-auto">
              {topics.map(t => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
              {untopiced.length > 0 && <TabsTrigger value="__other">Outros</TabsTrigger>}
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
    </div>
  );
}

function ItemCard({ item, onVideo, onPdf, onImage }: {
  item: Item;
  onVideo: () => void;
  onPdf: () => void;
  onImage: () => void;
}) {
  const handleClick = () => {
    if (item.kind === 'video') return onVideo();
    if (item.kind === 'pdf') return onPdf();
    if (item.kind === 'image') return onImage();
  };
  const icon = item.kind === 'video' ? <Play size={16} className="text-brand-blue-medium" />
    : item.kind === 'pdf' ? <FileText size={16} className="text-brand-green" />
    : item.kind === 'image' ? <ImageIcon size={16} className="text-brand-amber" />
    : <TextIcon size={16} className="text-muted-foreground" />;

  if (item.kind === 'text') {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1.5">{icon}<h4 className="font-medium text-sm">{item.title}</h4></div>
        {item.description && <p className="text-xs text-muted-foreground mb-2">{item.description}</p>}
        {item.body && <p className="text-sm whitespace-pre-wrap leading-6">{item.body}</p>}
      </div>
    );
  }

  return (
    <button onClick={handleClick} className="text-left bg-card border border-border rounded-xl p-4 hover:border-brand-blue transition-colors">
      {item.kind === 'image' && item.image_url && (
        <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-3" />
      )}
      <div className="flex items-center gap-2 mb-1">{icon}<h4 className="font-medium text-sm">{item.title}</h4></div>
      {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
    </button>
  );
}
