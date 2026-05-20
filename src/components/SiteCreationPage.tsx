import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ExternalLink, ShoppingCart, Sparkles, Pencil, Wand2, Image as ImageIcon } from 'lucide-react';
import SiteOrderModal, { SiteOrderProduct } from './SiteOrderModal';

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

  const openOrder = (p: Product) => setOrderingProduct({
    slug: p.slug, name: p.name, price: p.price, buy_url: p.buy_url, kind: p.kind,
  });

  const Card = ({ p }: { p: Product }) => {
    const buyLabel = p.kind === 'criativo' ? 'Quero esse criativo' : 'Quero esse site agora';
    return (
      <div className="bg-card border border-border rounded-xl p-5 hover:border-brand-blue transition-colors flex flex-col">
        <div className="flex items-baseline justify-between mb-2 gap-2">
          <h3 className="font-medium text-base">{p.name}</h3>
          <span className="text-xl font-semibold whitespace-nowrap">R${p.price}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-3 mb-4 min-h-[3rem]">{p.short_desc}</p>
        <div className="flex gap-2 mt-auto">
          {p.example_url && (
            <a href={p.example_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs hover:bg-secondary transition-colors">
              <ExternalLink size={12} /> Exemplo
            </a>
          )}
          <button onClick={() => openOrder(p)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-brand-amber via-orange-500 to-brand-red text-white text-sm font-semibold shadow-[0_4px_14px_-2px_hsl(var(--brand-amber)/0.55)] hover:shadow-[0_6px_20px_-2px_hsl(var(--brand-amber)/0.85)] hover:scale-[1.02] active:scale-[0.98] transition-all">
            <ShoppingCart size={14} /> {buyLabel}
          </button>
        </div>
      </div>
    );
  };

  const ColumnHeader = ({ title, subtitle, icon: Icon, accent }: { title: string; subtitle: string; icon: typeof Sparkles; accent: string }) => (
    <div className="text-center mb-5">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${accent} mb-2`}>
        <Icon size={14} /> {title}
      </div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-navy py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4">
            <ArrowLeft size={16} /> Voltar
          </button>
          <h1 className="font-serif-display text-3xl text-white mb-2">Comprar Site</h1>
          <p className="text-sm text-white/60">Escolha entre copy gerada por IA (mais rápido) ou copy escrita à mão (mais personalizada).</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">Carregando…</p>
        ) : siteProducts.length === 0 && criativoProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Nenhum produto disponível no momento.</p>
        ) : (
          <>
            {/* Sites: linha-a-linha com banner divisor */}
            {siteRows.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-12">
                <ColumnHeader title="Copy com IA" subtitle="Mais rápido e econômico" icon={Sparkles}
                  accent="bg-brand-blue/15 text-brand-blue-medium" />
                <ColumnHeader title="Copy à Mão" subtitle="Escrita por copywriter profissional" icon={Pencil}
                  accent="bg-brand-amber/15 text-brand-amber" />

                {siteRows.map(([rowKey, items], idx) => {
                  const ia = items.find(i => i.col === 'ia');
                  const manual = items.find(i => i.col === 'manual');
                  return (
                    <div key={rowKey} className="contents">
                      <div>{ia ? <Card p={ia} /> : <div className="border border-dashed border-border rounded-xl p-5 text-xs text-muted-foreground/60 flex items-center justify-center min-h-[180px]">Em breve</div>}</div>
                      <div>{manual ? <Card p={manual} /> : <div className="border border-dashed border-border rounded-xl p-5 text-xs text-muted-foreground/60 flex items-center justify-center min-h-[180px]">Em breve</div>}</div>

                      {banner.enabled && banner.after_row_key === rowKey && idx < siteRows.length - 1 && (
                        <div className="md:col-span-2 my-3">
                          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-brand-blue-dark to-brand-teal px-6 py-8 sm:px-10 sm:py-10 shadow-[0_10px_40px_-10px_hsl(var(--brand-blue)/0.5)]">
                            <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_20%_20%,#fff_1px,transparent_1px),radial-gradient(circle_at_80%_70%,#fff_1px,transparent_1px)] [background-size:24px_24px]" />
                            <div className="absolute -top-8 -right-8 w-40 h-40 bg-brand-amber/20 rounded-full blur-3xl" />
                            <div className="relative text-center text-white max-w-2xl mx-auto">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-amber/20 text-brand-amber text-[10px] font-semibold uppercase tracking-wider mb-3">
                                <Wand2 size={11} /> Feito sob medida pra você
                              </div>
                              <h3 className="font-serif-display text-xl sm:text-2xl md:text-3xl leading-tight mb-2">
                                {banner.title || banner.text || DEFAULT_BANNER.title}
                              </h3>
                              {(banner.subtitle || DEFAULT_BANNER.subtitle) && (
                                <p className="text-sm sm:text-[15px] text-white/75 leading-relaxed">
                                  {banner.subtitle || DEFAULT_BANNER.subtitle}
                                </p>
                              )}
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
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-brand-teal/15 text-brand-teal mb-2">
                    <ImageIcon size={14} /> Criativos
                  </div>
                  <p className="text-xs text-muted-foreground">Criativos prontos para suas campanhas</p>
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
