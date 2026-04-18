
-- =========================================================
-- 1) Restrict the tools table to Pro users and admins
-- =========================================================
DROP POLICY IF EXISTS "Anyone can view tools" ON public.tools;

CREATE POLICY "Pro users and admins can view tools"
  ON public.tools
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.plano = 'Pro'
    )
  );

-- =========================================================
-- 2) Public view exposing ONLY safe (non-premium) fields
--    This is what unauthenticated/Free visitors see.
-- =========================================================
CREATE OR REPLACE VIEW public.tools_public
WITH (security_invoker = true) AS
SELECT
  id,
  category_key,
  key,
  name,
  description,
  url,
  url_label,
  badge,
  sort_order,
  -- expose ONLY non-premium fields from data JSONB
  jsonb_build_object(
    'image', data->'image',
    'gallery', data->'gallery',
    'stats', data->'stats',
    'pricing', data->'pricing',
    'comparison', data->'comparison',
    'whenToUse', data->'whenToUse',
    'fullDesc', data->'fullDesc',
    'tip', data->'tip',
    'imageDescriptions', data->'imageDescriptions'
  ) AS data,
  created_at,
  updated_at
FROM public.tools;

GRANT SELECT ON public.tools_public TO anon, authenticated;

-- Bypass RLS on the underlying table for this view ONLY by making it
-- a security_definer-equivalent: we use a SECURITY DEFINER function wrapper
-- because security_invoker views still inherit RLS. Replace with an
-- unrestricted-read function instead:
DROP VIEW IF EXISTS public.tools_public;

CREATE OR REPLACE FUNCTION public.list_tools_public()
RETURNS TABLE (
  id uuid,
  category_key text,
  key text,
  name text,
  description text,
  url text,
  url_label text,
  badge text,
  sort_order integer,
  data jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, category_key, key, name, description, url, url_label, badge, sort_order,
    jsonb_build_object(
      'image', data->'image',
      'gallery', data->'gallery',
      'stats', data->'stats',
      'pricing', data->'pricing',
      'comparison', data->'comparison',
      'whenToUse', data->'whenToUse',
      'fullDesc', data->'fullDesc',
      'tip', data->'tip',
      'imageDescriptions', data->'imageDescriptions'
    ) AS data,
    created_at, updated_at
  FROM public.tools
  ORDER BY sort_order;
$$;

GRANT EXECUTE ON FUNCTION public.list_tools_public() TO anon, authenticated;

-- =========================================================
-- 3) Same treatment for categories.prompts_extra
--    Restrict full row to Pro/admin, expose safe fields publicly.
-- =========================================================
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

CREATE POLICY "Pro users and admins can view categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.plano = 'Pro'
    )
  );

CREATE OR REPLACE FUNCTION public.list_categories_public()
RETURNS TABLE (
  id uuid,
  key text,
  label text,
  accent text,
  accent_light text,
  accent_dark text,
  intro_title text,
  intro_text text,
  when_tags jsonb,
  stats jsonb,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, key, label, accent, accent_light, accent_dark,
    intro_title, intro_text, when_tags, stats, sort_order,
    created_at, updated_at
  FROM public.categories
  ORDER BY sort_order;
$$;

GRANT EXECUTE ON FUNCTION public.list_categories_public() TO anon, authenticated;

-- =========================================================
-- 4) Premium content fetch — only for Pro users and admins
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_tool_premium(_tool_key text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_allowed boolean;
  result jsonb;
BEGIN
  SELECT
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND plano = 'Pro'
    )
  INTO is_allowed;

  IF NOT is_allowed THEN
    RAISE EXCEPTION 'Forbidden: Pro plan required';
  END IF;

  SELECT data INTO result FROM public.tools WHERE key = _tool_key;
  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_tool_premium(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_tool_premium(text) TO authenticated;
