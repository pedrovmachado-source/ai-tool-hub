export const PRO_MONTHLY_PLAN = {
  name: 'Pro Mensal',
  priceLabel: 'R$19,90/mês',
  stripePriceId: '',
} as const;

export const isStripeCheckoutReady = PRO_MONTHLY_PLAN.stripePriceId.length > 0;