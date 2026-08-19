import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Meta from '@/components/Meta';
import AdminSubscriptions from '@/components/AdminSubscriptions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Loader2, RefreshCw, ShieldAlert, Ticket, Users, Receipt, ScrollText, BarChart3,
  Copy, Plus, Power, GraduationCap, CalendarClock,
} from 'lucide-react';

type Section = 'metrics' | 'invites' | 'users' | 'sales' | 'events';

interface Metrics {
  total_users: number;
  active_access: number;
  by_invite: number;
  by_subscription: number;
  blocked: number;
  mrr_cents: number;
  pending_claims: number;
  unmatched_open: number;
}

interface Invite {
  id: string;
  code: string;
  description: string | null;
  max_uses: number;
  uses: number;
  redeem_until: string | null;
  grants_access_until: string | null;
  active: boolean;
  is_used: boolean;
  created_at: string;
  owner_email: string;
}

interface AdminUser {
  user_id: string;
  email: string;
  nome: string;
  plano: string;
  abuse_blocked: boolean;
  subscription_status: string | null;
  access_until: string | null;
  access_source: string | null;
  plan_name: string | null;
  next_charge_date: string | null;
  roles: string[];
  created_at: string;
}

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—');
const fmtDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString('pt-BR') : '—');
const toDateInput = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ------------------------------------------------------------------ métricas */

