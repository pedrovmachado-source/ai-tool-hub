import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Loader2 } from 'lucide-react';
import { usePlanConfig } from '@/hooks/usePlanConfig';
import { toast } from 'sonner';

export default function ProPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const { plan, loading } = usePlanConfig();

  const handleSubscribe = () => {
    if (!user) {
      toast.error('Faça login para adquirir o plano Pro.');
      return;
    }
    window.open(plan.checkoutUrl, '_blank');
  };

  const priceWhole = plan.price.split('.')[0] || plan.price.split(',')[0];
  const priceCents = plan.price.includes('.') ? plan.price.split('.')[1] : plan.price.includes(',') ? plan.price.split(',')[1] : '00';
  const periodLabel = plan.period === 'vitalicio' ? 'pagamento único · acesso vitalício' : plan.period === 'anual' ? '/ano' : plan.period === 'semanal' ? '/semana' : '/mês';

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy">
      <div className="py-16 px-8 text-center" style={{ background: 'linear-gradient(180deg, hsl(240,33%,14%) 0%, hsl(240,33%,18%) 100%)' }}>
        <div className="inline-flex items-center gap-2 bg-brand-amber/15 border border-brand-amber/30 text-brand-amber text-xs px-4 py-1.5 rounded-full mb-5">⚡ Desbloqueie tudo</div>
        <h1 className="font-serif-display text-[46px] text-primary-foreground mb-4 leading-tight">Turbine seu negócio com<br /><em className="text-brand-amber italic">AdAI Pro</em></h1>
        <p className="text-base text-muted-foreground/50 max-w-[560px] mx-auto leading-relaxed">Acesso vitalício a todos os e-books, guias passo a passo, prompts prontos e muito mais. Pague uma vez, use para sempre.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-[700px] mx-auto px-8 pb-16">
        {/* Free */}
        <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-8">
          <div className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider mb-2">Gratuito</div>
          <div className="text-[42px] font-bold text-primary-foreground">R$0</div>
          <div className="text-xs text-muted-foreground/40 mt-1 mb-6">Para sempre grátis</div>
          <ul className="space-y-2 mb-7">
            {['Acesso às fichas de ferramentas', 'Links oficiais das plataformas', 'Prompts básicos'].map(f => (
              <li key={f} className="flex items-center gap-2 text-[13.5px] text-primary-foreground/70 py-1 border-b border-primary-foreground/5"><Check size={15} className="text-brand-green shrink-0" />{f}</li>
            ))}
            {['E-books completos', 'Guias passo a passo', 'Atualizações contínuas'].map(f => (
              <li key={f} className="flex items-center gap-2 text-[13.5px] text-muted-foreground/30 py-1 border-b border-primary-foreground/5"><X size={15} className="shrink-0" />{f}</li>
            ))}
          </ul>
          <button onClick={onBack} className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary-foreground/[0.08] text-primary-foreground hover:bg-primary-foreground/[0.15] transition-colors">Usar grátis</button>
        </div>

        {/* Pro */}
        <div className="bg-brand-blue/12 border border-brand-blue rounded-2xl p-8 relative scale-[1.03]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-primary-foreground text-[11px] font-semibold px-4 py-1 rounded-full whitespace-nowrap">Mais Popular</div>
          <div className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider mb-2">{plan.name}</div>
          <div className="text-[42px] font-bold text-primary-foreground">R${priceWhole}<span className="text-2xl">,{priceCents}</span></div>
          <div className="text-xs text-muted-foreground/40 mt-1 mb-6">{periodLabel}</div>
          <ul className="space-y-2 mb-7">
            {plan.features.map(f => (
              <li key={f} className="flex items-center gap-2 text-[13.5px] text-primary-foreground/80 py-1 border-b border-primary-foreground/5"><Check size={15} className="text-brand-green shrink-0" />{f}</li>
            ))}
          </ul>
          <button onClick={handleSubscribe} className="w-full py-2.5 rounded-lg text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            ⚡ Comprar agora — R${plan.price.replace('.', ',')}
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-[900px] mx-auto px-8 pb-16">
        <h2 className="font-serif-display text-[28px] text-primary-foreground text-center mb-8">O que você vai desbloquear</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '📘', title: '24 E-books Completos', desc: 'Guia dedicado para cada ferramenta, com passo a passo detalhado e prompts prontos.' },
            { icon: '✍️', title: '+200 Prompts Prontos', desc: 'Biblioteca com os melhores prompts para marketing, vendas, design e produtividade.' },
            { icon: '⚡', title: 'Atualizações Contínuas', desc: 'Novos guias, ferramentas e prompts para você se manter na frente.' },
          ].map(b => (
            <div key={b.title} className="bg-primary-foreground/[0.04] border border-primary-foreground/[0.07] rounded-xl p-6">
              <div className="text-2xl mb-3">{b.icon}</div>
              <h3 className="text-sm font-semibold text-primary-foreground mb-1">{b.title}</h3>
              <p className="text-[13px] text-muted-foreground/50 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-12">
        <button onClick={onBack} className="px-6 py-2 rounded-lg text-sm bg-primary-foreground/[0.08] text-muted-foreground/50 border border-primary-foreground/10 hover:bg-primary-foreground/[0.15] transition-colors">← Voltar às ferramentas</button>
      </div>
    </div>
  );
}
