import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Check, X, RefreshCw, Wallet, Save } from 'lucide-react';
import { formatBRL } from './CashBalance';

interface Deposit {
  id: string;
  user_id: string;
  amount_cents: number;
  status: 'pending' | 'approved' | 'rejected';
  payer_note: string | null;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  user_nome: string;
  user_email: string;
}

interface PixConfig {
  key: string;
  key_type: string;
  recipient: string;
  instructions: string;
}

const DEFAULT_PIX: PixConfig = { key: '', key_type: 'E-mail', recipient: '', instructions: '' };

export default function AdminCashDeposits() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [pix, setPix] = useState<PixConfig>(DEFAULT_PIX);
  const [savingPix, setSavingPix] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('list_pix_deposits_admin', {
        p_status: filter === 'all' ? null : filter,
      });
      if (error) throw error;
      setDeposits((data || []) as Deposit[]);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'pix_deposit').maybeSingle().then(({ data }) => {
      if (data?.value) setPix({ ...DEFAULT_PIX, ...(data.value as any) });
    });
  }, []);

  const review = async (id: string, approve: boolean) => {
    const note = approve ? null : window.prompt('Motivo da rejeição (opcional):') || null;
    const { data, error } = await supabase.rpc('review_pix_deposit', {
      p_deposit_id: id,
      p_approve: approve,
      p_note: note,
    });
    if (error || !(data as any)?.success) {
      toast({ title: 'Erro', description: error?.message || (data as any)?.error || 'Falha', variant: 'destructive' });
      return;
    }
    toast({ title: approve ? 'Depósito aprovado e saldo creditado' : 'Depósito rejeitado' });
    void load();
  };

  const savePix = async () => {
    setSavingPix(true);
    const { error } = await supabase.from('site_settings').upsert(
      { key: 'pix_deposit', value: pix as any },
      { onConflict: 'key' }
    );
    setSavingPix(false);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Configuração PIX salva' });
  };

  return (
    <>
      <h1 className="text-lg sm:text-xl font-medium text-primary-foreground mb-4 sm:mb-6 flex items-center gap-2">
        <Wallet size={20} /> Depósitos de Saldo (PIX)
      </h1>

      <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-4 sm:p-5 mb-6">
        <h2 className="text-sm font-medium text-primary-foreground mb-3">Configuração PIX exibida ao usuário</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground">Tipo de chave</label>
            <select value={pix.key_type} onChange={e => setPix({ ...pix, key_type: e.target.value })}
              className="w-full bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg px-3 py-2 text-[13px] text-primary-foreground">
              {['E-mail', 'CPF', 'CNPJ', 'Telefone', 'Aleatória'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Chave PIX (copia e cola)</label>
            <input value={pix.key} onChange={e => setPix({ ...pix, key: e.target.value })}
              className="w-full bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg px-3 py-2 text-[13px] text-primary-foreground" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Favorecido</label>
            <input value={pix.recipient} onChange={e => setPix({ ...pix, recipient: e.target.value })}
              className="w-full bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg px-3 py-2 text-[13px] text-primary-foreground" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[11px] text-muted-foreground">Instruções ao usuário</label>
            <textarea value={pix.instructions} onChange={e => setPix({ ...pix, instructions: e.target.value })} rows={2}
              className="w-full bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg px-3 py-2 text-[13px] text-primary-foreground resize-none" />
          </div>
        </div>
        <button onClick={savePix} disabled={savingPix}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-brand-blue/20 text-brand-blue-medium hover:bg-brand-blue/30 disabled:opacity-50">
          <Save size={14} /> {savingPix ? 'Salvando…' : 'Salvar PIX'}
        </button>
      </div>

      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-1.5 bg-primary-foreground/5 p-1 rounded-lg">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium ${filter === f ? 'bg-primary-foreground/15 text-primary-foreground' : 'text-muted-foreground hover:text-primary-foreground'}`}>
              {f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : f === 'rejected' ? 'Rejeitados' : 'Todos'}
            </button>
          ))}
        </div>
        <button onClick={() => void load()} className="p-2 rounded-lg bg-primary-foreground/5 hover:bg-primary-foreground/10 text-primary-foreground/60">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl divide-y divide-primary-foreground/[0.07]">
        {loading && <p className="px-5 py-10 text-center text-sm text-muted-foreground">Carregando…</p>}
        {!loading && deposits.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground/60">Nenhum depósito.</p>
        )}
        {!loading && deposits.map(d => (
          <div key={d.id} className="p-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
            <div>
              <div className="text-sm font-medium text-primary-foreground">{d.user_nome || d.user_email}</div>
              <div className="text-[11px] text-muted-foreground">{d.user_email}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{new Date(d.created_at).toLocaleString('pt-BR')}</div>
              {d.payer_note && <div className="text-[11px] text-muted-foreground mt-1 italic">{d.payer_note}</div>}
              {d.admin_note && <div className="text-[11px] text-brand-amber mt-1">Nota: {d.admin_note}</div>}
            </div>
            <div className="text-lg font-bold text-brand-green tabular-nums">{formatBRL(d.amount_cents)}</div>
            <div className={`text-[11px] font-medium px-2 py-1 rounded ${
              d.status === 'pending' ? 'bg-brand-amber/15 text-brand-amber' :
              d.status === 'approved' ? 'bg-brand-green/15 text-brand-green' :
              'bg-brand-red/15 text-brand-red'
            }`}>
              {d.status === 'pending' ? 'Pendente' : d.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
            </div>
            {d.status === 'pending' ? (
              <div className="flex gap-2">
                <button onClick={() => review(d.id, true)} title="Aprovar e creditar"
                  className="p-2 rounded-lg bg-brand-green/20 text-brand-green hover:bg-brand-green/30">
                  <Check size={16} />
                </button>
                <button onClick={() => review(d.id, false)} title="Rejeitar"
                  className="p-2 rounded-lg bg-brand-red/20 text-brand-red hover:bg-brand-red/30">
                  <X size={16} />
                </button>
              </div>
            ) : <div />}
          </div>
        ))}
      </div>
    </>
  );
}
