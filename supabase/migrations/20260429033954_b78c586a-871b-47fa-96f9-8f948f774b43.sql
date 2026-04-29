
-- Trigger-only / internal helpers: revoke all EXECUTE access.
-- Triggers still execute these regardless of grants.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_plano_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_activity_log_actor_email() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies; revoke direct external access.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- get_tool_premium: only signed-in users; never anon.
REVOKE EXECUTE ON FUNCTION public.get_tool_premium(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_tool_premium(text) TO authenticated;
