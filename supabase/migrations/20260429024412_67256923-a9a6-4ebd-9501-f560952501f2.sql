-- 1. Revoke public access to has_role (internal RLS helper only)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

-- 2. Block plan escalation on profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND plano = (SELECT p.plano FROM public.profiles p WHERE p.user_id = auth.uid())
  );

-- Belt-and-suspenders trigger
DROP TRIGGER IF EXISTS guard_plano_update_trg ON public.profiles;
CREATE TRIGGER guard_plano_update_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_plano_update();

-- 3. Block self-promotion on user_roles with explicit policies
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
CREATE POLICY "Only admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Confirm grants on legitimate public RPCs
GRANT EXECUTE ON FUNCTION public.list_categories_public() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_tools_public() TO anon, authenticated;

-- get_tool_premium: only authenticated (function itself enforces Pro/admin)
REVOKE EXECUTE ON FUNCTION public.get_tool_premium(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_tool_premium(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_tool_premium(text) TO authenticated;