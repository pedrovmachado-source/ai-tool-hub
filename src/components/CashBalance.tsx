import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const CashIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center relative`}>
    <img 
      src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Coin/3D/coin_3d.png" 
      alt="Cash"
      className="w-full h-full object-contain relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      loading="eager"
    />
  </div>
);

export default function CashBalance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(user?.cashBalance || 0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    const fetchBalance = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('cash_balance')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setBalance(Number(data.cash_balance));
      }
    };

    fetchBalance();

    // Subscribe to changes
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newBalance = Number(payload.new.cash_balance);
          if (newBalance !== balance) {
            setBalance(newBalance);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!user) return null;

  return (
    <div 
      onClick={() => navigate('/comprar-cash')}
      className={`
        flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 
        pl-2 pr-1 py-1 rounded-xl cursor-pointer transition-all group
        ${isAnimating ? 'ring-2 ring-brand-amber/50 scale-105' : ''}
      `}
      title="Comprar Cash"
    >
      <div className="flex items-center gap-1.5">
        <CashIcon className="w-4 h-4 text-brand-amber" />
        <span className="text-[13px] font-bold text-white tracking-tight">
          {balance >= 1000 ? `${(balance / 1000).toFixed(balance % 1000 >= 100 ? 1 : 0)}k` : balance}
        </span>
      </div>
      
      <button className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white group-hover:bg-brand-amber group-hover:text-black transition-colors">
        <Plus size={14} />
      </button>
    </div>
  );
}