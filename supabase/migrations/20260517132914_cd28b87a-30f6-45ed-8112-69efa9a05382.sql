-- 1) RLS: incluir 'Max' nas verificações
DROP POLICY IF EXISTS "Pro users and admins can view categories" ON public.categories;
CREATE POLICY "Pro/Max users and admins can view categories"
ON public.categories FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND plano IN ('Pro','Max'))
);

DROP POLICY IF EXISTS "Pro users and admins can view tools" ON public.tools;
CREATE POLICY "Pro/Max users and admins can view tools"
ON public.tools FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND plano IN ('Pro','Max'))
);

DROP POLICY IF EXISTS "Pro users and admins can view modules" ON public.modules;
CREATE POLICY "Max users and admins can view modules"
ON public.modules FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND plano = 'Max')
);

DROP POLICY IF EXISTS "Pro users and admins can view lessons" ON public.lessons;
CREATE POLICY "Max users and admins can view lessons"
ON public.lessons FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND plano = 'Max')
);

-- 2) Função premium: liberar Pro e Max
CREATE OR REPLACE FUNCTION public.get_tool_premium(_tool_key text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
DECLARE
  is_allowed boolean;
  result jsonb;
BEGIN
  SELECT
    private.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND plano IN ('Pro','Max')
    )
  INTO is_allowed;

  IF NOT is_allowed THEN
    RAISE EXCEPTION 'Forbidden: Pro or Max plan required';
  END IF;

  SELECT data INTO result FROM public.tools WHERE key = _tool_key;
  RETURN result;
END;
$function$;

-- 3) Seed da configuração de planos
INSERT INTO public.site_settings (key, value)
VALUES ('plans_config', jsonb_build_object(
  'pro', jsonb_build_object(
    'mensal',     jsonb_build_object('price','19.90','checkoutUrl','https://buy.stripe.com/test_eVqdRb2JS5lmflRc1P5wI01'),
    'trimestral', jsonb_build_object('price','49.90','checkoutUrl','https://buy.stripe.com/test_9B614pbgo156c9F5Dr5wI03'),
    'vitalicio',  jsonb_build_object('price','127.90','checkoutUrl','https://buy.stripe.com/test_14AfZjfwE8xy3D99TH5wI02')
  ),
  'max', jsonb_build_object(
    'mensal',     jsonb_build_object('price','29.90','checkoutUrl','https://buy.stripe.com/test_7sYaEZ84c8xya1xfe15wI04'),
    'trimestral', jsonb_build_object('price','79.90','checkoutUrl','https://buy.stripe.com/test_00w9AV5W47tuflRd5T5wI05'),
    'vitalicio',  jsonb_build_object('price','197.90','checkoutUrl','https://buy.stripe.com/test_8x2eVf1FO156flR5Dr5wI06')
  )
))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();