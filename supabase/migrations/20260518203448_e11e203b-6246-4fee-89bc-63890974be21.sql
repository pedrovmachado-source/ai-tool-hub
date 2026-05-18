
-- 1. Extend content_items with offer fields
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS example_url text,
  ADD COLUMN IF NOT EXISTS buy_url text;

-- 2. Niche modules + lessons (mirror of modules/lessons but gated to Pro+Max)
CREATE TABLE IF NOT EXISTS public.niche_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.niche_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.niche_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'video',
  video_url text,
  pdf_path text,
  duration_min integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.niche_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niche_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pro/Max can view niche_modules" ON public.niche_modules
  FOR SELECT TO authenticated USING (
    private.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND plano = ANY (ARRAY['Pro','Max']))
  );
CREATE POLICY "Admins manage niche_modules" ON public.niche_modules
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Pro/Max can view niche_lessons" ON public.niche_lessons
  FOR SELECT TO authenticated USING (
    private.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND plano = ANY (ARRAY['Pro','Max']))
  );
CREATE POLICY "Admins manage niche_lessons" ON public.niche_lessons
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER touch_niche_modules BEFORE UPDATE ON public.niche_modules
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_niche_lessons BEFORE UPDATE ON public.niche_lessons
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Site products
CREATE TABLE IF NOT EXISTS public.site_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  col text NOT NULL CHECK (col IN ('ia','manual')),
  name text NOT NULL,
  price text NOT NULL,
  short_desc text NOT NULL DEFAULT '',
  example_url text,
  buy_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read site_products" ON public.site_products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage site_products" ON public.site_products
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER touch_site_products BEFORE UPDATE ON public.site_products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed 8 products
INSERT INTO public.site_products (slug, col, name, price, short_desc, sort_order) VALUES
  ('ia-landing',     'ia',     'Landing Page',  '200', 'Página de vendas única com copy gerada por IA.', 1),
  ('ia-quiz',        'ia',     'Site Quiz',     '300', 'Quiz interativo com copy gerada por IA.', 2),
  ('ia-advertorial', 'ia',     'Advertorial',   '350', 'Artigo de vendas (advertorial) com copy de IA.', 3),
  ('ia-typebot',     'ia',     'Type Bot',      '400', 'Chatbot de qualificação com copy de IA.', 4),
  ('manual-landing',     'manual', 'Landing Page',  '350', 'Página de vendas com copy escrita à mão por copywriter.', 1),
  ('manual-quiz',        'manual', 'Site Quiz',     '400', 'Quiz interativo com copy escrita à mão.', 2),
  ('manual-advertorial', 'manual', 'Advertorial',   '700', 'Advertorial com copy profissional escrita à mão.', 3),
  ('manual-typebot',     'manual', 'Type Bot',      '600', 'Chatbot de qualificação com copy escrita à mão.', 4)
ON CONFLICT (slug) DO NOTHING;

-- 4. Site orders
CREATE TABLE IF NOT EXISTS public.site_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_slug text NOT NULL,
  description text NOT NULL,
  ref_link_1 text NOT NULL,
  ref_link_2 text NOT NULL,
  whatsapp text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own orders" ON public.site_orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own orders" ON public.site_orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.site_orders
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

-- 5. Default max_subscribe_url setting
INSERT INTO public.site_settings (key, value)
VALUES ('max_subscribe_url', '"https://buy.stripe.com/14AfZjfwE8xy3D99TH5wI02"'::jsonb)
ON CONFLICT (key) DO NOTHING;
