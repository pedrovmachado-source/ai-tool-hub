import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

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
      const start = startOfMonth(new Date()).toISOString();
      const end = endOfMonth(new Date()).toISOString();

      const { data, error } = await supabase
        .from('offer_analyses')
        .select('user_id, profiles(nome, avatar_url)')
        .eq('status', 'approved')
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) throw error;

      const counts: Record<string, { count: number; nome: string; avatar_url?: string }> = {};
      
      data?.forEach((item: any) => {
        const userId = item.user_id;
        if (!counts[userId]) {
          counts[userId] = { 
            count: 0, 
            nome: item.profiles?.nome || 'Usuário',
            avatar_url: item.profiles?.avatar_url
          };
        }
        counts[userId].count++;
      });

      const sortedRanking = Object.entries(counts)
        .map(([user_id, data]) => ({
          user_id,
          ...data
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

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
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-6 px-4 glass-smooth border-t border-white/5 bg-black/40">
      <div className="flex items-center gap-2 mr-4">
        <Trophy className="w-4 h-4 text-brand-amber" />
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Ranking Mensal</span>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
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
                {user.count} {user.count === 1 ? 'oferta' : 'ofertas'} • <span className={colors[index]}>{prizes[index]}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

