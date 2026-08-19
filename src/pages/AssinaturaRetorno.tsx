import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fetchSubscriber, formatDate, hasActiveAccess, type SubscriberRow } from '@/lib/kirvano';

export default function AssinaturaRetorno() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState<SubscriberRow | null>(null);
  const [checking, setChecking] = useState(true);

  const check = async () => {
    if (!user) return;
    setChecking(true);
    const row = await fetchSubscriber(user.id);
    setSub(row);
    setChecking(false);
  };

  useEffect(() => { void check(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  const active = hasActiveAccess(sub);

  return (
    <div className="min-h-screen bg-black text-white">
      <Meta title="Pagamento recebido — Convert Club" description="A liberação do seu acesso é automática e pode levar alguns minutos." />
      <Navbar onNavigate={(page) => { if (page === 'menu') navigate('/menu'); else navigate('/'); }} />

      <main className="max-w-2xl mx-auto px-5 pt-32 pb-24">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            {active ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Clock className="w-6 h-6 text-white/60" />}
          </div>

          {active ? (
            <>
              <h1 className="mt-6 text-3xl font-serif">Acesso liberado</h1>
              <p className="mt-3 text-white/50">
                Seu acesso está garantido até <strong className="text-white/80">{formatDate(sub?.access_until)}</strong>.
              </p>
              <Button onClick={() => navigate('/menu')} className="mt-8 h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90">
                Entrar na plataforma
              </Button>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-3xl font-serif">Recebemos seu pagamento</h1>
              <p className="mt-3 text-white/50 leading-relaxed">
                A liberação do acesso é automática e acontece quando o pagamento é confirmado — pode levar
                até alguns minutos. Você não precisa fazer nada: basta atualizar o status abaixo.
              </p>
              <Button
                onClick={() => void check()}
                disabled={checking}
                variant="outline"
                className="mt-8 h-12 px-8 rounded-xl border-white/15 bg-white/5 hover:bg-white/10"
              >
                {checking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Recarregar status
              </Button>
              <p className="mt-6 text-[11px] text-white/30">
                Pagou com um e-mail diferente do e-mail de login? Registre isso em{' '}
                <button onClick={() => navigate('/conta')} className="underline">Minha conta</button>.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
