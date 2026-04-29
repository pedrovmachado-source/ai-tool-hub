-- Revoke public access on internal helper functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_plano_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Restrict catalog listing functions to authenticated users only
REVOKE EXECUTE ON FUNCTION public.list_categories_public() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.list_tools_public() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_categories_public() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_tools_public() TO authenticated;

-- Ensure get_tool_premium remains restricted to authenticated only
REVOKE EXECUTE ON FUNCTION public.get_tool_premium(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_tool_premium(text) TO authenticated;