export const PRO_MONTHLY_PLAN = {
  name: 'Pro Mensal',
  priceLabel: 'R$19,90/mês',
  stripePriceId: 'price_1TJPm9QP3tL0cIWnWzswoc4l',
  stripeProductId: 'prod_UHzlTXfiqT3Pbc',
} as const;

export const isStripeCheckoutReady = PRO_MONTHLY_PLAN.stripePriceId.length > 0;
