import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_PLANS_CONFIG, type PlansConfig } from '@/lib/plan';

export function usePlansConfig() {
  const [plans, setPlans] = useState<PlansConfig>(DEFAULT_PLANS_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'plans_config')
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.value) {
          // Shallow-merge with defaults to tolerate partial configs
          const v = data.value as Partial<PlansConfig>;
          setPlans({
            pro: { ...DEFAULT_PLANS_CONFIG.pro, ...(v.pro || {}) },
            max: { ...DEFAULT_PLANS_CONFIG.max, ...(v.max || {}) },
          });
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { plans, loading, setPlans };
}

// Back-compat: keep the old hook so older imports don't break.
export interface PlanConfig {
  name: string;
  price: string;
  period: string;
  checkoutUrl: string;
  features: string[];
}

const LEGACY_DEFAULT: PlanConfig = {
  name: 'Pro Vitalício',
  price: '127.90',
  period: 'vitalicio',
  checkoutUrl: DEFAULT_PLANS_CONFIG.pro.vitalicio.checkoutUrl,
  features: ['Tudo do plano gratuito', '24 e-books completos', '+200 prompts exclusivos', 'Guias passo a passo', 'Atualizações contínuas', 'Suporte prioritário'],
};

export function usePlanConfig() {
  const [plan] = useState<PlanConfig>(LEGACY_DEFAULT);
  return { plan, loading: false };
}
