import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Check, X, Loader2, ShieldCheck, Users, Sparkles } from 'lucide-react';
import {
  KIRVANO_PRICE_LABEL,
  fetchSubscriber,
  formatDate,
  hasActiveAccess,
  openKirvanoCheckout,
  type SubscriberRow,
} from '@/lib/kirvano';

const INCLUDED = [
  'Acesso total à plataforma Convert Club',
  'Reuniões em grupo de 2x a 4x por mês',
  'Biblioteca de prompts, ferramentas e ofertas validadas',
  'Catálogo de criativos e materiais de apoio',
  'Atualizações contínuas do ecossistema',
];

const NOT_INCLUDED = [
  'Área do mentorado (acompanhamento individual)',
  'Consultorias 1 a 1 e revisão personalizada de campanhas',
];

export default function Assinatura() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState<SubscriberRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchSubscriber(user.id)
      .then((row) => { if (alive) setSub(row); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user]);

  const active = hasActiveAccess(sub);

  const handleSubscribe = async () => {
    if (!user) { navigate('/auth'); return; }
    setOpening(true);
    const result = await openKirvanoCheckout({
      id: user.id,
      email: user.email,
      nome: user.nome,
      sobrenome: user.sobrenome,
      telefone: user.telefone,
    });
    if (result === 'missing-url') {
      setOpening(false);
      toast.error('Checkout indisponível no momento. Fale com o suporte.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Meta title="Assinatura — Convert Club" description="Acesso completo à plataforma Convert Club por R$ 9,90 por mês." />
      <Navbar />

      <main className="max-w-4xl mx-auto px-5 pt-28 pb-24">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50 border border-white/10 rounded-full px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Assinatura Convert Club
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-serif">Acesso completo por {KIRVANO_PRICE_LABEL}</h1>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            Uma assinatura simples: plataforma completa e encontros ao vivo em grupo, sem contrato e sem burocracia.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <p className="text-white/40 text-sm">Plano mensal</p>
              <p className="mt-1 text-5xl font-serif">R$ 9,90<span className="text-lg text-white/40 font-sans"> /mês</span></p>
            </div>
            <div className="md:text-right">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white/30 md:ml-auto" />
              ) : active ? (
                <div className="text-sm">
                  <p className="text-emerald-400">Assinatura ativa</p>
                  <p className="text-white/40">Acesso garantido até {formatDate(sub?.access_until)}</p>
                </div>
              ) : (
                <p className="text-white/40 text-sm">Sem assinatura ativa</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 py-8">
            <div>
              <h2 className="text-sm uppercase tracking-widest text-white/40 mb-4">O que está incluso</h2>
              <ul className="space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-white/80">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-widest text-white/40 mb-4">O que não está incluso</h2>
              <ul className="space-y-3">
                {NOT_INCLUDED.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-white/40">
                    <X className="w-4 h-4 mt-0.5 shrink-0 text-red-400/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={opening}
            className="w-full h-14 text-base rounded-xl bg-white text-black hover:bg-white/90"
          >
            {opening ? <Loader2 className="w-5 h-5 animate-spin" /> : `Assinar por ${KIRVANO_PRICE_LABEL}`}
          </Button>

          <div className="mt-5 grid sm:grid-cols-2 gap-3 text-xs text-white/40">
            <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Pagamento processado pela Kirvano.</p>
            <p className="flex items-center gap-2"><Users className="w-4 h-4" /> Cancele quando quiser, sem multa.</p>
          </div>
          <p className="mt-4 text-[11px] text-white/30 leading-relaxed">
            A liberação do acesso é automática e feita pela confirmação do pagamento — pode levar alguns minutos após a compra.
            Já assinou e ainda não liberou? Veja o bloco “já paguei e não liberou” em <button onClick={() => navigate('/conta')} className="underline">Minha conta</button>.
          </p>
        </div>
      </main>
    </div>
  );
}
