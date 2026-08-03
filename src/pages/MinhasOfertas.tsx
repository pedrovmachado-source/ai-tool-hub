import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Meta from '@/components/Meta';
import {
  Plus, Search, Pencil, Trash2, Copy, Check, Download, ExternalLink,
  Library, FolderOpen, Target, X, ArrowLeft, Globe, ShoppingCart, Tag as TagIcon
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type Oferta = {
  id: string;
  nome: string;
  tags: string[];
  linkBib: string;
  linkDrive: string;
  linkSite: string;
  linkCheckout: string;
  copyTexto: string;
  approved: boolean;
  isDefinitive: boolean;
};

const TAGS = ['Emagrecimento','Dieta','Educação','Religião','Infantil','Mães','Pais','Adulto','Saúde & corpo','Relacionamentos','Dinheiro','Mente & espírito','Habilidades & hobbies','Outros'];

async function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    return true;
  } catch { return false; }
}

type Row = {
  id: string;
  nome: string;
  tags: any;
  link_bib: string;
  link_drive: string;
  link_site: string;
  link_checkout: string;
  copy_texto: string;
  approved?: boolean;
  is_definitive?: boolean;
};

type OfertaForm = Omit<Oferta, 'id' | 'approved' | 'isDefinitive'>;

const rowToOferta = (r: Row): Oferta => ({
  id: r.id,
  nome: r.nome,
  tags: Array.isArray(r.tags) ? r.tags : [],
  linkBib: r.link_bib || '',
  linkDrive: r.link_drive || '',
  linkSite: r.link_site || '',
  linkCheckout: r.link_checkout || '',
  copyTexto: r.copy_texto || '',
  approved: !!r.approved,
  isDefinitive: !!r.is_definitive,
});

