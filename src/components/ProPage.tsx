import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Loader2, LogIn, UserPlus } from 'lucide-react';
import { usePlansConfig } from '@/hooks/usePlanConfig';
import { toast } from 'sonner';
import AuthModal from './AuthModal';
import type { Period } from '@/lib/plan';

type Tier = 'free' | 'elite' | 'elitePlus';

const ELITE_FEATURES = [
  'Tudo do plano gratuito',
  '24 e-books completos',
  '+200 prompts exclusivos',
  'Guias passo a passo',
  'Atualizações contínuas',
  'Suporte prioritário',
];

const ELITE_PLUS_FEATURES = [
  'Tudo do plano Elite',
  '🎥 Vídeos exclusivos dos e-books',
  '🎓 Aulas e transcrições completas',
  'Novos módulos sempre que lançados',
  'Suporte VIP',
];

const FREE_FEATURES = [
  'Acesso às fichas de ferramentas',
  'Links oficiais das plataformas',
  'Prompts básicos',
];

const PERIODS: { key: Period; label: string; short: string; suffix: string }[] = [
  { key: 'mensal',     label: 'Mensal',     short: 'Mês',  suffix: '/mês' },
  { key: 'trimestral', label: 'Trimestral', short: '3 m',  suffix: '/trim' },
  { key: 'vitalicio',  label: 'Vitalício',  short: 'Único', suffix: 'único' },
];

function priceParts(price: string) {
  const normalized = price.replace(',', '.');
  const [whole, cents] = normalized.split('.');
  return { whole: whole || '0', cents: (cents || '00').padEnd(2, '0').slice(0, 2) };
}

