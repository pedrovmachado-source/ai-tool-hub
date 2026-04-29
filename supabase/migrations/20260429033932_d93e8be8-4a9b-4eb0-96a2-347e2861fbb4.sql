
-- =========================================================
-- 1) activity_logs: prevent forged actor_email
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_activity_log_actor_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  -- Force actor_id to the authenticated user
  NEW.actor_id := auth.uid();

  -- Derive actor_email server-side from profiles (fallback to auth.users)
  SELECT email INTO v_email FROM public.profiles WHERE user_id = auth.uid();
  IF v_email IS NULL OR v_email = '' THEN
    SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  END IF;

  NEW.actor_email := COALESCE(v_email, '');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_activity_log_actor_email_trg ON public.activity_logs;
CREATE TRIGGER set_activity_log_actor_email_trg
  BEFORE INSERT ON public.activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_activity_log_actor_email();

-- =========================================================
-- 2) Convert public catalog functions to SECURITY INVOKER
--    and grant anon SELECT on the underlying tables so the
--    public home page keeps working for non-logged-in users.
-- =========================================================

-- Categories: add an anon-readable policy
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
  ON public.categories
  FOR SELECT
  TO anon
  USING (true);

-- Tools: add an anon-readable policy (data jsonb is filtered by the function)
DROP POLICY IF EXISTS "Public can read tools" ON public.tools;
CREATE POLICY "Public can read tools"
  ON public.tools
  FOR SELECT
  TO anon
  USING (true);

-- Switch list_categories_public to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.list_categories_public()
 RETURNS TABLE(id uuid, key text, label text, accent text, accent_light text, accent_dark text, intro_title text, intro_text text, when_tags jsonb, stats jsonb, sort_order integer, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT
    id, key, label, accent, accent_light, accent_dark,
    intro_title, intro_text, when_tags, stats, sort_order,
    created_at, updated_at
  FROM public.categories
  ORDER BY sort_order;
$function$;

-- Switch list_tools_public to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.list_tools_public()
 RETURNS TABLE(id uuid, category_key text, key text, name text, description text, url text, url_label text, badge text, sort_order integer, data jsonb, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Ensure anon and authenticated can call the public catalog functions
GRANT EXECUTE ON FUNCTION public.list_categories_public() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_tools_public() TO anon, authenticated;