function MetricsGrid({ metrics }: { metrics: Metrics | null }) {
  const cards = [
    { label: 'Usuários', value: metrics ? String(metrics.total_users) : '—' },
    { label: 'Acessos ativos', value: metrics ? String(metrics.active_access) : '—' },
    { label: 'Por convite', value: metrics ? String(metrics.by_invite) : '—' },
    { label: 'Por assinatura', value: metrics ? String(metrics.by_subscription) : '—' },
    { label: 'Bloqueados', value: metrics ? String(metrics.blocked) : '—' },
    { label: 'Receita recorrente est.', value: metrics ? brl(metrics.mrr_cents) : '—' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map(c => (
        <div key={c.label} className="glass-smooth border border-white/5 rounded-2xl p-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{c.label}</p>
          <p className="text-xl md:text-2xl font-serif-display text-white mt-2">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ convites */

function InvitesSection({ onChanged }: { onChanged: () => void }) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState({
    quantity: '1',
    description: '',
    maxUses: '1',
    redeemUntil: '',
    accessUntil: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_invites');
    setLoading(false);
    if (error) { toast({ title: 'Erro ao carregar convites', description: error.message, variant: 'destructive' }); return; }
    setInvites((data as Invite[]) || []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    setBusy('create');
    const { data, error } = await supabase.rpc('admin_create_invites', {
      p_quantity: Math.max(1, Number(form.quantity) || 1),
      p_description: form.description.trim() || null,
      p_max_uses: Math.max(1, Number(form.maxUses) || 1),
      p_redeem_until: form.redeemUntil ? new Date(`${form.redeemUntil}T23:59:59`).toISOString() : null,
      p_grants_access_until: form.accessUntil ? new Date(`${form.accessUntil}T23:59:59`).toISOString() : null,
    });
    setBusy(null);
    if (error) { toast({ title: 'Erro ao gerar', description: error.message, variant: 'destructive' }); return; }
    const codes = ((data as { code: string }[]) || []).map(c => c.code);
    if (codes.length > 1) {
      await navigator.clipboard.writeText(codes.join('\n')).catch(() => {});
      toast({ title: `${codes.length} códigos gerados`, description: 'Todos copiados para a área de transferência.' });
    } else {
      toast({ title: 'Código gerado', description: codes[0] });
    }
    setForm(f => ({ ...f, description: '' }));
    void load();
    onChanged();
  };

  const toggle = async (invite: Invite) => {
    setBusy(invite.id);
    const { error } = await supabase.rpc('admin_set_invite_active', { p_invite_id: invite.id, p_active: !invite.active });
    setBusy(null);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setInvites(prev => prev.map(i => (i.id === invite.id ? { ...i, active: !i.active } : i)));
  };

  const copy = async (code: string) => {
    await navigator.clipboard.writeText(code).catch(() => {});
    toast({ title: 'Código copiado', description: code });
  };

  const statusOf = (i: Invite) => {
    if (!i.active) return { label: 'Desativado', cls: 'text-white/40 bg-white/5' };
    if (i.uses >= Math.max(i.max_uses, 1)) return { label: 'Esgotado', cls: 'text-amber-300 bg-amber-400/10' };
    if (i.redeem_until && new Date(i.redeem_until) < new Date()) return { label: 'Expirado', cls: 'text-red-300 bg-red-400/10' };
    return { label: 'Disponível', cls: 'text-emerald-300 bg-emerald-400/10' };
  };

  return (
    <div className="space-y-6">
      <div className="glass-smooth border border-white/5 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Criar / gerar em lote</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-white/40">Quantidade</Label>
            <Input type="number" min={1} max={200} value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              className="h-10 bg-white/5 border-white/10 mt-1" />
          </div>
          <div className="sm:col-span-1 xl:col-span-2">
            <Label className="text-[10px] uppercase tracking-widest text-white/40">Descrição</Label>
            <Input value={form.description} placeholder="Ex.: Lote lançamento agosto"
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="h-10 bg-white/5 border-white/10 mt-1" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-white/40">Limite de usos</Label>
            <Input type="number" min={1} value={form.maxUses}
              onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
              className="h-10 bg-white/5 border-white/10 mt-1" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-white/40">Prazo de resgate</Label>
            <Input type="date" value={form.redeemUntil}
              onChange={e => setForm(f => ({ ...f, redeemUntil: e.target.value }))}
              className="h-10 bg-white/5 border-white/10 mt-1" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-white/40">Acesso até (concedido)</Label>
            <Input type="date" value={form.accessUntil}
              onChange={e => setForm(f => ({ ...f, accessUntil: e.target.value }))}
              className="h-10 bg-white/5 border-white/10 mt-1" />
          </div>
          <div className="flex items-end">
            <Button onClick={() => void create()} disabled={busy === 'create'}
              className="h-10 w-full bg-white text-black hover:bg-white/90">
              {busy === 'create' ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} className="mr-1" /> Gerar</>}
            </Button>
          </div>
        </div>
        <p className="text-[11px] text-white/30 mt-3">
          Sem prazo de resgate o código não expira. Sem “acesso até” o convite só valida a conta, sem liberar assinatura.
        </p>
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      ) : (
        <div className="glass-smooth border border-white/5 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.18em] text-white/35 border-b border-white/5">
                <th className="text-left p-4">Código</th>
                <th className="text-left p-4">Descrição</th>
                <th className="text-left p-4">Usos</th>
                <th className="text-left p-4">Resgate até</th>
                <th className="text-left p-4">Acesso até</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-white/30">Nenhum código criado.</td></tr>
              )}
              {invites.map(i => {
                const st = statusOf(i);
                return (
                  <tr key={i.id} className="border-b border-white/5 last:border-0">
                    <td className="p-4 font-mono text-white">{i.code}</td>
                    <td className="p-4 text-white/60">{i.description || '—'}</td>
                    <td className="p-4 text-white/60">{i.uses}/{Math.max(i.max_uses, 1)}</td>
                    <td className="p-4 text-white/60">{fmtDate(i.redeem_until)}</td>
                    <td className="p-4 text-white/60">{fmtDate(i.grants_access_until)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-widest ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => void copy(i.code)} className="border-white/10 bg-white/5">
                          <Copy size={13} />
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy === i.id}
                          onClick={() => void toggle(i)}
                          className={`border-white/10 bg-white/5 ${i.active ? 'text-white/70' : 'text-emerald-300'}`}>
                          {busy === i.id ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ usuários */

function UsersSection({ onChanged }: { onChanged: () => void }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ date: string; reason: string }>({ date: '', reason: '' });

  const load = useCallback(async (term: string) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_users', { p_search: term || null, p_limit: 200 });
    setLoading(false);
    if (error) { toast({ title: 'Erro ao carregar usuários', description: error.message, variant: 'destructive' }); return; }
    setUsers((data as AdminUser[]) || []);
  }, []);

  useEffect(() => { void load(''); }, [load]);

  const startEdit = (u: AdminUser) => {
    setEditing(u.user_id);
    setDraft({ date: toDateInput(u.access_until), reason: '' });
  };

  const saveAccess = async (u: AdminUser) => {
    if (!draft.reason.trim()) {
      toast({ title: 'Justificativa obrigatória', description: 'Descreva o motivo da liberação manual.', variant: 'destructive' });
      return;
    }
    setBusy(u.user_id);
    const { error } = await supabase.rpc('admin_set_access_until', {
      p_user_id: u.user_id,
      p_access_until: draft.date ? new Date(`${draft.date}T23:59:59`).toISOString() : null,
      p_reason: draft.reason.trim(),
      p_source: 'manual',
    });
    setBusy(null);
    if (error) { toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Acesso atualizado', description: `${u.email} → ${draft.date ? fmtDate(new Date(`${draft.date}T23:59:59`).toISOString()) : 'sem acesso'}` });
    setEditing(null);
    void load(search);
    onChanged();
  };

  const toggleRole = async (u: AdminUser, role: 'mentorado') => {
    const grant = !u.roles.includes(role);
    setBusy(`${u.user_id}:${role}`);
    const { error } = await supabase.rpc('admin_set_role', { p_user_id: u.user_id, p_role: role, p_grant: grant });
    setBusy(null);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setUsers(prev => prev.map(x => x.user_id === u.user_id
      ? { ...x, roles: grant ? [...x.roles, role] : x.roles.filter(r => r !== role) }
      : x));
    toast({ title: grant ? 'Mentorado atribuído' : 'Mentorado removido', description: u.email });
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => { e.preventDefault(); void load(search); }}
        className="flex gap-2"
      >
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por e-mail ou nome"
          className="h-10 bg-white/5 border-white/10 max-w-sm" />
        <Button type="submit" variant="outline" className="h-10 border-white/10 bg-white/5">Buscar</Button>
      </form>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      ) : (
        <div className="space-y-3">
          {users.length === 0 && <p className="text-white/30 text-sm">Nenhum usuário encontrado.</p>}
          {users.map(u => {
            const active = u.access_until && new Date(u.access_until) > new Date();
            return (
              <div key={u.user_id} className="glass-smooth border border-white/5 rounded-2xl p-5">
                <div className="flex flex-wrap gap-4 items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{u.email || '—'}</p>
                    <p className="text-white/40 text-xs mt-0.5">{u.nome || 'sem nome'} · desde {fmtDate(u.created_at)}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] uppercase tracking-widest">
                      <span className={`px-2 py-1 rounded-full ${active ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-white/40'}`}>
                        {active ? `Ativo até ${fmtDate(u.access_until)}` : 'Sem acesso'}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-white/5 text-white/40">{u.subscription_status || 'none'}</span>
                      <span className="px-2 py-1 rounded-full bg-white/5 text-white/40">{u.access_source || 'sem origem'}</span>
                      {u.abuse_blocked && <span className="px-2 py-1 rounded-full bg-red-400/10 text-red-300">Bloqueado</span>}
                      {u.roles.map(r => (
                        <span key={r} className="px-2 py-1 rounded-full bg-primary/15 text-primary">{r}</span>
                      ))}
                    </div>
                    {u.next_charge_date && (
                      <p className="text-white/30 text-[11px] mt-2">Próxima cobrança: {fmtDate(u.next_charge_date)}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline"
                      disabled={busy === `${u.user_id}:mentorado`}
                      onClick={() => void toggleRole(u, 'mentorado')}
                      className={`border-white/10 bg-white/5 ${u.roles.includes('mentorado') ? 'text-primary' : 'text-white/60'}`}>
                      {busy === `${u.user_id}:mentorado`
                        ? <Loader2 size={13} className="animate-spin" />
                        : <><GraduationCap size={13} className="mr-1" /> {u.roles.includes('mentorado') ? 'Remover mentorado' : 'Tornar mentorado'}</>}
                    </Button>
                    <Button size="sm" onClick={() => (editing === u.user_id ? setEditing(null) : startEdit(u))}
                      className="bg-white text-black hover:bg-white/90">
                      <CalendarClock size={13} className="mr-1" /> Editar validade
                    </Button>
                  </div>
                </div>

                {editing === u.user_id && (
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest text-white/40">Acesso até</Label>
                      <Input type="date" value={draft.date}
                        onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
                        className="h-10 bg-white/5 border-white/10 mt-1" />
                      <p className="text-[10px] text-white/30 mt-1">Vazio = remover acesso.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/40">Justificativa (obrigatória)</Label>
                      <Textarea value={draft.reason} rows={2}
                        placeholder="Ex.: pagamento confirmado no extrato da Kirvano em 12/08, e-mail divergente."
                        onChange={e => setDraft(d => ({ ...d, reason: e.target.value }))}
                        className="bg-white/5 border-white/10 mt-1 text-sm" />
                    </div>
                    <div className="sm:col-span-3 flex gap-2">
                      <Button size="sm" disabled={busy === u.user_id} onClick={() => void saveAccess(u)}
                        className="bg-white text-black hover:bg-white/90">
                        {busy === u.user_id ? <Loader2 size={14} className="animate-spin" /> : 'Salvar validade'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="border-white/10 bg-white/5">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- página */

export default function AdminAccess() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [section, setSection] = useState<Section>('metrics');
  const [refreshing, setRefreshing] = useState(false);

  const loadMetrics = useCallback(async () => {
    setRefreshing(true);
    const { data, error } = await supabase.rpc('admin_metrics');
    setRefreshing(false);
    if (error) { setAllowed(false); return; }
    setAllowed(true);
    setMetrics(data as unknown as Metrics);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth', { replace: true }); return; }
    void loadMetrics();
  }, [authLoading, user, navigate, loadMetrics]);

  const nav = useMemo(() => ([
    { key: 'metrics' as Section, label: 'Visão geral', icon: BarChart3 },
    { key: 'invites' as Section, label: 'Códigos de convite', icon: Ticket },
    { key: 'users' as Section, label: 'Usuários e acesso', icon: Users },
    { key: 'sales' as Section, label: 'Vendas e reivindicações', icon: Receipt },
    { key: 'events' as Section, label: 'Log Kirvano', icon: ScrollText },
  ]), []);

  if (authLoading || allowed === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background">
        <Meta title="Acesso restrito | Convert Club" description="Área administrativa restrita." />
        <Navbar onNavigate={(t) => navigate(t === 'home' ? '/' : `/${t}`)} />
        <div className="max-w-lg mx-auto px-6 pt-40 text-center">
          <ShieldAlert className="w-10 h-10 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-serif-display text-white">Acesso restrito</h1>
          <p className="text-white/40 text-sm mt-2">
            Esta área é exclusiva de administradores. A verificação é feita no servidor.
          </p>
          <Button onClick={() => navigate('/menu')} className="mt-6 bg-white text-black hover:bg-white/90">
            Voltar ao menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Meta title="Painel de acesso | Convert Club" description="Painel administrativo de acesso, convites e assinaturas." />
      <Navbar onNavigate={(t) => navigate(t === 'home' ? '/' : `/${t}`)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-24">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif-display tracking-tight text-white">Painel de acesso</h1>
            <p className="text-white/35 text-xs mt-1">Convites, assinaturas e liberações manuais.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadMetrics()} className="border-white/10 bg-white/5">
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : <><RefreshCw size={14} className="mr-2" /> Atualizar</>}
          </Button>
        </div>

        <div className="mb-8">
          <MetricsGrid metrics={metrics} />
          {metrics && (metrics.pending_claims > 0 || metrics.unmatched_open > 0) && (
            <button
              onClick={() => setSection('sales')}
              className="mt-3 w-full text-left glass-smooth border border-amber-400/20 rounded-2xl p-4 text-sm text-amber-200/80 hover:border-amber-400/40 transition-colors"
            >
              {metrics.unmatched_open} venda(s) sem usuário e {metrics.pending_claims} reivindicação(ões) pendente(s) — resolver agora.
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {nav.map(n => (
            <button
              key={n.key}
              onClick={() => setSection(n.key)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-2 transition-colors ${section === n.key ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
            >
              <n.icon size={13} /> {n.label}
            </button>
          ))}
        </div>

        {section === 'metrics' && (
          <div className="glass-smooth border border-white/5 rounded-2xl p-6 text-sm text-white/50 space-y-2">
            <p>O acesso é controlado por uma única data: <strong className="text-white/80">access_until</strong>.</p>
            <p>Convites concedem acesso até a data definida no código. Assinaturas são renovadas pelo webhook da Kirvano.</p>
            <p>Como a Kirvano não tem consulta por API, a liberação manual em “Usuários e acesso” é a ferramenta oficial para resolver pendências — toda alteração fica registrada com justificativa.</p>
          </div>
        )}
        {section === 'invites' && <InvitesSection onChanged={loadMetrics} />}
        {section === 'users' && <UsersSection onChanged={loadMetrics} />}
        {(section === 'sales' || section === 'events') && <AdminSubscriptions initialTab={section === 'events' ? 'events' : 'unmatched'} />}
      </div>
    </div>
  );
}
