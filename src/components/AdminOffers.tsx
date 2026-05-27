import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, X, Search, Package, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ValidatedOffer {
  id: string;
  title: string;
  description: string;
  price: string;
  link: string;
  image_url: string;
  category: string;
}

export default function AdminOffers() {
  const [offers, setOffers] = useState<ValidatedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState<Partial<ValidatedOffer> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('validated_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar ofertas', description: error.message });
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;

    try {
      const { id, ...data } = editingOffer;
      if (id) {
        const { error } = await supabase.from('validated_offers').update(data).eq('id', id);
        if (error) throw error;
        toast({ title: 'Oferta atualizada com sucesso' });
      } else {
        const { error } = await supabase.from('validated_offers').insert(data);
        if (error) throw error;
        toast({ title: 'Oferta criada com sucesso' });
      }
      setEditingOffer(null);
      fetchOffers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar oferta', description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('validated_offers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Oferta excluída com sucesso' });
      setConfirmDelete(null);
      fetchOffers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao excluir oferta', description: error.message });
    }
  };

  const filtered = offers.filter(o => 
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-serif-display text-white">Gerenciar Ofertas Validadas</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Buscar oferta..." 
              className="pl-9 pr-4 py-2 rounded-xl text-xs bg-white/5 border border-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 w-full sm:w-64 transition-all" 
            />
          </div>
          <button 
            onClick={() => setEditingOffer({ title: '', description: '', price: '', link: '', image_url: '', category: '' })} 
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 transition-all"
          >
            <Plus size={14} /> Nova Oferta
          </button>
        </div>
      </div>

      <div className="glass-smooth border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest">Preço</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map(offer => (
                <tr key={offer.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                        {offer.image_url ? (
                          <img src={offer.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-full h-full p-2 text-white/10" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-white truncate">{offer.title}</div>
                        <div className="text-[11px] text-white/40 truncate">{offer.link}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-white/60">{offer.category || '-'}</td>
                  <td className="px-6 py-4 text-[13px] text-white/60">{offer.price || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setEditingOffer(offer)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"><Pencil size={14} /></button>
                      <button onClick={() => setConfirmDelete(offer.id)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-brand-red hover:bg-brand-red/10 transition-all"><Trash2 size={14} /></button>
                      <a href={offer.link} target="_blank" rel="noopener" className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-brand-amber hover:bg-brand-amber/10 transition-all"><ExternalLink size={14} /></a>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-xs italic">Nenhuma oferta encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEditingOffer(null)}>
          <div className="glass-smooth border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-serif-display text-white">{editingOffer.id ? 'Editar Oferta' : 'Nova Oferta'}</h3>
              <button onClick={() => setEditingOffer(null)} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">Título do Produto</label>
                <input 
                  required
                  value={editingOffer.title || ''} 
                  onChange={e => setEditingOffer({ ...editingOffer, title: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">Categoria</label>
                  <input 
                    value={editingOffer.category || ''} 
                    onChange={e => setEditingOffer({ ...editingOffer, category: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20"
                    placeholder="Ex: Suplemento"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">Preço / Investimento</label>
                  <input 
                    value={editingOffer.price || ''} 
                    onChange={e => setEditingOffer({ ...editingOffer, price: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20"
                    placeholder="Ex: R$ 197"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">Link de Destino</label>
                <input 
                  required
                  value={editingOffer.link || ''} 
                  onChange={e => setEditingOffer({ ...editingOffer, link: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">URL da Imagem</label>
                <input 
                  value={editingOffer.image_url || ''} 
                  onChange={e => setEditingOffer({ ...editingOffer, image_url: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">Descrição</label>
                <textarea 
                  rows={4}
                  value={editingOffer.description || ''} 
                  onChange={e => setEditingOffer({ ...editingOffer, description: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20 resize-none"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setEditingOffer(null)} className="flex-1 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-8 py-4 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setConfirmDelete(null)}>
          <div className="glass-smooth border border-white/10 rounded-[2rem] p-8 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-serif-display text-white mb-4">Excluir Oferta?</h3>
            <p className="text-white/40 text-sm mb-8">Esta ação não pode ser desfeita. A oferta será removida permanentemente do site.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 px-6 py-3 bg-brand-red text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-red/90">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
