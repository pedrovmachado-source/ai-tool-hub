import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, X, Inbox, Package, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

interface Order {
  id: string;
  user_id: string;
  product_slug: string;
  description: string;
  ref_link_1: string;
  ref_link_2: string;
  whatsapp: string;
  created_at: string;
  status: 'novo' | 'em_andamento' | 'concluido';
  read_at: string | null;
}

const STATUS_LABELS: Record<Order['status'], string> = {
  novo: 'Novo',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
};
const STATUS_CLS: Record<Order['status'], string> = {
  novo: 'bg-brand-blue/20 text-brand-blue-medium',
  em_andamento: 'bg-brand-amber/20 text-brand-amber',
  concluido: 'bg-brand-green/20 text-brand-green',
};

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

export default function AdminSiteCreation({ initialTab = 'products', kindFilter }: { initialTab?: 'products' | 'orders'; kindFilter?: 'site' | 'criativo' } = {}) {
  const [tab, setTab] = useState<'products' | 'orders'>(initialTab);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const [p, o] = await Promise.all([
        supabase.from('site_products' as any).select('*').order('kind').order('sort_order'),
        supabase.from('site_orders' as any).select('*').order('created_at', { ascending: false }).limit(300),
      ]);
      if (p.data) setAllProducts(p.data as unknown as Product[]);
      if (o.data) setAllOrders(o.data as unknown as Order[]);
    } finally { setLoading(false); }
  };

  useEffect(() => { void reload(); }, []);

  const products = useMemo(
    () => kindFilter ? allProducts.filter(p => p.kind === kindFilter) : allProducts,
    [allProducts, kindFilter]
  );
  const orders = useMemo(() => {
    if (!kindFilter) return allOrders;
    const slugs = new Set(allProducts.filter(p => p.kind === kindFilter).map(p => p.slug));
    return allOrders.filter(o => slugs.has(o.product_slug));
  }, [allOrders, allProducts, kindFilter]);

  const isCriativos = kindFilter === 'criativo';

  // Auto-mark unread orders as read when opening the orders tab
  useEffect(() => {
    if (tab !== 'orders' || orders.length === 0) return;
    const unreadIds = orders.filter(o => !o.read_at).map(o => o.id);
    if (unreadIds.length === 0) return;
    const now = new Date().toISOString();
    setAllOrders(prev => prev.map(o => unreadIds.includes(o.id) ? { ...o, read_at: now } : o));
    void (supabase as any).from('site_orders').update({ read_at: now }).in('id', unreadIds);
  }, [tab, orders.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const productsBySlug = useMemo(() => {
    const m = new Map<string, Product>();
    products.forEach(p => m.set(p.slug, p));
    return m;
  }, [products]);

  const unreadCount = useMemo(() => orders.filter(o => !o.read_at).length, [orders]);

  const save = async () => {
    if (!form?.slug || !form.name || !form.price || !form.col || !form.kind) {
      toast({ title: 'Slug, nome, tipo, coluna e preço obrigatórios', variant: 'destructive' }); return;
    }
    const payload = {
      slug: form.slug,
      col: form.col,
      kind: form.kind,
      row_key: form.row_key || null,
      name: form.name,
      price: form.price,
      short_desc: form.short_desc || '',
      example_url: form.example_url || null,
      buy_url: form.buy_url || null,
      sort_order: form.sort_order ?? 0,
      active: form.active ?? true,
    };
    const op = form.id
      ? supabase.from('site_products' as any).update(payload).eq('id', form.id)
      : supabase.from('site_products' as any).insert(payload);
    const { error } = await op;
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
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

  const updateOrder = async (id: string, patch: Partial<Order>) => {
    setAllOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
    const { error } = await supabase.from('site_orders' as any).update(patch).eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); await reload(); }
  };

  const toggleRead = (o: Order) => updateOrder(o.id, { read_at: o.read_at ? null : new Date().toISOString() });
  const setStatus = (o: Order, status: Order['status']) => updateOrder(o.id, { status });

  const deleteOrder = async (id: string) => {
    if (!confirm('Excluir este pedido permanentemente?')) return;
    const { error } = await supabase.from('site_orders').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Pedido excluído' });
    await reload();
  };

  const clearAllOrders = async () => {
    if (!confirm('AVISO: Isso excluirá TODOS os pedidos permanentemente. Tem certeza?')) return;
    // We use a dummy condition that is always true for all records to delete all
    const { error } = await supabase.from('site_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      toast({ title: 'Erro ao limpar pedidos', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Todos os pedidos foram excluídos' });
    await reload();
  };

  if (loading) return <p className="text-muted-foreground/60">Carregando…</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-primary-foreground">{isCriativos ? 'Criativos' : 'Criação de Site'}</h1>
          <p className="text-[12px] text-muted-foreground/50">{isCriativos ? 'Gerencie os criativos disponíveis para venda e os pedidos recebidos.' : 'Gerencie produtos e pedidos recebidos.'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('products')} className={`px-3 py-1.5 rounded-lg text-[12px] ${tab === 'products' ? 'bg-brand-blue text-primary-foreground' : 'bg-primary-foreground/5 text-muted-foreground/60'}`}>
            <Package size={13} className="inline mr-1" /> Produtos ({products.length})
          </button>
          <button onClick={() => setTab('orders')} className={`relative px-3 py-1.5 rounded-lg text-[12px] ${tab === 'orders' ? 'bg-brand-blue text-primary-foreground' : 'bg-primary-foreground/5 text-muted-foreground/60'}`}>
            <Inbox size={13} className="inline mr-1" /> Pedidos ({orders.length})
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
          <button onClick={reload} className="px-3 py-1.5 rounded-lg text-[12px] bg-primary-foreground/5 text-muted-foreground/60 hover:bg-primary-foreground/10 transition-colors">
            <span className="flex items-center gap-1.5">
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </span>
          </button>
          {tab === 'orders' && orders.length > 0 && (
            <button onClick={clearAllOrders} className="px-3 py-1.5 rounded-lg text-[12px] bg-brand-red text-white hover:bg-brand-red/90 transition-colors shadow-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Trash2 size={13} />
                Excluir todos os pedidos
              </span>
            </button>
          )}
        </div>
      </div>

      {tab === 'products' && (
        <>
          <div className="mb-4 flex justify-end">
            <button onClick={() => setForm({ kind: kindFilter || 'site', col: 'ia', active: true, sort_order: products.length })} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] bg-brand-blue text-primary-foreground">
              <Plus size={14} /> Novo produto
            </button>
          </div>
          <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-primary-foreground/[0.07]">
                {['Nome', 'Tipo', 'Coluna', 'Linha', 'Preço', 'Ativo', 'Ações'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-primary-foreground/[0.04]">
                    <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{p.name}<div className="text-[10px] text-muted-foreground/40">/{p.slug}</div></td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/60">{p.kind === 'criativo' ? 'Criativo' : 'Site'}</td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/60">{p.col === 'ia' ? 'IA' : 'Manual'}</td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/60">{p.row_key || '—'}</td>
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
                {['', 'Data', 'Tipo / Produto', 'Preço', 'WhatsApp', 'Descrição', 'Refs', 'Status', 'Ações'].map(h => <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {orders.map(o => {
                  const prod = productsBySlug.get(o.product_slug);
                  const unread = !o.read_at;
                  return (
                    <tr key={o.id} className={`border-b border-primary-foreground/[0.04] align-top ${unread ? 'bg-brand-blue/[0.05]' : ''}`}>
                      <td className="px-3 py-3">
                        {unread && <span className="inline-block w-2 h-2 rounded-full bg-brand-blue" title="Não lido" />}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-muted-foreground/60 whitespace-nowrap">{new Date(o.created_at).toLocaleString('pt-BR')}</td>
                      <td className="px-3 py-3 text-[12px] text-primary-foreground/80 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full mr-1 ${prod?.kind === 'criativo' ? 'bg-brand-teal/20 text-brand-teal' : 'bg-brand-blue/20 text-brand-blue-medium'}`}>
                          {prod?.kind === 'criativo' ? 'Criativo' : 'Site'}
                        </span>
                        {prod?.name || o.product_slug}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-primary-foreground/80 whitespace-nowrap">{prod ? `R$${prod.price}` : '—'}</td>
                      <td className="px-3 py-3 text-[12px] text-primary-foreground/80 whitespace-nowrap">{o.whatsapp}</td>
                      <td className="px-3 py-3 text-[12px] text-muted-foreground/70 max-w-xs"><div className="line-clamp-3">{o.description}</div></td>
                      <td className="px-3 py-3 text-[11px] text-brand-blue-medium space-y-1">
                        <a href={o.ref_link_1} target="_blank" rel="noopener noreferrer" className="block truncate max-w-[140px] underline">ref1</a>
                        <a href={o.ref_link_2} target="_blank" rel="noopener noreferrer" className="block truncate max-w-[140px] underline">ref2</a>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={o.status}
                          onChange={e => setStatus(o, e.target.value as Order['status'])}
                          className={`text-[11px] px-2 py-1 rounded-md border-0 outline-none cursor-pointer ${STATUS_CLS[o.status]}`}
                        >
                          {(Object.keys(STATUS_LABELS) as Order['status'][]).map(s => (
                            <option key={s} value={s} className="bg-navy text-primary-foreground">{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3 flex items-center gap-2">
                        <button onClick={() => toggleRead(o)} className="text-muted-foreground/60 hover:text-primary-foreground" title={unread ? 'Marcar como lido' : 'Marcar como não lido'}>
                          {unread ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => deleteOrder(o.id)} className="px-2 py-1 rounded bg-brand-red text-white text-[10px] font-bold uppercase hover:bg-brand-red/90 transition-colors" title="Excluir pedido">
                          Apagar
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
            <Field label="Tipo">
              <select value={form.kind || 'site'} onChange={e => setForm({ ...form, kind: e.target.value as 'site' | 'criativo' })} className={inputCls}>
                <option value="site">Site (Comprar Site Pronto)</option>
                <option value="criativo">Criativo (Comprar Criativo)</option>
              </select>
            </Field>
            <Field label="Coluna (só para sites)">
              <select value={form.col || 'ia'} onChange={e => setForm({ ...form, col: e.target.value as 'ia' | 'manual' })} className={inputCls}>
                <option value="ia">Copy com IA</option>
                <option value="manual">Copy à Mão</option>
              </select>
            </Field>
            <Field label="Linha (row_key — agrupa IA + Manual)"><input value={form.row_key || ''} onChange={e => setForm({ ...form, row_key: e.target.value })} placeholder="ex: landing, quiz, advertorial" className={inputCls} /></Field>
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
