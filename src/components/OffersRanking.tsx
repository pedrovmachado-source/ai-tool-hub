import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Calendar, Clock, Loader2 } from 'lucide-react';

interface RankingUser {
  rank: number;
  count: number;
  nome: string;
  avatar_url?: string;
}

const PRIZES = ['R$ 200', 'R$ 100', 'R$ 50'];
const COLORS = ['text-brand-amber', 'text-slate-300', 'text-orange-400'];
const RING = ['ring-brand-amber/60', 'ring-slate-300/50', 'ring-orange-400/50'];

function getCycle() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
  return { start, end };
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function fmtCountdown(ms: number) {
  if (ms <= 0) return '0d 0h 0m';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${d}d ${h}h ${m}m`;
}

export default function OffersRanking() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const { start, end } = getCycle();

  useEffect(() => {
    fetchRanking();
    const t = setInterval(() => setNow(Date.now()), 60000);

    const channel = supabase
      .channel('offers-ranking')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offer_analyses' },
        () => fetchRanking()
      )
      .subscribe();

    return () => {
      clearInterval(t);
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchRanking() {
    try {
      const { data, error } = await supabase.rpc('get_monthly_offer_ranking');
      if (error) throw error;
      const sorted: RankingUser[] = (data || []).map((row: any) => ({
        rank: Number(row.rank_position),
        count: Number(row.count),
        nome: row.nome || 'Usuário',
        avatar_url: row.avatar_url || undefined,
      }));
      setRanking(sorted);
    } catch (e) {
      console.error('Error fetching ranking:', e);
    } finally {
      setLoading(false);
    }
  }

  const countdown = fmtCountdown(end.getTime() - now);

  return (
    <section className="relative py-10 px-4 border-y border-white/10 bg-gradient-to-b from-black/60 via-brand-amber/[0.04] to-black/60">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_60%)]" />
      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-amber/10 border border-brand-amber/30">
            <Trophy className="w-4 h-4 text-brand-amber" />
            <span className="text-[11px] font-bold text-brand-amber uppercase tracking-[0.2em]">
              Ranking Mensal • Ao Vivo
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif-display text-white">
            Top 3 ganham <span className="text-brand-amber">prêmios em dinheiro</span>
          </h2>
          <p className="text-sm text-white/60 max-w-xl">
            Quem aprovar mais ofertas no mês leva. Posições atualizadas em tempo real.
          </p>

          {/* Cycle info */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-white/60" />
              <span className="text-white/70">
                {fmtDate(start)} <span className="text-white/30">→</span>{' '}
                {fmtDate(new Date(end.getTime() - 1))}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Encerra em {countdown}</span>
            </div>
          </div>
        </div>

        {/* Podium */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-8 text-sm text-white/40">
            Ninguém pontuou ainda neste mês. Seja o primeiro!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => {
              const user = ranking[i];
              return (
                <div
                  key={i}
                  className={`relative rounded-2xl border bg-white/[0.03] backdrop-blur p-5 flex flex-col items-center text-center transition ${
                    i === 0
                      ? 'border-brand-amber/40 sm:scale-105 sm:order-2 shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]'
                      : i === 1
                      ? 'border-slate-300/20 sm:order-1'
                      : 'border-orange-400/20 sm:order-3'
                  }`}
                >
                  <div className={`absolute -top-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black border ${
                    i === 0 ? 'border-brand-amber/50 text-brand-amber' : i === 1 ? 'border-slate-300/30 text-slate-300' : 'border-orange-400/30 text-orange-400'
                  }`}>
                    {i + 1}º Lugar
                  </div>

                  <div className={`w-16 h-16 rounded-full overflow-hidden ring-2 ${RING[i]} ring-offset-2 ring-offset-black mb-3`}>
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center text-base text-white/40 uppercase">
                        {user ? user.nome.charAt(0) : '—'}
                      </div>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-white truncate max-w-full">
                    {user ? user.nome : 'Vaga aberta'}
                  </div>
                  <div className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">
                    {user ? `${user.count} ${user.count === 1 ? 'oferta aprovada' : 'ofertas aprovadas'}` : 'sem registros'}
                  </div>

                  <div className={`mt-3 px-3 py-1 rounded-full text-sm font-bold ${COLORS[i]} bg-white/5 border border-white/10`}>
                    {PRIZES[i]}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
