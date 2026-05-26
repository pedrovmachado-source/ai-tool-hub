// Plan helpers — single source of truth for tier checks.
export type Plano = 'Free' | 'Elite' | 'Elite Plus' | 'Max';
export type Period = 'mensal' | 'trimestral' | 'vitalicio';

export const isPaid = (plano?: string | null) => plano === 'Elite' || plano === 'Elite Plus' || plano === 'Max';
export const isMentorado = (plano?: string | null) => plano === 'Max';
export const isElitePlus = (plano?: string | null) => plano === 'Elite Plus';
export const isElite = (plano?: string | null) => plano === 'Elite';

export const planLabel = (plano?: string | null) =>
  plano === 'Max' ? 'MAX' : plano === 'Elite Plus' ? 'ELITE PLUS' : plano === 'Elite' ? 'ELITE' : 'FREE';


export const planBadgeClass = (plano?: string | null) => {
  if (plano === 'Max') return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]';
  if (plano === 'Elite Plus') return 'bg-gradient-to-r from-brand-blue to-brand-teal text-white';
  if (plano === 'Elite') return 'bg-gradient-to-r from-brand-amber to-brand-amber/80 text-white';
  return 'bg-white/25 text-white';
};


export const PERIOD_LABEL: Record<Period, string> = {
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  vitalicio: 'Vitalício',
};

export const PERIOD_SUFFIX: Record<Period, string> = {
  mensal: '/mês',
  trimestral: '/trimestre',
  vitalicio: 'pagamento único',
};

export interface PlanOption {
  price: string;
  checkoutUrl: string;
}
export interface PlansConfig {
  elite: Record<Period, PlanOption>;
  elitePlus: Record<Period, PlanOption>;
}

export const DEFAULT_PLANS_CONFIG: PlansConfig = {
  elite: {
    mensal:     { price: '19.90',  checkoutUrl: 'https://buy.stripe.com/bJe8wR2JSg00ehN2rf5wI07' },
    trimestral: { price: '49.90',  checkoutUrl: 'https://buy.stripe.com/8x2eVf1FO156flR5Dr5wI06' },
    vitalicio:  { price: '127.90', checkoutUrl: 'https://buy.stripe.com/9B614pbgo156c9F5Dr5wI03' },
  },
  elitePlus: {
    mensal:     { price: '29.90',  checkoutUrl: 'https://buy.stripe.com/5kQbJ384cbJK1v19TH5wI08' },
    trimestral: { price: '79.90',  checkoutUrl: 'https://buy.stripe.com/00w9AV5W47tuflRd5T5wI05' },
    vitalicio:  { price: '197.90', checkoutUrl: 'https://buy.stripe.com/14AfZjfwE8xy3D99TH5wI02' },
  },
};

// Plan ranking — for min_plan gating logic.
export const planRank = (plano?: string | null): number =>
  plano === 'Max' ? 3 : plano === 'Elite Plus' ? 2 : plano === 'Elite' ? 1 : 0;


export const meetsMinPlan = (plano: string | null | undefined, minPlan: string) =>
  planRank(plano) >= planRank(minPlan);
