import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ExternalLink, ShoppingCart, Sparkles, Pencil } from 'lucide-react';
import SiteOrderModal, { SiteOrderProduct } from './SiteOrderModal';

interface Product {
  id: string;
  slug: string;
  col: 'ia' | 'manual';
  name: string;
  price: string;
  short_desc: string;
  example_url: string | null;
  buy_url: string | null;
  sort_order: number;
  active: boolean;
}

export default function SiteCreationPage({ onBack }: { onBack: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderingProduct, setOrderingProduct] = useState<SiteOrderProduct | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('site_products' as any).select('*').eq('active', true).order('sort_order');
        if (data) setProducts(data as unknown as Product[]);
      } finally { setLoading(false); }
    })();
  }, []);

  const iaProducts = products.filter(p => p.col === 'ia');
  const manualProducts = products.filter(p => p.col === 'manual');

  const Column = ({ title, subtitle, icon: Icon, items, accent }: { title: string; subtitle: string; icon: typeof Sparkles; items: Product[]; accent: string }) => (
    <div className="flex-1">
      <div className="text-center mb-5">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${accent} mb-2`}>
          <Icon size={14} /> {title}
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-3">
        {items.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-5 hover:border-brand-blue transition-colors">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-medium text-base">{p.name}</h3>
              <span className="text-xl font-semibold">R${p.price}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3 mb-4 min-h-[3rem]">{p.short_desc}</p>
            <div className="flex gap-2">
              {p.example_url && (
                <a href={p.example_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs hover:bg-secondary transition-colors">
                  <ExternalLink size={12} /> Exemplo
                </a>
              )}
              <button onClick={() => setOrderingProduct({ slug: p.slug, name: p.name, price: p.price, buy_url: p.buy_url })}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-amber text-white text-xs font-medium hover:opacity-90">
                <ShoppingCart size={12} /> Comprar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-navy py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4">
            <ArrowLeft size={16} /> Voltar
          </button>
          <h1 className="font-serif-display text-3xl text-white mb-2">Criação de Site</h1>
          <p className="text-sm text-white/60">Escolha entre copy gerada por IA (mais rápido) ou copy escrita à mão (mais personalizada).</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">Carregando…</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Nenhum produto disponível no momento.</p>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <Column title="Copy com IA" subtitle="Mais rápido e econômico" icon={Sparkles}
              accent="bg-brand-blue/15 text-brand-blue-medium" items={iaProducts} />
            <Column title="Copy à Mão" subtitle="Escrita por copywriter profissional" icon={Pencil}
              accent="bg-brand-amber/15 text-brand-amber" items={manualProducts} />
          </div>
        )}
      </div>

      {orderingProduct && (
        <SiteOrderModal product={orderingProduct} onClose={() => setOrderingProduct(null)} />
      )}
    </div>
  );
}
