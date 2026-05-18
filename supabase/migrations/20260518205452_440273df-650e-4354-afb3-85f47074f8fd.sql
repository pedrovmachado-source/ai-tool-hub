ALTER TABLE public.site_products
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'site',
  ADD COLUMN IF NOT EXISTS row_key text;

ALTER TABLE public.site_orders
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'novo',
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

ALTER TABLE public.site_orders ADD CONSTRAINT site_orders_status_chk
  CHECK (status IN ('novo','em_andamento','concluido'));

ALTER TABLE public.site_products ADD CONSTRAINT site_products_kind_chk
  CHECK (kind IN ('site','criativo'));

DROP POLICY IF EXISTS "Admins update orders" ON public.site_orders;
CREATE POLICY "Admins update orders" ON public.site_orders
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(),'admin'::public.app_role));

-- Seed row_key based on existing slugs
UPDATE public.site_products SET row_key = 'landing' WHERE slug ILIKE '%landing%' AND row_key IS NULL;
UPDATE public.site_products SET row_key = 'quiz' WHERE slug ILIKE '%quiz%' AND row_key IS NULL;
UPDATE public.site_products SET row_key = 'advertorial' WHERE slug ILIKE '%advertorial%' AND row_key IS NULL;
UPDATE public.site_products SET row_key = 'type-bot' WHERE (slug ILIKE '%type%' OR slug ILIKE '%bot%') AND row_key IS NULL;

INSERT INTO public.site_settings (key, value)
VALUES ('site_creation_banner', '{"enabled":true,"after_row_key":"quiz","text":"Fazemos a copy do seu site do zero"}'::jsonb)
ON CONFLICT (key) DO NOTHING;