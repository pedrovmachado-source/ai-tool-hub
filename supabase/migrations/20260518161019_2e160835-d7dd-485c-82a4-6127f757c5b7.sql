-- 1. content_sections
CREATE TABLE public.content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  cover_url text,
  min_plan text NOT NULL DEFAULT 'Pro' CHECK (min_plan IN ('Free','Pro','Max')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read content_sections"
  ON public.content_sections FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage content_sections"
  ON public.content_sections FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_content_sections_updated_at
  BEFORE UPDATE ON public.content_sections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2. content_items
CREATE TABLE public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_slug text NOT NULL REFERENCES public.content_sections(slug) ON DELETE CASCADE,
  topic text,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  kind text NOT NULL CHECK (kind IN ('video','pdf','image','text')),
  video_url text,
  pdf_path text,
  image_url text,
  body text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_items_section ON public.content_items(section_slug, sort_order);

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan-gated read content_items"
  ON public.content_items FOR SELECT TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.content_sections s
      JOIN public.profiles p ON p.user_id = auth.uid()
      WHERE s.slug = content_items.section_slug
        AND (
          s.min_plan = 'Free'
          OR (s.min_plan = 'Pro' AND p.plano IN ('Pro','Max'))
          OR (s.min_plan = 'Max' AND p.plano = 'Max')
        )
    )
  );

CREATE POLICY "Admins manage content_items"
  ON public.content_items FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Seed sections
INSERT INTO public.content_sections (slug, title, description, intro, min_plan, sort_order) VALUES
  ('offers',         'Ofertas Validadas',   'Produtos e ofertas validados por desempenho.', 'Curadoria de ofertas que estão escalando agora.', 'Pro', 1),
  ('site-creation',  'Criação de Site',     'Guias e materiais para criar sites de alta conversão.', 'Tudo que você precisa para criar páginas que vendem.', 'Pro', 2),
  ('creative-edit',  'Edição de Criativo',  'Tutoriais, presets e materiais para editar criativos.', 'Materiais práticos para acelerar sua edição.', 'Max', 3),
  ('topic-lessons',  'Aulas por Assunto',   'Aulas especializadas agrupadas por tema.', 'Mineração de produtos, copy, criação de sites e muito mais.', 'Max', 4);

-- 4. Storage bucket for content images
INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read content-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');

CREATE POLICY "Admins upload content-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'content-images' AND private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update content-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'content-images' AND private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete content-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'content-images' AND private.has_role(auth.uid(), 'admin'::app_role));

-- 5. Update plans_config with the new live Stripe links
INSERT INTO public.site_settings (key, value) VALUES (
  'plans_config',
  '{
    "pro": {
      "mensal":     { "price": "19.90",  "checkoutUrl": "https://buy.stripe.com/bJe8wR2JSg00ehN2rf5wI07" },
      "trimestral": { "price": "49.90",  "checkoutUrl": "https://buy.stripe.com/8x2eVf1FO156flR5Dr5wI06" },
      "vitalicio":  { "price": "127.90", "checkoutUrl": "https://buy.stripe.com/9B614pbgo156c9F5Dr5wI03" }
    },
    "max": {
      "mensal":     { "price": "29.90",  "checkoutUrl": "https://buy.stripe.com/5kQbJ384cbJK1v19TH5wI08" },
      "trimestral": { "price": "79.90",  "checkoutUrl": "https://buy.stripe.com/00w9AV5W47tuflRd5T5wI05" },
      "vitalicio":  { "price": "197.90", "checkoutUrl": "https://buy.stripe.com/14AfZjfwE8xy3D99TH5wI02" }
    }
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();