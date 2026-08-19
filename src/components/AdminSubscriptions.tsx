import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Link2, Check } from 'lucide-react';

interface UnmatchedSale {
  id: string;
  sale_id: string | null;
  event: string | null;
  email: string | null;
  payload: any;
  resolved: boolean;
  received_at: string;
}

interface AccessClaim {
  id: string;
  user_id: string;
  login_email: string;
  purchase_email: string;
  note: string | null;
  status: string;
  created_at: string;
}

interface KirvanoEvent {
  id: string;
  sale_id: string | null;
  event: string;
  processed_at: string;
  payload: any;
}

const fmt = (d: string) => new Date(d).toLocaleString('pt-BR');

export default function AdminSubscriptions() {
  const [tab, setTab] = useState<'unmatched' | 'claims' | 'events'>('unmatched');
  const [loading, setLoading] = useState(true);
  const [unmatched, setUnmatched] = useState<UnmatchedSale[]>([]);
  const [claims, setClaims] = useState<AccessClaim[]>([]);
  const [events, setEvents] = useState<KirvanoEvent[]>([]);
  const [grantEmail, setGrantEmail] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [u, c, e] = await Promise.all([
      supabase.from('unmatched_sales').select('*').order('received_at', { ascending: false }).limit(100),
      supabase.from('access_claims').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('kirvano_events').select('id, sale_id, event, processed_at, payload').order('processed_at', { ascending: false }).limit(100),
    ]);
    setUnmatched((u.data as UnmatchedSale[]) || []);
    setClaims((c.data as AccessClaim[]) || []);
    setEvents((e.data as KirvanoEvent[]) || []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  /** Libera 30 dias de acesso para o e-mail de login informado. */
  const grantAccess = async (key: string, loginEmail: string, note: string) => {
    const email = loginEmail.trim().toLowerCase();
    if (!email) { toast({ title: 'Informe o e-mail de login', variant: 'destructive' }); return; }
    setBusy(key);
    const { data: sub, error } = await supabase
      .from('subscribers')
      .select('id, user_id, access_until')
      .ilike('email', email)
      .maybeSingle();
    if (error || !sub) {
      setBusy(null);
      toast({ title: 'Usuário não encontrado', description: 'Esse e-mail não tem conta na plataforma.', variant: 'destructive' });
      return;
    }
    const now = new Date();
    const current = sub.access_until ? new Date(sub.access_until as string) : null;
    const base = current && current > now ? current : now;
    const until = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: upErr } = await supabase
      .from('subscribers')
      .update({ access_until: until, access_source: 'subscription', subscription_status: 'active' })
      .eq('id', sub.id);
    setBusy(null);
    if (upErr) { toast({ title: 'Erro ao liberar', description: upErr.message, variant: 'destructive' }); return; }
    toast({ title: 'Acesso liberado', description: `${email} até ${new Date(until).toLocaleDateString('pt-BR')} (${note})` });
    void load();
  };

  const resolveUnmatched = async (id: string) => {
    await supabase.from('unmatched_sales').update({ resolved: true }).eq('id', id);
    void load();
  };

  const resolveClaim = async (id: string) => {
    await supabase.from('access_claims').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', id);
    void load();
  };

  const tabs: { key: typeof tab; label: string; count: number }[] = [
    { key: 'unmatched', label: 'Vendas sem usuário', count: unmatched.filter(u => !u.resolved).length },
    { key: 'claims', label: 'Já paguei e não liberou', count: claims.filter(c => c.status === 'pending').length },
    { key: 'events', label: 'Log de eventos', count: events.length },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-3xl font-serif-display tracking-tight text-white">Assinaturas</h1>
        <Button variant="outline" size="sm" onClick={() => void load()} className="border-white/10 bg-white/5">
          <RefreshCw size={14} className="mr-2" /> Atualizar
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${tab === t.key ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
          >
            {t.label} {t.count > 0 && <span className="ml-1 opacity-60">({t.count})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      ) : tab === 'unmatched' ? (
        <div className="space-y-3">
          {unmatched.length === 0 && <p className="text-white/30 text-sm">Nenhuma venda sem usuário.</p>}
          {unmatched.map(u => (
            <div key={u.id} className={`glass-smooth border rounded-2xl p-5 ${u.resolved ? 'border-white/5 opacity-50' : 'border-amber-400/20'}`}>
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="text-white text-sm">{u.email || 'sem e-mail'}</p>
                  <p className="text-white/30 text-[11px] uppercase tracking-widest mt-1">
                    {u.event} · venda {u.sale_id || '—'} · {fmt(u.received_at)}
                  </p>
                </div>
                {!u.resolved && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="E-mail de login do usuário"
                      value={grantEmail[u.id] ?? (u.email || '')}
                      onChange={(e) => setGrantEmail(p => ({ ...p, [u.id]: e.target.value }))}
                      className="h-9 w-56 bg-white/5 border-white/10 text-sm"
                    />
                    <Button
                      size="sm"
                      disabled={busy === u.id}
                      onClick={() => void grantAccess(u.id, grantEmail[u.id] ?? (u.email || ''), 'venda sem usuário')}
                      className="bg-white text-black hover:bg-white/90"
                    >
                      {busy === u.id ? <Loader2 size={14} className="animate-spin" /> : <><Link2 size={14} className="mr-1" /> Liberar 30d</>}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void resolveUnmatched(u.id)} className="border-white/10 bg-white/5">
                      <Check size={14} />
                    </Button>
                  </div>
                )}
              </div>
              <details className="mt-3">
                <summary className="text-[11px] text-white/30 cursor-pointer">Ver payload</summary>
                <pre className="mt-2 text-[10px] text-white/40 overflow-x-auto">{JSON.stringify(u.payload, null, 2)}</pre>
              </details>
            </div>
          ))}
        </div>
      ) : tab === 'claims' ? (
        <div className="space-y-3">
          {claims.length === 0 && <p className="text-white/30 text-sm">Nenhum pedido registrado.</p>}
          {claims.map(c => (
            <div key={c.id} className={`glass-smooth border rounded-2xl p-5 ${c.status === 'pending' ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="text-white text-sm">Login: {c.login_email}</p>
                  <p className="text-white/60 text-sm">Compra: {c.purchase_email}</p>
                  {c.note && <p className="text-white/40 text-xs mt-1">{c.note}</p>}
                  <p className="text-white/30 text-[11px] uppercase tracking-widest mt-1">{fmt(c.created_at)} · {c.status}</p>
                </div>
                {c.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={busy === c.id}
                      onClick={() => void grantAccess(c.id, c.login_email, 'claim manual')}
                      className="bg-white text-black hover:bg-white/90"
                    >
                      {busy === c.id ? <Loader2 size={14} className="animate-spin" /> : 'Liberar 30d'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void resolveClaim(c.id)} className="border-white/10 bg-white/5">
                      Marcar resolvido
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {events.length === 0 && <p className="text-white/30 text-sm">Nenhum evento recebido ainda.</p>}
          {events.map(e => (
            <details key={e.id} className="glass-smooth border border-white/5 rounded-xl p-4">
              <summary className="cursor-pointer text-sm text-white/70">
                <span className="font-bold uppercase tracking-widest text-[11px] text-white/40 mr-2">{e.event}</span>
                {e.sale_id || '—'} · {fmt(e.processed_at)}
              </summary>
              <pre className="mt-2 text-[10px] text-white/40 overflow-x-auto">{JSON.stringify(e.payload, null, 2)}</pre>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