export default function MinhasOfertas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [query, setQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Oferta | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Omit<Oferta, 'id'>>({
    nome: '', tags: [], linkBib: '', linkDrive: '', linkSite: '', linkCheckout: '', copyTexto: ''
  });

  useEffect(() => {
    if (!user?.id) { setOfertas([]); return; }
    (async () => {
      const { data, error } = await (supabase as any)
        .from('user_offers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) { toast.error('Erro ao carregar ofertas'); return; }
      setOfertas((data as Row[] || []).map(rowToOferta));
    })();
  }, [user?.id]);

  const openNew = () => {
    setEditing(null);
    setForm({ nome: '', tags: [], linkBib: '', linkDrive: '', linkSite: '', linkCheckout: '', copyTexto: '' });
    setModalOpen(true);
  };

  const openEdit = (o: Oferta) => {
    setEditing(o);
    setForm({ nome: o.nome, tags: o.tags, linkBib: o.linkBib, linkDrive: o.linkDrive, linkSite: o.linkSite, linkCheckout: o.linkCheckout, copyTexto: o.copyTexto });
    setModalOpen(true);
  };

  const save = async () => {
    if (!user?.id) { toast.error('Faça login para salvar.'); return; }
    if (!form.nome.trim()) { toast.error('Informe o nome da oferta.'); return; }
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        nome: form.nome.trim(),
        tags: form.tags,
        link_bib: form.linkBib,
        link_drive: form.linkDrive,
        link_site: form.linkSite,
        link_checkout: form.linkCheckout,
        copy_texto: form.copyTexto,
      };
      if (editing) {
        const { data, error } = await (supabase as any)
          .from('user_offers')
          .update(payload)
          .eq('id', editing.id)
          .select()
          .single();
        if (error) throw error;
        setOfertas(prev => prev.map(o => o.id === editing.id ? rowToOferta(data as Row) : o));
        toast.success('Oferta atualizada');
      } else {
        const { data, error } = await (supabase as any)
          .from('user_offers')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setOfertas(prev => [rowToOferta(data as Row), ...prev]);
        toast.success('Oferta salva');
      }
      setModalOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remover esta oferta?')) return;
    const { error } = await (supabase as any).from('user_offers').delete().eq('id', id);
    if (error) { toast.error('Erro ao remover'); return; }
    setOfertas(prev => prev.filter(o => o.id !== id));
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const text = await f.text();
    setForm(s => ({ ...s, copyTexto: text }));
  };

  const handleCopy = async (o: Oferta) => {
    if (!o.copyTexto) return;
    const ok = await copyToClipboard(o.copyTexto);
    if (ok) {
      setCopiedId(o.id);
      toast.success('Copy copiada');
      setTimeout(() => setCopiedId(null), 1500);
    } else toast.error('Falha ao copiar');
  };

  const download = (o: Oferta) => {
    if (!o.copyTexto) { toast.error('Nenhuma copy salva.'); return; }
    const blob = new Blob([o.copyTexto], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `copy-${o.nome.replace(/\s+/g,'-')}.txt`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  const filtered = useMemo(() => ofertas.filter(o => {
    if (query && !o.nome.toLowerCase().includes(query.toLowerCase())) return false;
    if (filterTag && !o.tags.includes(filterTag)) return false;
    return true;
  }), [ofertas, query, filterTag]);

  const toggleTag = (t: string) =>
    setForm(s => ({ ...s, tags: s.tags.includes(t) ? s.tags.filter(x => x !== t) : [...s.tags, t] }));

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <Meta title="Minhas Ofertas | Convert Club" description="Salve, organize e gerencie suas próprias ofertas, criativos e copies." />
      <Navbar
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
          else if (page === 'menu') navigate('/menu');
          else if (page === 'profile') navigate('/perfil');
          else if (page === 'ofertas') navigate('/ofertas');
          else if (page === 'ferramentas') navigate('/ferramentas');
          else if (['alunos','mentorias','copywrite','site-creation','creative-edit','fb-accounts'].includes(page)) navigate(`/${page}`);
          else { sessionStorage.setItem('adai:initialPage', page); navigate('/ferramentas'); }
        }}
      />

      <main className="flex-1 relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <button onClick={() => navigate('/menu')} className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs font-bold tracking-[0.2em] uppercase mb-8 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Voltar ao menu
          </button>

          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg glass-smooth mb-6 border border-white/5">
              <Target className="w-3 h-3 text-white/50" />
              <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">Workspace privado</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif-display tracking-tight text-white mb-6">
              Minhas <em className="italic font-normal">Ofertas</em>.
            </h1>
            <p className="text-white/40 text-lg max-w-2xl font-light">
              Salve suas próprias ofertas, links de biblioteca, criativos e copies. Tudo organizado em um só lugar.
            </p>
          </header>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mb-8 items-center">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar oferta..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <Select value={filterTag || 'all'} onValueChange={v => setFilterTag(v === 'all' ? '' : v)}>
              <SelectTrigger
                className="w-auto min-w-[180px] gap-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl px-4 py-3 h-auto text-sm text-white focus:outline-none focus:ring-0 focus:border-white/30 transition-colors [&>svg]:opacity-60"
              >
                <TagIcon className="w-3.5 h-3.5 text-white/50 shrink-0" />
                <SelectValue placeholder="Todas as tags" />
              </SelectTrigger>
              <SelectContent
                className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 text-white rounded-2xl shadow-2xl max-h-72"
              >
                <SelectItem value="all" className="text-white/80 focus:bg-white/10 focus:text-white rounded-lg my-0.5">
                  Todas as tags
                </SelectItem>
                {TAGS.map(t => (
                  <SelectItem
                    key={t}
                    value={t}
                    className="text-white/80 focus:bg-white/10 focus:text-white rounded-lg my-0.5"
                  >
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={openNew}
              className="ml-auto inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Nova Oferta
            </button>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-24 glass-smooth rounded-[2.5rem] border border-white/5">
              <Target className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-sm">Nenhuma oferta cadastrada ainda.</p>
              <button onClick={openNew} className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all">
                <Plus className="w-4 h-4" /> Criar primeira oferta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(o => (
                <div key={o.id} className="group glass-smooth border border-white/5 rounded-[2rem] p-6 hover:bg-white/10 transition-all flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="text-lg font-serif-display text-white leading-tight">{o.nome}</h3>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(o)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(o.id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/60 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {o.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {o.tags.map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/60 uppercase tracking-[0.15em]">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mb-4">
                    {o.linkBib && (
                      <a href={o.linkBib} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all">
                        <Library className="w-3.5 h-3.5" /> <span className="flex-1 truncate">Biblioteca de Anúncios</span> <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    )}
                    {o.linkDrive && (
                      <a href={o.linkDrive} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all">
                        <FolderOpen className="w-3.5 h-3.5" /> <span className="flex-1 truncate">Drive de Criativos</span> <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    )}
                    {o.linkSite && (
                      <a href={o.linkSite} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all">
                        <Globe className="w-3.5 h-3.5" /> <span className="flex-1 truncate">Site da Oferta</span> <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    )}
                    {o.linkCheckout && (
                      <a href={o.linkCheckout} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all">
                        <ShoppingCart className="w-3.5 h-3.5" /> <span className="flex-1 truncate">Checkout</span> <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    )}
                  </div>

                  {o.copyTexto && (
                    <div className="mt-auto">
                      <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Copywrite</div>
                      <div className="text-xs text-white/50 font-mono leading-relaxed line-clamp-3 mb-3">{o.copyTexto}</div>
                      <div className="flex gap-2">
                        <button onClick={() => handleCopy(o)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.15em] text-white/70 hover:text-white hover:bg-white/10 transition-all">
                          {copiedId === o.id ? <><Check className="w-3 h-3 text-green-400" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                        </button>
                        <button onClick={() => download(o)} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.15em] text-white/70 hover:text-white hover:bg-white/10 transition-all">
                          <Download className="w-3 h-3" /> .txt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Storage note */}
          <div className="mt-16 flex items-start gap-3 px-5 py-4 rounded-2xl glass-smooth border border-white/5">
            <svg className="w-4 h-4 text-white/30 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h10" />
            </svg>
            <p className="text-[11px] text-white/30 leading-relaxed">
              Suas ofertas ficam salvas com segurança na sua conta e sincronizam em qualquer dispositivo. Apenas você e a administração da Convert Club têm acesso a esses dados.
            </p>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif-display text-white">
                {editing ? 'Editar' : 'Nova'} <em className="italic font-normal">Oferta</em>
              </h2>
              <button onClick={() => setModalOpen(false)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Nome da Oferta</label>
                <input
                  value={form.nome}
                  onChange={e => setForm(s => ({ ...s, nome: e.target.value }))}
                  placeholder="Ex: Produto Emagrecimento X"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all border ${
                        form.tags.includes(t)
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Link da Biblioteca de Anúncios</label>
                <input
                  value={form.linkBib}
                  onChange={e => setForm(s => ({ ...s, linkBib: e.target.value }))}
                  placeholder="https://facebook.com/ads/library/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Link do Drive de Criativos</label>
                <input
                  value={form.linkDrive}
                  onChange={e => setForm(s => ({ ...s, linkDrive: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Link do Site da Oferta</label>
                <input
                  value={form.linkSite}
                  onChange={e => setForm(s => ({ ...s, linkSite: e.target.value }))}
                  placeholder="https://seudominio.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Link do Checkout</label>
                <input
                  value={form.linkCheckout}
                  onChange={e => setForm(s => ({ ...s, linkCheckout: e.target.value }))}
                  placeholder="https://pay.hotmart.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Copywrite — texto ou link</label>
                <textarea
                  value={form.copyTexto}
                  onChange={e => setForm(s => ({ ...s, copyTexto: e.target.value }))}
                  placeholder="Cole aqui o texto da copy ou o link do Drive..."
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-y font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Ou envie um arquivo .txt</label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={onFile}
                  className="w-full text-xs text-white/60 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs file:font-bold file:cursor-pointer file:hover:bg-white/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setModalOpen(false)} className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
                Cancelar
              </button>
              <button onClick={save} disabled={saving} className="px-5 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-60">
                {saving ? 'Salvando…' : editing ? 'Salvar alterações' : 'Salvar oferta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
