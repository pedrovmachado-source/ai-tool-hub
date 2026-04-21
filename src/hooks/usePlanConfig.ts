import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlanConfig {
  name: string;
  price: string;
  period: string;
  checkoutUrl: string;
  features: string[];
}

const DEFAULT_PLAN: PlanConfig = {
  name: 'Pro Vitalício',
  price: '14.90',
  period: 'vitalicio',
  checkoutUrl: 'https://buy.stripe.com/eVqdRb2JS5lmflRc1P5wI01',
  features: ['Tudo do plano gratuito', '24 e-books completos', '+200 prompts exclusivos', 'Guias passo a passo', 'Atualizações contínuas', 'Suporte prioritário'],
};

export function usePlanConfig() {
  const [plan, setPlan] = useState<PlanConfig>(DEFAULT_PLAN);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'pro_plan')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          setPlan(data.value as unknown as PlanConfig);
        }
        setLoading(false);
      });
  }, []);

  return { plan, loading };
}
