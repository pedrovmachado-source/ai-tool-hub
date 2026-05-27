import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Star, Loader2 } from 'lucide-react';
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

      // Fetch all approved analyses for this month
      const { data, error } = await supabase
        .from('offer_analyses')
        .select('user_id, profiles(nome, avatar_url)')
        .eq('status', 'approved')
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) throw error;

      // Group and count manually since postgrest grouping is limited
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-brand-amber animate-spin" />
      </div>
    );
  }

  if (ranking.length === 0) return null;

  const prizes = ['R$ 200', 'R$ 100', 'R$ 50'];
  const icons = [
    <Trophy className="w-8 h-8 text-brand-amber" />,
    <Medal className="w-7 h-7 text-white/60" />,
    <Medal className="w-6 h-6 text-orange-400/60" />
  ];

  return (
    <section className="mb-20">
      <div className="flex items-center gap-3 mb-8">
        <Star className="w-5 h-5 text-brand-amber fill-brand-amber" />
        <h2 className="text-2xl font-serif-display text-white">Ranking do Mês</h2>
        <span className="px-2 py-0.5 rounded-md bg-brand-amber/10 border border-brand-amber/20 text-[10px] font-bold text-brand-amber uppercase tracking-widest ml-2">
          Premiação Ativa
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ranking.map((user, index) => (
          <div 
            key={user.user_id}
            className={`relative p-8 glass-smooth rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
              index === 0 
                ? 'border-brand-amber/30 bg-gradient-to-br from-brand-amber/10 to-transparent scale-105 z-10' 
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            {/* Background Decoration */}
            {index === 0 && (
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-amber/10 blur-[50px] rounded-full" />
            )}

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 relative">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center overflow-hidden border-2 ${
                  index === 0 ? 'border-brand-amber shadow-[0_0_20px_rgba(212,163,115,0.2)]' : 'border-white/10'
                }`}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-2xl font-serif-display text-white/20">
                      {user.nome.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-xl">
                  {icons[index]}
                </div>
              </div>

              <h3 className="text-xl font-serif-display text-white mb-1">{user.nome}</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-4">
                {user.count} {user.count === 1 ? 'Oferta' : 'Ofertas'} Aprovadas
              </p>

              <div className={`px-4 py-2 rounded-xl font-serif-display text-lg ${
                index === 0 ? 'bg-brand-amber text-black' : 'bg-white/5 text-white/60 border border-white/5'
              }`}>
                {prizes[index]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
