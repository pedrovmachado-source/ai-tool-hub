import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const CashIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
    <path d="M11 8c-1.5 0-3 .5-3 2s1.5 2 3 2 3 .5 3 2-1.5 2-3 2" />
    <path d="M12 6v12" />
  </svg>
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
        pl-2 pr-1 py-1 rounded-full cursor-pointer transition-all group
        ${isAnimating ? 'ring-2 ring-brand-amber/50 scale-105' : ''}
      `}
      title="Comprar Cash"
    >
      <div className="flex items-center gap-1.5">
        <CashIcon className="w-4 h-4 text-brand-amber" />
        <span className="text-[13px] font-bold text-white tracking-tight">
          {balance.toLocaleString('pt-BR')}
        </span>
      </div>
      
      <button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-brand-amber group-hover:text-black transition-colors">
        <Plus size={14} />
      </button>
    </div>
  );
}