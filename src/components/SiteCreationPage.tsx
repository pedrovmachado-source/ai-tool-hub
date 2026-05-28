import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ExternalLink, ShoppingCart, Sparkles, Pencil, Wand2, Image as ImageIcon, Globe2, ArrowRight } from 'lucide-react';
import SiteOrderModal, { SiteOrderProduct } from './SiteOrderModal';
import { toast } from 'sonner';

interface Product {
  id: string;
  slug: string;
  col: 'ia' | 'manual';
  kind: 'site' | 'criativo';
  row_key: string | null;
  name: string;
  price: string;
  short_desc: string;
  example_url: string | null;
  buy_url: string | null;
  sort_order: number;
  active: boolean;
}

interface BannerCfg {
  enabled: boolean;
  after_row_key: string;
  text?: string; // legacy
  title?: string;
  subtitle?: string;
  cta_label?: string;
}

const DEFAULT_BANNER: BannerCfg = {
  enabled: true,
  after_row_key: 'quiz',
  title: 'Site pronto para vender em até 7 dias',
  subtitle: 'Copy persuasiva, estrutura validada por quem fatura 6 dígitos e gatilhos de conversão prontos. Sem enrolação — só resultado.',
  cta_label: 'Falar com um especialista',
};

export default function SiteCreationPage({ onBack }: { onBack: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [banner, setBanner] = useState<BannerCfg>(DEFAULT_BANNER);
  const [loading, setLoading] = useState(true);
  const [orderingProduct, setOrderingProduct] = useState<SiteOrderProduct | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: prods }, { data: setting }] = await Promise.all([
          supabase.from('site_products' as any).select('*').eq('active', true).order('sort_order'),
          supabase.from('site_settings').select('value').eq('key', 'site_creation_banner').maybeSingle(),
        ]);
        if (prods) setProducts(prods as unknown as Product[]);
        if (setting?.value) setBanner({ ...banner, ...(setting.value as any) });
      } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const siteProducts = useMemo(() => products.filter(p => p.kind === 'site'), [products]);
  const criativoProducts = useMemo(() => products.filter(p => p.kind === 'criativo'), [products]);

  // Group site products by row_key, preserving insertion order
  const siteRows = useMemo(() => {
    const map = new Map<string, Product[]>();
    siteProducts.forEach(p => {
      const k = p.row_key || p.slug;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    });
    return Array.from(map.entries()); // [rowKey, items[]]
  }, [siteProducts]);

  const openOrder = async (p: Product) => {
    // If the product has a Stripe Price ID in its buy_url field (it should look like price_...)
    // we can skip the form and go straight to checkout if it's a direct purchase.
    // However, SiteOrderModal usually collects WhatsApp/references which are important.
    // The user asked for "integrated checkout" (pop-up/no new page).
    
    if (p.buy_url?.startsWith('price_')) {
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { priceId: p.buy_url, mode: 'payment' }
        });
        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      } catch (err) {
        console.error('Checkout error:', err);
        toast.error('Erro ao iniciar checkout');
      }
    }

    setOrderingProduct({
      slug: p.slug, name: p.name, price: p.price, buy_url: p.buy_url, kind: p.kind,
    });
  };

  const Card = ({ p }: { p: Product }) => {
    const buyLabel = p.kind === 'criativo' ? 'Quero esse criativo' : 'Quero esse site agora';
    return (
      <div className="group relative p-8 glass-smooth hover:bg-white/10 transition-all duration-500 rounded-[2.5rem] border border-white/5 h-full flex flex-col">
        <div className="flex items-baseline justify-between mb-6 gap-2">
          <h3 className="text-2xl font-serif-display text-white">{p.name}</h3>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-white">R${p.price}</span>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Investimento</span>
          </div>
        </div>
        
        <p className="text-white/30 text-sm leading-relaxed font-light mb-8 flex-1">
          {p.short_desc}
        </p>

        <div className="flex flex-col gap-3 mt-auto">
          {p.example_url && (
            <a href={p.example_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full border border-white/5 text-xs font-bold text-white/40 hover:bg-white/5 transition-all">
              <ExternalLink size={14} /> Ver Exemplo Real
            </a>
          )}
          <button onClick={() => openOrder(p)}
            className="group/btn relative w-full inline-flex items-center justify-center gap-2 py-4 rounded-full bg-white text-black text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
            <ShoppingCart size={16} /> {buyLabel}
          </button>
        </div>
      </div>
    );
  };

  const ColumnHeader = ({ title, subtitle, icon: Icon, accent }: { title: string; subtitle: string; icon: any; accent: string }) => (
    <div className="text-left mb-12">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase ${accent} mb-4`}>
        <Icon size={12} /> {title}
      </div>
      <p className="text-white/30 text-sm font-light">{subtitle}</p>
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
          <button onClick={onBack} className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth mb-10 border border-white/5 text-white/50 hover:text-white transition-colors group">
            <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Voltar ao Menu</span>
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth mb-6 border border-white/5">
            <Globe2 className="w-3 h-3 text-white/50" />
            <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">Escala Digital</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif-display tracking-tight text-white mb-6 leading-tight">
            Seu Site Pronto para <em className="italic font-normal">Escalar</em>.
          </h1>
          <p className="text-white/40 text-lg max-w-2xl font-light leading-relaxed">
            Landing pages, quizzes e funis de alta conversão. Escolha entre a velocidade da IA ou o toque refinado de nossos copywriters profissionais.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">Carregando…</p>
        ) : siteProducts.length === 0 && criativoProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Nenhum produto disponível no momento.</p>
        ) : (
          <>
            {/* Sites: linha-a-linha com banner divisor */}
            {siteRows.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-12">
                <ColumnHeader title="Copy com IA" subtitle="A solução rápida para quem precisa estar no ar agora com eficiência e baixo custo." icon={Sparkles}
                  accent="bg-white/5 text-white/50 border border-white/5" />
                <ColumnHeader title="Copy à Mão" subtitle="Textos psicológicos desenhados palavra por palavra por especialistas em conversão." icon={Pencil}
                  accent="bg-white/5 text-white/50 border border-white/5" />

                {siteRows.map(([rowKey, items], idx) => {
                  const ia = items.find(i => i.col === 'ia');
                  const manual = items.find(i => i.col === 'manual');
                  return (
                    <div key={rowKey} className="contents">
                      <div>{ia ? <Card p={ia} /> : <div className="border border-dashed border-border rounded-xl p-5 text-xs text-muted-foreground/60 flex items-center justify-center min-h-[180px]">Em breve</div>}</div>
                      <div>{manual ? <Card p={manual} /> : <div className="border border-dashed border-border rounded-xl p-5 text-xs text-muted-foreground/60 flex items-center justify-center min-h-[180px]">Em breve</div>}</div>

                      {banner.enabled && banner.after_row_key === rowKey && idx < siteRows.length - 1 && (
                        <div className="md:col-span-2 my-3">
                          <div className="relative overflow-hidden rounded-[2.5rem] glass-smooth px-8 py-12 sm:px-12 sm:py-16 border border-white/5 shadow-2xl">
                            <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_20%_20%,#fff_1px,transparent_1px),radial-gradient(circle_at_80%_70%,#fff_1px,transparent_1px)] [background-size:24px_24px]" />
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]" />
                            
                            <div className="relative text-center text-white max-w-3xl mx-auto">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-8">
                                <Wand2 size={12} className="text-white/50" />
                                <span>Soluções Sob Medida</span>
                              </div>
                              <h3 className="text-3xl sm:text-5xl font-serif-display leading-[1.1] mb-8">
                                {banner.title || banner.text || DEFAULT_BANNER.title}
                              </h3>
                              {(banner.subtitle || DEFAULT_BANNER.subtitle) && (
                                <p className="text-white/40 text-lg font-light leading-relaxed mb-10">
                                  {banner.subtitle || DEFAULT_BANNER.subtitle}
                                </p>
                              )}
                              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black text-sm font-bold hover:scale-105 transition-transform">
                                {banner.cta_label || DEFAULT_BANNER.cta_label}
                                <ArrowRight size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Criativos: 3ª seção */}
            {criativoProducts.length > 0 && (
              <div>
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-6">
                    <ImageIcon size={14} className="text-white/50" /> 
                    <span>Visual Assets</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif-display text-white mb-4">Criativos de <em className="italic font-normal">Alta Performance</em></h2>
                  <p className="text-white/30 text-lg font-light">Peças desenhadas para parar o scroll e converter cliques em vendas.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {criativoProducts.map(p => <Card key={p.id} p={p} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {orderingProduct && (
        <SiteOrderModal product={orderingProduct} onClose={() => setOrderingProduct(null)} />
      )}
    </div>
  );
}
