
-- 1) blocked_devices: restrict SELECT to admins only (server-side checks use SECURITY DEFINER funcs)
DROP POLICY IF EXISTS "Everyone can check blocked devices" ON public.blocked_devices;
CREATE POLICY "Admins can read blocked devices"
ON public.blocked_devices FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));
REVOKE SELECT ON public.blocked_devices FROM anon;

-- 2) site_orders realtime: remove from realtime publication to stop broadcasting other users' orders
ALTER PUBLICATION supabase_realtime DROP TABLE public.site_orders;

-- 3) site_settings: replace broad authenticated read with a whitelist of public UI keys
DROP POLICY IF EXISTS "Authenticated users can read site_settings" ON public.site_settings;
CREATE POLICY "Public UI settings are readable by anyone"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (key IN ('nav_menu_items','plans_config','pro_plan','site_creation_banner','max_subscribe_url'));

-- 4) tools / categories: remove anon SELECT (client falls back to list_*_public RPCs)
DROP POLICY IF EXISTS "Anyone can read tools" ON public.tools;
DROP POLICY IF EXISTS "Public can read tools" ON public.tools;
DROP POLICY IF EXISTS "tools_public_read" ON public.tools;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tools;
DROP POLICY IF EXISTS "Anon can read tools" ON public.tools;
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Anon can read categories" ON public.categories;
REVOKE SELECT ON public.tools FROM anon;
REVOKE SELECT ON public.categories FROM anon;

-- 5) Revoke anon EXECUTE on SECURITY DEFINER functions that require an authenticated user
REVOKE EXECUTE ON FUNCTION public.initialize_admin_invites() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.list_abuse_blocks() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.remove_abuse_block(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.validate_invite_code(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.validate_invite_code(text, text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.initialize_admin_invites() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_abuse_blocks() TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_abuse_block(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_invite_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_invite_code(text, text, text) TO authenticated;

-- 6) Fix mutable search_path on update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
