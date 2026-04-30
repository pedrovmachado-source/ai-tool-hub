
-- 1. Grant EXECUTE on private.has_role to authenticated (needed by RLS policies)
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

-- 2. Fix the categories SELECT policy that still uses unqualified has_role()
DROP POLICY IF EXISTS "Pro users and admins can view categories" ON public.categories;
CREATE POLICY "Pro users and admins can view categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.plano = 'Pro'
    )
  );

-- 3. Fix tools SELECT policy (also uses unqualified has_role)
DROP POLICY IF EXISTS "Pro users and admins can view tools" ON public.tools;
CREATE POLICY "Pro users and admins can view tools"
  ON public.tools
  FOR SELECT
  TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.plano = 'Pro'
    )
  );

-- 4. Remove duplicate trigger on profiles
DROP TRIGGER IF EXISTS guard_plano_update_trg ON public.profiles;
