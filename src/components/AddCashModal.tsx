import { useEffect, useState } from 'react';
import { X, Wallet, CreditCard, QrCode, Copy, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatBRL } from './CashBalance';

interface PixConfig {
  key: string;
  key_type: string;
  recipient: string;
  instructions: string;
}

const PRESETS = [50, 100, 200, 500];

export default function AddCashModal({ isOpen, onClose, onDeposited }: { isOpen: boolean; onClose: () => void; onDeposited?: () => void }) {
  const { user } = useAuth();
  const [tab, setTab] = useState<'pix' | 'card'>('pix');
  const [amount, setAmount] = useState<string>('100,00');
  const [pix, setPix] = useState<PixConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixSent, setPixSent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPixSent(false);
    supabase.from('site_settings').select('value').eq('key', 'pix_deposit').maybeSingle().then(({ data }) => {
      if (data?.value) setPix(data.value as any);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const amountCents = (() => {
    const n = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  })();

  const setPreset = (v: number) => setAmount(v.toFixed(2).replace('.', ','));

  const formatAmountInput = (v: string) => {
    const digits = v.replace(/\D/g, '');
    if (!digits) return '';
    const n = parseInt(digits, 10) / 100;
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const copy = async () => {
    if (!pix?.key) return;
    await navigator.clipboard.writeText(pix.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const registerPix = async () => {
    if (!user) return;
    if (amountCents < 500) { toast({ title: 'Valor mínimo R$ 5,00', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('pix_deposits').insert({
        user_id: user.id,
        amount_cents: amountCents,
        payer_note: `PIX para ${pix?.key} (${pix?.key_type})`,
        status: 'pending',
      });
      if (error) throw error;
      toast({ title: 'Depósito registrado!', description: 'O saldo será creditado após confirmação do admin (até 24h).' });
      setPixSent(true);
      onDeposited?.();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Falha ao registrar depósito', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const payWithCard = async () => {
    if (amountCents < 500) { toast({ title: 'Valor mínimo R$ 5,00', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { type: 'cash_deposit', amountCents },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Falha ao iniciar pagamento', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Wallet size={18} className="text-brand-green" /> Adicionar saldo
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Valor</label>
            <div className="mt-2 flex items-center gap-2 bg-secondary rounded-lg px-3 py-3 border border-border focus-within:border-brand-green">
              <span className="text-sm text-muted-foreground">R$</span>
              <input
                value={amount}
                onChange={e => setAmount(formatAmountInput(e.target.value))}
                inputMode="numeric"
                placeholder="0,00"
                className="flex-1 bg-transparent outline-none text-lg font-semibold tabular-nums"
              />
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {PRESETS.map(v => (
                <button
                  key={v}
                  onClick={() => setPreset(v)}
                  className="px-3 py-1 rounded-md text-[11px] font-medium bg-secondary hover:bg-secondary/70 border border-border"
                >
                  R$ {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 bg-secondary p-1 rounded-lg">
            <button
              onClick={() => setTab('pix')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-medium transition-colors ${tab === 'pix' ? 'bg-card shadow' : 'text-muted-foreground'}`}
            >
              <QrCode size={14} /> PIX
            </button>
            <button
              onClick={() => setTab('card')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-medium transition-colors ${tab === 'card' ? 'bg-card shadow' : 'text-muted-foreground'}`}
            >
              <CreditCard size={14} /> Cartão
            </button>
          </div>

          {tab === 'pix' ? (
            <div className="space-y-3">
              {pixSent ? (
                <div className="p-4 rounded-lg bg-brand-green/10 border border-brand-green/30 text-center">
                  <Check className="mx-auto mb-2 text-brand-green" size={28} />
                  <p className="text-sm font-medium">Depósito registrado!</p>
                  <p className="text-[12px] text-muted-foreground mt-1">Aguardando confirmação do admin (até 24h).</p>
                </div>
              ) : (
                <>
                  <div className="bg-secondary rounded-lg p-4 border border-border">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{pix?.key_type || 'Chave PIX'}</div>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-[13px] font-mono break-all">{pix?.key || '—'}</code>
                      <button onClick={copy} className="shrink-0 px-2.5 py-1.5 rounded-md bg-brand-green/15 text-brand-green hover:bg-brand-green/25 text-[11px] font-medium flex items-center gap-1">
                        {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                      </button>
                    </div>
                    {pix?.recipient && (
                      <div className="text-[11px] text-muted-foreground mt-2">Favorecido: {pix.recipient}</div>
                    )}
                  </div>
                  {pix?.instructions && (
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{pix.instructions}</p>
                  )}
                  <button
                    onClick={registerPix}
                    disabled={loading || amountCents < 500}
                    className="w-full py-2.5 rounded-lg bg-brand-green text-white text-sm font-semibold hover:bg-brand-green/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Já paguei {formatBRL(amountCents)}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[12px] text-muted-foreground">
                Pagamento processado de forma segura pelo Stripe. Seu saldo é creditado automaticamente após a confirmação.
              </p>
              <button
                onClick={payWithCard}
                disabled={loading || amountCents < 500}
                className="w-full py-2.5 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                Pagar {formatBRL(amountCents)} no cartão
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
