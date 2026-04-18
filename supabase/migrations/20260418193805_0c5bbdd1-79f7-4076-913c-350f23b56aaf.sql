
-- 1) Guard the profiles.plano column from self-escalation
CREATE OR REPLACE FUNCTION public.guard_plano_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plano IS DISTINCT FROM OLD.plano THEN
    IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      NEW.plano := OLD.plano;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_plano_update ON public.profiles;
CREATE TRIGGER protect_plano_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_plano_update();

-- 2) Restrict site_settings SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can read site_settings" ON public.site_settings;
CREATE POLICY "Authenticated users can read site_settings"
  ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (true);