export default function ProPage({ onBack, onNavigate: _onNavigate }: { onBack: () => void; onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const { plans, loading } = usePlansConfig();
  const [period, setPeriod] = useState<Period>('mensal');
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({ open: false, mode: 'login' });

  const handleSubscribe = (tier: 'elite' | 'elitePlus') => {
    if (!user) {
      toast.error('Faça login ou crie uma conta para assinar.');
      setAuthModal({ open: true, mode: 'register' });
      return;
    }
    const url = plans[tier][period].checkoutUrl;
    if (url) window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const elitePrice = plans.elite[period].price;
  const elitePlusPrice = plans.elitePlus[period].price;
  const periodMeta = PERIODS.find(p => p.key === period)!;
  const isLifetime = period === 'vitalicio';
  const periodCopy = isLifetime ? 'pagamento único · acesso vitalício' : periodMeta.suffix;

  const eliteParts = priceParts(elitePrice);
  const elitePlusParts = priceParts(elitePlusPrice);

  return (
    <div className="min-h-screen bg-navy">
      {/* Hero */}
      <div className="py-12 sm:py-16 px-4 sm:px-8 text-center" style={{ background: 'linear-gradient(180deg, hsl(240,33%,14%) 0%, hsl(240,33%,18%) 100%)' }}>
        <div className="inline-flex items-center gap-2 bg-brand-amber/15 border border-brand-amber/30 text-brand-amber text-xs px-4 py-1.5 rounded-full mb-5">⚡ Escolha seu plano</div>
        <h1 className="font-serif-display text-[32px] sm:text-[46px] text-primary-foreground mb-3 sm:mb-4 leading-tight">
          Turbine seu negócio com<br /><em className="text-brand-amber italic">AdAI</em>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground/60 max-w-[560px] mx-auto leading-relaxed px-2">
          Assinaturas mensais, trimestrais ou pagamento único vitalício. Cancele quando quiser nas mensais e trimestrais.
        </p>
      </div>

      {/* Banner de login */}
      {!user && (
        <div className="max-w-[900px] mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
          <div className="bg-brand-amber/10 border border-brand-amber/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between">
            <p className="text-[13px] sm:text-sm text-primary-foreground/90 text-center sm:text-left">
              Você precisa de uma conta para assinar. Entre ou cadastre-se gratuitamente.
            </p>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setAuthModal({ open: true, mode: 'login' })} className="px-3 sm:px-4 py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors flex items-center gap-1.5">
                <LogIn size={14} /> Entrar
              </button>
              <button onClick={() => setAuthModal({ open: true, mode: 'register' })} className="px-3 sm:px-4 py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold text-navy bg-brand-amber hover:opacity-90 transition-opacity flex items-center gap-1.5">
                <UserPlus size={14} /> Criar conta grátis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle de período */}
      <div className="max-w-[420px] mx-auto px-4 pt-8">
        <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-full p-1 grid grid-cols-3 gap-1">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-2 sm:px-4 py-2 rounded-full text-[11px] sm:text-[13px] font-semibold transition-all ${
                period === p.key
                  ? 'bg-brand-amber text-navy shadow-sm'
                  : 'text-muted-foreground hover:text-primary-foreground'
              }`}
            >
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.short}</span>
            </button>
          ))}
        </div>
        {period === 'trimestral' && (
          <p className="text-center text-[11px] text-brand-green mt-2">💸 Economize cobrando a cada 3 meses</p>
        )}
        {period === 'vitalicio' && (
          <p className="text-center text-[11px] text-brand-amber mt-2">⚡ Pague uma vez, use para sempre</p>
        )}
      </div>

      {/* Cards de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-[1000px] mx-auto px-4 sm:px-8 pb-12 pt-6 sm:pt-8">
        {/* Free */}
        <PlanCard
          tier="free"
          title="Gratuito"
          price="R$0"
          subtitle="Para sempre grátis"
          features={FREE_FEATURES}
          missing={['E-books completos', 'Vídeos e aulas']}
          ctaLabel="Usar grátis"
          onCta={onBack}
        />

        {/* Elite */}
        <PlanCard
          tier="elite"
          title="Elite"
          highlighted
          badge="Mais Popular"
          price={`R$${eliteParts.whole}`}
          cents={eliteParts.cents}
          subtitle={periodCopy}
          features={ELITE_FEATURES}
          ctaLabel={isLifetime ? `Comprar — R$${elitePrice.replace('.', ',')}` : `Assinar — R$${elitePrice.replace('.', ',')}${periodMeta.suffix}`}
          onCta={() => handleSubscribe('elite')}
          accent="amber"
        />

        {/* Elite Plus */}
        <PlanCard
          tier="elitePlus"
          title="Elite Plus"
          badge="Premium"
          price={`R$${elitePlusParts.whole}`}
          cents={elitePlusParts.cents}
          subtitle={periodCopy}
          features={ELITE_PLUS_FEATURES}
          ctaLabel={isLifetime ? `Comprar — R$${elitePlusPrice.replace('.', ',')}` : `Assinar — R$${elitePlusPrice.replace('.', ',')}${periodMeta.suffix}`}
          onCta={() => handleSubscribe('elitePlus')}
          accent="blue"
        />
      </div>

      {/* Comparativo de benefícios */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-8 pb-16">
        <h2 className="font-serif-display text-[22px] sm:text-[28px] text-primary-foreground text-center mb-6 sm:mb-8">O que cada plano inclui</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: '📘', title: 'E-books & Prompts', desc: 'Guias e prompts para todas as ferramentas. Disponível em Elite e Elite Plus.' },
            { icon: '🎥', title: 'Vídeos dos E-books', desc: 'Versão em vídeo de cada e-book, explicada passo a passo. Exclusivo Elite Plus.' },
            { icon: '🎓', title: 'Aulas Exclusivas', desc: 'Módulos de aulas com vídeos e transcrições em PDF. Exclusivo Elite Plus.' },
          ].map(b => (
            <div key={b.title} className="bg-primary-foreground/[0.04] border border-primary-foreground/[0.07] rounded-xl p-5 sm:p-6">
              <div className="text-2xl mb-3">{b.icon}</div>
              <h3 className="text-sm font-semibold text-primary-foreground mb-1">{b.title}</h3>
              <p className="text-[13px] text-muted-foreground/60 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-12 px-4">
        <button onClick={onBack} className="px-6 py-2 rounded-lg text-sm bg-primary-foreground/[0.08] text-muted-foreground/60 border border-primary-foreground/10 hover:bg-primary-foreground/[0.15] transition-colors">← Voltar às ferramentas</button>
      </div>

      <AuthModal
        mode={authModal.mode}
        isOpen={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        onSwitch={mode => setAuthModal({ open: true, mode })}
      />
    </div>
  );
}

function PlanCard({
  tier, title, price, cents, subtitle, features, missing, ctaLabel, onCta, highlighted, badge, accent,
}: {
  tier: Tier;
  title: string;
  price: string;
  cents?: string;
  subtitle: string;
  features: string[];
  missing?: string[];
  ctaLabel: string;
  onCta: () => void;
  highlighted?: boolean;
  badge?: string;
  accent?: 'amber' | 'blue';
}) {
  const borderClass = highlighted
    ? 'border-brand-amber bg-brand-amber/[0.08] md:scale-[1.03]'
    : accent === 'blue'
      ? 'border-brand-blue/40 bg-brand-blue/[0.06]'
      : 'border-primary-foreground/10 bg-primary-foreground/[0.04]';

  const badgeClass = highlighted
    ? 'bg-brand-amber text-navy'
    : accent === 'blue'
      ? 'bg-gradient-to-r from-brand-blue to-brand-teal text-white'
      : 'bg-primary-foreground/15 text-primary-foreground';

  const ctaClass = highlighted
    ? 'text-white'
    : accent === 'blue'
      ? 'text-white'
      : 'bg-primary-foreground/[0.08] text-primary-foreground hover:bg-primary-foreground/[0.15]';

  const ctaStyle = highlighted
    ? { background: 'linear-gradient(135deg, #F59E0B, #D97706)' }
    : accent === 'blue'
      ? { background: 'linear-gradient(135deg, hsl(208,71%,55%), hsl(165,70%,38%))' }
      : undefined;

  return (
    <div className={`border rounded-2xl p-6 sm:p-7 relative ${borderClass}`}>
      {badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] sm:text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>
          {badge}
        </div>
      )}
      <div className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-2">{title}</div>
      <div className="text-[34px] sm:text-[42px] font-bold text-primary-foreground leading-none">
        {price}
        {cents && <span className="text-xl sm:text-2xl">,{cents}</span>}
      </div>
      <div className="text-[11px] sm:text-xs text-muted-foreground/50 mt-1 mb-5 sm:mb-6 min-h-[16px]">{subtitle}</div>
      <ul className="space-y-1.5 mb-6">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-[12.5px] sm:text-[13.5px] text-primary-foreground/85 py-1 border-b border-primary-foreground/5">
            <Check size={14} className="text-brand-green shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
        {missing?.map(f => (
          <li key={f} className="flex items-start gap-2 text-[12.5px] sm:text-[13.5px] text-muted-foreground/40 py-1 border-b border-primary-foreground/5">
            <X size={14} className="shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onCta}
        className={`w-full py-2.5 rounded-lg text-[13px] sm:text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2 ${ctaClass}`}
        style={ctaStyle}
      >
        {tier === 'free' ? ctaLabel : tier === 'elitePlus' ? `👑 ${ctaLabel}` : `⚡ ${ctaLabel}`}
      </button>
    </div>
  );
}
