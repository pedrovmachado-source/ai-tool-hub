CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres, service_role;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO postgres, service_role;

CREATE OR REPLACE FUNCTION public.guard_plano_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  IF NEW.plano IS DISTINCT FROM OLD.plano THEN
    IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
      NEW.plano := OLD.plano;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_tool_premium(_tool_key text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  is_allowed boolean;
  result jsonb;
BEGIN
  SELECT
    private.has_role(auth.uid(), 'admin'::public.app_role)
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

ALTER POLICY "Admins can read activity logs"
ON public.activity_logs
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can insert categories"
ON public.categories
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can update categories"
ON public.categories
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can delete categories"
ON public.categories
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Pro users and admins can view lessons"
ON public.lessons
USING (
  private.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.plano = 'Pro'
  )
);

ALTER POLICY "Admins can insert lessons"
ON public.lessons
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can update lessons"
ON public.lessons
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can delete lessons"
ON public.lessons
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Pro users and admins can view modules"
ON public.modules
USING (
  private.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.plano = 'Pro'
  )
);

ALTER POLICY "Admins can insert modules"
ON public.modules
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can update modules"
ON public.modules
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can delete modules"
ON public.modules
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can read all profiles"
ON public.profiles
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can update any profile"
ON public.profiles
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can manage site_settings"
ON public.site_settings
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can insert tools"
ON public.tools
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can update tools"
ON public.tools
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins can delete tools"
ON public.tools
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Pro users and admins can view tools"
ON public.tools
USING (
  private.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.plano = 'Pro'
  )
);

ALTER POLICY "Admins can manage roles"
ON public.user_roles
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Only admins can insert roles"
ON public.user_roles
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Only admins can delete roles"
ON public.user_roles
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Only admins can update roles"
ON public.user_roles
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Pro and admins can read lesson pdfs" ON storage.objects;
CREATE POLICY "Pro and admins can read lesson pdfs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'lesson-pdfs' AND (
      private.has_role(auth.uid(), 'admin'::public.app_role) OR EXISTS (
        SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND plano = 'Pro'
      )
    )
  );

DROP POLICY IF EXISTS "Admins can upload lesson pdfs" ON storage.objects;
CREATE POLICY "Admins can upload lesson pdfs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-pdfs' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update lesson pdfs" ON storage.objects;
CREATE POLICY "Admins can update lesson pdfs"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'lesson-pdfs' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete lesson pdfs" ON storage.objects;
CREATE POLICY "Admins can delete lesson pdfs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'lesson-pdfs' AND private.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;