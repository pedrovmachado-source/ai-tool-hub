// Plan helpers — single source of truth for tier checks.
export type Plano = 'Free' | 'Pro' | 'Max';
export type Period = 'mensal' | 'trimestral' | 'vitalicio';

export const isPaid = (plano?: string | null) => plano === 'Pro' || plano === 'Max';
export const isMax = (plano?: string | null) => plano === 'Max';
export const isPro = (plano?: string | null) => plano === 'Pro';

export const planLabel = (plano?: string | null) =>
  plano === 'Max' ? 'MAX' : plano === 'Pro' ? 'PRO' : 'FREE';

export const planBadgeClass = (plano?: string | null) => {
  if (plano === 'Max') return 'bg-gradient-to-r from-brand-blue to-brand-teal text-white';
  if (plano === 'Pro') return 'bg-gradient-to-r from-brand-amber to-brand-amber/80 text-white';
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
  pro: Record<Period, PlanOption>;
  max: Record<Period, PlanOption>;
}

export const DEFAULT_PLANS_CONFIG: PlansConfig = {
  pro: {
    mensal:     { price: '19.90',  checkoutUrl: 'https://buy.stripe.com/bJe8wR2JSg00ehN2rf5wI07' },
    trimestral: { price: '49.90',  checkoutUrl: 'https://buy.stripe.com/8x2eVf1FO156flR5Dr5wI06' },
    vitalicio:  { price: '127.90', checkoutUrl: 'https://buy.stripe.com/9B614pbgo156c9F5Dr5wI03' },
  },
  max: {
    mensal:     { price: '29.90',  checkoutUrl: 'https://buy.stripe.com/5kQbJ384cbJK1v19TH5wI08' },
    trimestral: { price: '79.90',  checkoutUrl: 'https://buy.stripe.com/00w9AV5W47tuflRd5T5wI05' },
    vitalicio:  { price: '197.90', checkoutUrl: 'https://buy.stripe.com/14AfZjfwE8xy3D99TH5wI02' },
  },
};

// Plan ranking — for min_plan gating logic.
export const planRank = (plano?: string | null): number =>
  plano === 'Max' ? 2 : plano === 'Pro' ? 1 : 0;

export const meetsMinPlan = (plano: string | null | undefined, minPlan: string) =>
  planRank(plano) >= planRank(minPlan);
