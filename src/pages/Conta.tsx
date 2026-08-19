import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CalendarClock, Loader2, MessageCircle, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  KIRVANO_PRICE_LABEL,
  SUPPORT_WHATSAPP,
  fetchSubscriber,
  formatDate,
  hasActiveAccess,
  type SubscriberRow,
} from '@/lib/kirvano';

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  past_due: 'Pagamento recusado (em retentativa)',
  canceled: 'Cancelada (acesso até o fim do período pago)',
  chargeback: 'Contestada',
  refunded: 'Reembolsada',
  none: 'Sem assinatura',
};

export default function Conta() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState<SubscriberRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setSub(await fetchSubscriber(user.id));
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  const active = hasActiveAccess(sub);
  const status = sub?.subscription_status || 'none';

  const submitClaim = async () => {
    if (!user) return;
    const email = purchaseEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Informe um e-mail válido usado na compra.');
      return;
    }
    setSending(true);
    const { error } = await supabase.from('access_claims').insert({
      user_id: user.id,
      login_email: user.email,
      purchase_email: email,
      note: note.trim() || null,
    });
    setSending(false);
    if (error) {
      toast.error('Não foi possível registrar. Tente novamente.');
      return;
    }
    setPurchaseEmail('');
    setNote('');
    toast.success('Registrado! Vamos verificar e liberar seu acesso.');
  };

  const whatsappLink = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('Olá! Preciso de ajuda com minha assinatura do Convert Club.')}`;

  return (
    <div className="min-h-screen bg-black text-white">
      <Meta title="Minha conta — Convert Club" description="Status da sua assinatura, validade do acesso e suporte." />
      <Navbar onNavigate={(page) => { if (page === 'menu') navigate('/menu'); else if (page === 'profile') navigate('/perfil'); else navigate('/'); }} />

      <main className="max-w-3xl mx-auto px-5 pt-28 pb-24 space-y-6">
        <div>
          <h1 className="text-4xl font-serif">Minha conta</h1>
          <p className="mt-2 text-white/40 text-sm">Assinatura, acesso e suporte.</p>
        </div>

        {/* Status */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Status da assinatura</p>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white/30 mt-3" />
              ) : (
                <>
                  <p className={`mt-2 text-2xl font-serif ${active ? 'text-emerald-400' : 'text-white/70'}`}>
                    {STATUS_LABEL[status] ?? status}
                  </p>
                  <p className="mt-3 text-sm text-white/60">
                    {active
                      ? <>Seu acesso está garantido até <strong className="text-white">{formatDate(sub?.access_until)}</strong>.</>
                      : 'Você não tem acesso ativo neste momento.'}
                  </p>
                  <p className="mt-1 text-sm text-white/40 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4" />
                    Próxima cobrança: {formatDate(sub?.next_charge_date)}
                  </p>
                  {sub?.plan_name && (
                    <p className="mt-1 text-xs text-white/30">
                      Plano: {sub.plan_name}{sub.charge_frequency ? ` · ${sub.charge_frequency}` : ''}
                    </p>
                  )}
                </>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => void load()} className="border-white/15 bg-white/5 hover:bg-white/10">
              <RefreshCw className="w-3.5 h-3.5 mr-2" /> Atualizar
            </Button>
          </div>

          {!active && (
            <Button onClick={() => navigate('/assinatura')} className="mt-6 h-12 w-full rounded-xl bg-white text-black hover:bg-white/90">
              Assinar por {KIRVANO_PRICE_LABEL}
            </Button>
          )}
        </section>

        {/* Cancelamento / suporte */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Cancelamento e suporte
          </p>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            A cobrança é feita pela Kirvano. Para cancelar a assinatura, basta pedir o cancelamento pelo nosso
            suporte no WhatsApp ou responder ao e-mail de confirmação da compra enviado pela Kirvano. O
            cancelamento interrompe as próximas cobranças e o acesso permanece até o fim do período já pago.
          </p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="mt-5 h-12 w-full rounded-xl border-white/15 bg-white/5 hover:bg-white/10">
              <MessageCircle className="w-4 h-4 mr-2" /> Falar com o suporte no WhatsApp
            </Button>
          </a>
        </section>

        {/* Já paguei e não liberou */}
        <section className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.04] backdrop-blur-xl p-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-300/70 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Já paguei e não liberou
          </p>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            Isso normalmente acontece quando a compra foi feita com um e-mail diferente do e-mail de login.
            Informe abaixo o e-mail usado na compra que a gente vincula manualmente.
          </p>
          <div className="mt-5 space-y-3">
            <Input
              value={purchaseEmail}
              onChange={(e) => setPurchaseEmail(e.target.value)}
              placeholder="E-mail usado na compra"
              className="h-12 bg-white/5 border-white/10 rounded-xl"
            />
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Observação (opcional): data da compra, forma de pagamento..."
              className="bg-white/5 border-white/10 rounded-xl min-h-[90px]"
            />
            <Button onClick={() => void submitClaim()} disabled={sending} className="h-12 w-full rounded-xl bg-white text-black hover:bg-white/90">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar para verificação'}
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-white/30">
            Seu e-mail de login é <span className="text-white/50">{user?.email}</span>.
          </p>
        </section>
      </main>
    </div>
  );
}
