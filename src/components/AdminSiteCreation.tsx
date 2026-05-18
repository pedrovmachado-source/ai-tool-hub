import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, X, Inbox, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

interface Order {
  id: string;
  user_id: string;
  product_slug: string;
  description: string;
  ref_link_1: string;
  ref_link_2: string;
  whatsapp: string;
  created_at: string;
}

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

export default function AdminSiteCreation() {
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const [p, o] = await Promise.all([
      supabase.from('site_products' as any).select('*').order('col').order('sort_order'),
      supabase.from('site_orders' as any).select('*').order('created_at', { ascending: false }).limit(200),
    ]);
    if (p.data) setProducts(p.data as unknown as Product[]);
    if (o.data) setOrders(o.data as unknown as Order[]);
    setLoading(false);
  };

  useEffect(() => { void reload(); }, []);

  const save = async () => {
    if (!form?.slug || !form.name || !form.price || !form.col) {
      toast({ title: 'Slug, nome, coluna e preço obrigatórios', variant: 'destructive' }); return;
    }
    const payload = {
      slug: form.slug,
      col: form.col,
      name: form.name,
      price: form.price,
      short_desc: form.short_desc || '',
      example_url: form.example_url || null,
      buy_url: form.buy_url || null,
      sort_order: form.sort_order ?? 0,
      active: form.active ?? true,
    };
    if (form.id) {
      const { error } = await supabase.from('site_products' as any).update(payload).eq('id', form.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('site_products' as any).insert(payload);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: 'Produto salvo' });
    setForm(null);
    await reload();
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    const { error } = await supabase.from('site_products' as any).delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    await reload();
  };

  if (loading) return <p className="text-muted-foreground/60">Carregando…</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-primary-foreground">Criação de Site</h1>
          <p className="text-[12px] text-muted-foreground/50">Gerencie produtos e pedidos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('products')} className={`px-3 py-1.5 rounded-lg text-[12px] ${tab === 'products' ? 'bg-brand-blue text-primary-foreground' : 'bg-primary-foreground/5 text-muted-foreground/60'}`}>
            <Package size={13} className="inline mr-1" /> Produtos ({products.length})
          </button>
          <button onClick={() => setTab('orders')} className={`px-3 py-1.5 rounded-lg text-[12px] ${tab === 'orders' ? 'bg-brand-blue text-primary-foreground' : 'bg-primary-foreground/5 text-muted-foreground/60'}`}>
            <Inbox size={13} className="inline mr-1" /> Pedidos ({orders.length})
          </button>
        </div>
      </div>

      {tab === 'products' && (
        <>
          <div className="mb-4 flex justify-end">
            <button onClick={() => setForm({ col: 'ia', active: true, sort_order: products.length })} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] bg-brand-blue text-primary-foreground">
              <Plus size={14} /> Novo produto
            </button>
          </div>
          <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-primary-foreground/[0.07]">
                {['Nome', 'Coluna', 'Preço', 'Ativo', 'Ações'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-primary-foreground/[0.04]">
                    <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{p.name}<div className="text-[10px] text-muted-foreground/40">/{p.slug}</div></td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/60">{p.col === 'ia' ? 'Copy IA' : 'Copy Manual'}</td>
                    <td className="px-5 py-3 text-[13px]">R${p.price}</td>
                    <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${p.active ? 'bg-brand-green/20 text-brand-green' : 'bg-muted-foreground/10 text-muted-foreground/50'}`}>{p.active ? 'Ativo' : 'Inativo'}</span></td>
                    <td className="px-5 py-3 flex gap-2">
                      <button onClick={() => setForm(p)} className="text-brand-blue-medium"><Pencil size={13} /></button>
                      <button onClick={() => remove(p.id)} className="text-brand-red/70"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
          {orders.length === 0 ? (
            <p className="p-6 text-center text-[12px] text-muted-foreground/50">Nenhum pedido recebido ainda.</p>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-primary-foreground/[0.07]">
                {['Data', 'Produto', 'WhatsApp', 'Descrição', 'Refs'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-primary-foreground/[0.04] align-top">
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/60 whitespace-nowrap">{new Date(o.created_at).toLocaleString('pt-BR')}</td>
                    <td className="px-5 py-3 text-[12px] text-primary-foreground/80 whitespace-nowrap">{o.product_slug}</td>
                    <td className="px-5 py-3 text-[12px] text-primary-foreground/80 whitespace-nowrap">{o.whatsapp}</td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/70 max-w-md"><div className="line-clamp-3">{o.description}</div></td>
                    <td className="px-5 py-3 text-[11px] text-brand-blue-medium space-y-1">
                      <a href={o.ref_link_1} target="_blank" rel="noopener noreferrer" className="block truncate max-w-[200px] underline">ref1</a>
                      <a href={o.ref_link_2} target="_blank" rel="noopener noreferrer" className="block truncate max-w-[200px] underline">ref2</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3" onClick={() => setForm(null)}>
          <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-primary-foreground">{form.id ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setForm(null)} className="text-muted-foreground/40"><X size={16} /></button>
            </div>
            <Field label="Slug (único)"><input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="ex: ia-landing" className={inputCls} /></Field>
            <Field label="Coluna">
              <select value={form.col || 'ia'} onChange={e => setForm({ ...form, col: e.target.value as 'ia' | 'manual' })} className={inputCls}>
                <option value="ia">Copy com IA</option>
                <option value="manual">Copy à Mão</option>
              </select>
            </Field>
            <Field label="Nome"><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
            <Field label="Preço (R$)"><input value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="200" className={inputCls} /></Field>
            <Field label="Descrição curta"><textarea value={form.short_desc || ''} onChange={e => setForm({ ...form, short_desc: e.target.value })} rows={3} className={inputCls + ' resize-none'} /></Field>
            <Field label="Link de exemplo"><input value={form.example_url || ''} onChange={e => setForm({ ...form, example_url: e.target.value })} placeholder="https://..." className={inputCls} /></Field>
            <Field label="Link de pagamento Stripe"><input value={form.buy_url || ''} onChange={e => setForm({ ...form, buy_url: e.target.value })} placeholder="https://buy.stripe.com/..." className={inputCls} /></Field>
            <Field label="Ordem"><input type="number" value={form.sort_order ?? 0} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} /></Field>
            <label className="flex items-center gap-2 text-[12px] text-primary-foreground/70 mb-4">
              <input type="checkbox" checked={form.active ?? true} onChange={e => setForm({ ...form, active: e.target.checked })} /> Ativo
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setForm(null)} className="px-4 py-2 text-sm text-muted-foreground/60">Cancelar</button>
              <button onClick={save} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
