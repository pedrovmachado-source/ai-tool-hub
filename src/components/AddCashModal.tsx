import { useEffect, useState } from 'react';
import { X, Wallet, CreditCard, QrCode, Copy, Check, Loader2, ArrowDownLeft } from 'lucide-react';
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-gradient-to-r from-card via-card to-secondary/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-teal/15 flex items-center justify-center">
              <ArrowDownLeft size={18} className="text-brand-teal" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Adicionar saldo</h3>
              <p className="text-[11px] text-muted-foreground">Escolha como deseja depositar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Valor Input */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Valor do depósito
            </label>
            <div className="relative">
              <div className="flex items-center gap-3 bg-secondary/60 rounded-xl px-4 py-4 border border-border/60 focus-within:border-brand-teal/60 focus-within:ring-1 focus-within:ring-brand-teal/20 transition-all">
                <span className="text-sm text-muted-foreground font-medium">R$</span>
                <input
                  value={amount}
                  onChange={e => setAmount(formatAmountInput(e.target.value))}
                  inputMode="numeric"
                  placeholder="0,00"
                  className="flex-1 bg-transparent outline-none text-2xl font-bold tabular-nums text-foreground placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {PRESETS.map(v => (
                <button
                  key={v}
                  onClick={() => setPreset(v)}
                  className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold bg-secondary/60 hover:bg-brand-teal/10 border border-border/60 hover:border-brand-teal/30 text-foreground hover:text-brand-teal transition-all"
                >
                  R$ {v}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
            <button
              onClick={() => setTab('pix')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                tab === 'pix'
                  ? 'bg-card shadow-sm text-brand-teal ring-1 ring-border/40'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <QrCode size={16} /> PIX
            </button>
            <button
              onClick={() => setTab('card')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                tab === 'card'
                  ? 'bg-card shadow-sm text-brand-blue ring-1 ring-border/40'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CreditCard size={16} /> Cartão
            </button>
          </div>

          {tab === 'pix' ? (
            <div className="space-y-4">
              {pixSent ? (
                <div className="p-5 rounded-xl bg-brand-teal/8 border border-brand-teal/25 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-brand-teal/15 flex items-center justify-center mx-auto">
                    <Check className="text-brand-teal" size={24} />
                  </div>
                  <p className="text-sm font-semibold">Depósito registrado!</p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    O saldo será creditado após confirmação do administrador (até 24h).
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-secondary/40 rounded-xl p-5 border border-border/60 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                        <QrCode size={14} className="text-brand-teal" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {pix?.key_type || 'Chave PIX'}
                        </div>
                        {pix?.recipient && (
                          <div className="text-[11px] text-muted-foreground/70">{pix.recipient}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-card rounded-lg p-3 border border-border/40">
                      <code className="text-[13px] font-mono break-all text-foreground/90">{pix?.key || '—'}</code>
                      <button
                        onClick={copy}
                        className="shrink-0 px-3 py-2 rounded-lg bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                      </button>
                    </div>
                  </div>
                  {pix?.instructions && (
                    <p className="text-[12px] text-muted-foreground leading-relaxed px-1">{pix.instructions}</p>
                  )}
                  <button
                    onClick={registerPix}
                    disabled={loading || amountCents < 500}
                    className="w-full py-3 rounded-xl bg-brand-teal text-white text-sm font-bold hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-teal/20"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Já paguei {formatBRL(amountCents)}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/15 flex items-start gap-3">
                <CreditCard size={16} className="text-brand-blue mt-0.5 shrink-0" />
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Pagamento processado de forma segura pelo Stripe. Seu saldo é creditado automaticamente após a confirmação.
                </p>
              </div>
              <button
                onClick={payWithCard}
                disabled={loading || amountCents < 500}
                className="w-full py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-blue/20"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                Pagar {formatBRL(amountCents)} no cartão
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
