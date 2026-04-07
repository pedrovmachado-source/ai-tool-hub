
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site_settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.site_settings (key, value) VALUES (
  'pro_plan',
  '{"name": "Pro Vitalício", "price": "14.90", "period": "vitalicio", "checkoutUrl": "https://buy.stripe.com/test_fZubJ3ackg00ddJgi55wI00", "features": ["Tudo do plano gratuito", "24 e-books completos", "+200 prompts exclusivos", "Guias passo a passo", "Atualizações contínuas", "Suporte prioritário"]}'::jsonb
);
