REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_active_access(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_active_access(uuid) TO authenticated, service_role;