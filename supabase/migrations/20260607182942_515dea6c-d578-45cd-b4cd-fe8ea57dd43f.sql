
-- Fix mutable search_path on email queue functions
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- Revoke EXECUTE from anon/public on SECURITY DEFINER functions in public schema.
-- Grant only to authenticated users (and service_role) where they should be callable from the app.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.validate_invite_code(text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_tool_premium(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.spend_cash(uuid, bigint, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.initialize_admin_invites() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.remove_abuse_block(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.regenerate_invite_code(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_emails(uuid[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.list_abuse_blocks() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_monthly_offer_ranking() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_cash_balance(uuid, bigint) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon;

-- Grant EXECUTE to authenticated/service_role where appropriate
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_invite_code(text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_tool_premium(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.spend_cash(uuid, bigint, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.initialize_admin_invites() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.remove_abuse_block(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.regenerate_invite_code(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.list_abuse_blocks() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_monthly_offer_ranking() TO authenticated, service_role;

-- Email queue + cash increment + admin-only utilities are only invoked by service_role/edge functions
GRANT EXECUTE ON FUNCTION public.increment_cash_balance(uuid, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
