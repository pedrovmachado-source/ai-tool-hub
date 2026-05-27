import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Loader2 } from 'lucide-react';

interface RankingUser {
  user_id: string;
  count: number;
  nome: string;
  avatar_url?: string;
}

export default function OffersRanking() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  async function fetchRanking() {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_monthly_offer_ranking');
      if (error) throw error;

      const sortedRanking: RankingUser[] = (data || []).map((row: any) => ({
        user_id: String(row.rank_position),
        count: Number(row.count),
        nome: row.nome || 'Usuário',
        avatar_url: row.avatar_url || undefined,
      }));

      setRanking(sortedRanking);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || ranking.length === 0) return null;

  const prizes = ['R$ 200', 'R$ 100', 'R$ 50'];
  const colors = ['text-brand-amber', 'text-slate-400', 'text-orange-400'];

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 glass-smooth border-t border-white/5 bg-black/40">
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 max-w-5xl mx-auto">
        {/* Title and Rewards Info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-amber" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Ranking Mensal</span>
          </div>
          <div className="text-[9px] text-white/20 font-medium leading-relaxed max-w-[140px]">
            Premiações: <span className="text-brand-amber">R$200</span>, <span className="text-slate-400">R$100</span> e <span className="text-orange-400">R$50</span> para os top 3.
          </div>
        </div>
        
        {/* User Ranking List */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {ranking.map((user, index) => (
            <div key={user.user_id} className="flex items-center gap-3">
              <span className={`text-xs font-serif-display ${colors[index]}`}>{index + 1}º</span>
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-[10px] text-white/30 uppercase">
                    {user.nome.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-white/80">{user.nome}</span>
                <span className="text-[9px] text-white/30 uppercase tracking-tighter">
                  {user.count} {user.count === 1 ? 'oferta' : 'ofertas'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Test Notice */}
      <div className="mt-4 text-[9px] text-white/10 font-medium uppercase tracking-[0.1em]">
        Ainda em testes, inativo!
      </div>
    </div>
  );
}

