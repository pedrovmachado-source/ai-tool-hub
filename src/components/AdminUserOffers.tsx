import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, ExternalLink, Library, FolderOpen, Globe, ShoppingCart, User as UserIcon, Loader2 } from 'lucide-react';

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
  profile?: { nome: string | null; email: string | null } | null;
};

export default function AdminUserOffers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

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
        setRows(list.map(r => ({ ...r, profile: profilesMap[r.user_id] || null, tags: Array.isArray(r.tags) ? r.tags : [] })));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const t = q.toLowerCase();
    return rows.filter(r =>
      r.nome.toLowerCase().includes(t) ||
      r.profile?.email?.toLowerCase().includes(t) ||
      r.profile?.nome?.toLowerCase().includes(t)
    );
  }, [rows, q]);

  return (
    <>
      <h1 className="text-lg sm:text-xl font-medium text-primary-foreground mb-4 sm:mb-6">
        Ofertas dos Usuários <span className="text-muted-foreground text-sm">({rows.length})</span>
      </h1>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por oferta, usuário ou email…"
          className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-10">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10">Nenhuma oferta cadastrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-medium text-foreground leading-tight">{r.nome}</h3>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(r.created_at).toLocaleDateString('pt-BR')}
                </span>
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
