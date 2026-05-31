import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CashSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-success-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setBalance(Number(payload.new.cash_balance));
          setIsProcessing(false);
        }
      )
      .subscribe();

    // Fetch initial balance
    const fetchBalance = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('cash_balance')
        .eq('id', user.id)
        .single();
      if (data) setBalance(Number(data.cash_balance));
    };
    fetchBalance();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
      <Navbar onNavigate={(p) => navigate(p === 'home' ? '/' : `/${p}`)} />

      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[30%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-blue/10 blur-[120px]" />
          <div className="absolute bottom-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-purple/10 blur-[120px]" />
        </div>

        <div className="max-w-md w-full glass-smooth p-12 rounded-[3rem] border border-white/5 text-center relative z-10 animate-fade-in">
          <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto mb-8 flex items-center justify-center text-brand-blue">
            <CheckCircle2 size={40} className="animate-scale-in" />
          </div>

          <h1 className="text-4xl font-serif-display text-white mb-4">Pagamento Recebido</h1>
          
          <div className="space-y-4 mb-10">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 text-white/40">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-sm font-light">Aguardando confirmação do PIX... seu Cash cai automaticamente.</p>
              </div>
            ) : (
              <div className="text-white/60 font-light">
                Seu saldo foi atualizado com sucesso para:
                <div className="text-3xl font-serif-display text-white mt-2">
                  {balance?.toLocaleString('pt-BR')} Cash
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={() => navigate('/menu')}
            className="w-full h-14 rounded-xl bg-white text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all"
          >
            Ir para o Dashboard <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}