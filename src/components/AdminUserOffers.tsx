import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, ExternalLink, Library, FolderOpen, Globe, ShoppingCart, User as UserIcon, Loader2, Star, Crown } from 'lucide-react';
import { toast } from 'sonner';

type Row = {
  id: string;
  user_id: string;
  nome: string;
  tags: string[];
  link_bib: string;
  link_drive: string;
  link_site: string;
  link_checkout: string;
  copy_texto: string;
  created_at: string;
  approved: boolean;
  is_definitive: boolean;
  profile?: { nome: string | null; email: string | null } | null;
};

type Filter = 'all' | 'approved' | 'definitive';

export default function AdminUserOffers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: offers } = await (supabase as any)
          .from('user_offers')
          .select('*')
          .order('created_at', { ascending: false });
        const list = (offers || []) as Row[];
        const userIds = Array.from(new Set(list.map(r => r.user_id)));
        let profilesMap: Record<string, { nome: string | null; email: string | null }> = {};
        if (userIds.length) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('user_id, nome, email')
            .in('user_id', userIds);
          (profs || []).forEach((p: any) => {
            profilesMap[p.user_id] = { nome: p.nome, email: p.email };
          });
        }
        setRows(list.map(r => ({
          ...r,
          profile: profilesMap[r.user_id] || null,
          tags: Array.isArray(r.tags) ? r.tags : [],
          approved: !!r.approved,
          is_definitive: !!r.is_definitive,
        })));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleApproved = async (row: Row) => {
    const next = !row.approved;
    setBusyId(row.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase as any)
        .from('user_offers')
        .update({
          approved: next,
          approved_at: next ? new Date().toISOString() : null,
          approved_by: next ? user?.id ?? null : null,
        })
        .eq('id', row.id);
      if (error) throw error;
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, approved: next } : r));
      toast.success(next ? 'Oferta aprovada' : 'Aprovação removida');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao atualizar');
    } finally {
      setBusyId(null);
    }
  };

  const toggleDefinitive = async (row: Row) => {
    const next = !row.is_definitive;
    setBusyId(row.id);
    try {
      if (next) {
        const { error: clearErr } = await (supabase as any)
          .from('user_offers')
          .update({ is_definitive: false })
          .eq('user_id', row.user_id)
          .eq('is_definitive', true);
        if (clearErr) throw clearErr;
      }
      const { error } = await (supabase as any)
        .from('user_offers')
        .update({ is_definitive: next })
        .eq('id', row.id);
      if (error) throw error;
      setRows(prev => prev.map(r =>
        r.user_id === row.user_id
          ? { ...r, is_definitive: next && r.id === row.id }
          : r
      ));
      toast.success(next ? 'Definida como oferta principal' : 'Oferta principal removida');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao atualizar');
    } finally {
      setBusyId(null);
    }
  };

  const removeOffer = async (row: Row) => {
    if (!window.confirm(`Excluir a oferta "${row.nome}" de ${row.profile?.nome || row.profile?.email || 'aluno'}? Esta ação não pode ser desfeita.`)) return;
    setBusyId(row.id);
    try {
      const { error } = await (supabase as any)
        .from('user_offers')
        .delete()
        .eq('id', row.id);
      if (error) throw error;
      setRows(prev => prev.filter(r => r.id !== row.id));
      await logActivity({
        action: 'delete',
        entity_type: 'user_offer',
        entity_id: row.id,
        entity_label: row.nome,
        metadata: { user_id: row.user_id, email: row.profile?.email ?? null },
      });
      toast.success('Oferta excluída');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao excluir');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter(r => {
      if (filter === 'approved' && !r.approved) return false;
      if (filter === 'definitive' && !r.is_definitive) return false;
      if (!t) return true;
      return (
        r.nome.toLowerCase().includes(t) ||
        !!r.profile?.email?.toLowerCase().includes(t) ||
        !!r.profile?.nome?.toLowerCase().includes(t)
      );
    });
  }, [rows, q, filter]);

  return (
    <>
      <h1 className="text-lg sm:text-xl font-medium text-primary-foreground mb-4 sm:mb-6">
        Ofertas dos Usuários <span className="text-muted-foreground text-sm">({rows.length})</span>
      </h1>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por oferta, usuário ou email…"
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-1.5">
          {([['all', 'Todas'], ['approved', 'Aprovadas'], ['definitive', 'Principais']] as [Filter, string][]).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${filter === k ? 'bg-primary/15 border-primary/40 text-foreground' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-10">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10">Nenhuma oferta encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(r => (
            <div
              key={r.id}
              className={r.is_definitive
                ? 'rounded-[0.9rem] p-[2px] bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-[0_0_35px_-12px_rgba(59,130,246,0.7)]'
                : ''}
            >
              <div className={`bg-card border rounded-xl p-5 h-full ${r.is_definitive ? 'border-transparent' : 'border-border'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-medium text-foreground leading-tight">{r.nome}</h3>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <button
                    disabled={busyId === r.id}
                    onClick={() => toggleApproved(r)}
                    title={r.approved ? 'Remover aprovação' : 'Aprovar oferta'}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors disabled:opacity-50 ${r.approved ? 'bg-amber-400/10 border-amber-400/40 text-amber-300' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    <Star className={`w-3.5 h-3.5 ${r.approved ? 'fill-amber-300 text-amber-300' : ''}`} />
                    {r.approved ? 'Aprovada' : 'Aprovar'}
                  </button>
                  <button
                    disabled={busyId === r.id}
                    onClick={() => toggleDefinitive(r)}
                    title="Marcar como oferta definitiva do aluno"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors disabled:opacity-50 ${r.is_definitive ? 'bg-gradient-to-r from-sky-500/25 to-indigo-500/25 border-sky-400/50 text-sky-200' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    {r.is_definitive ? 'Oferta definitiva' : 'Definir principal'}
                  </button>
                  {busyId === r.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 truncate">
                  <UserIcon className="w-3 h-3 shrink-0" />
                  <span className="truncate">{r.profile?.nome || '—'} {r.profile?.email && <span className="opacity-60">• {r.profile.email}</span>}</span>
                </div>

                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {r.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-foreground/70">{t}</span>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5 mb-3">
                  {r.link_bib && <LinkRow icon={Library} label="Biblioteca" href={r.link_bib} />}
                  {r.link_drive && <LinkRow icon={FolderOpen} label="Drive" href={r.link_drive} />}
                  {r.link_site && <LinkRow icon={Globe} label="Site" href={r.link_site} />}
                  {r.link_checkout && <LinkRow icon={ShoppingCart} label="Checkout" href={r.link_checkout} />}
                </div>

                {r.copy_texto && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Copy ({r.copy_texto.length} car.)</summary>
                    <pre className="mt-2 p-3 bg-secondary rounded-lg whitespace-pre-wrap font-mono text-[11px] text-foreground/80 max-h-60 overflow-y-auto">{r.copy_texto}</pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function LinkRow({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-xs text-foreground/80 hover:text-foreground hover:bg-secondary/70 transition-colors">
      <Icon className="w-3.5 h-3.5" />
      <span className="flex-1 truncate">{label}</span>
      <ExternalLink className="w-3 h-3 opacity-50" />
    </a>
  );
}
