-- Revoking direct execute for anon on sensitive functions
REVOKE EXECUTE ON FUNCTION public.spend_cash(uuid, bigint, uuid) FROM anon, authenticated;
-- Re-granting only to authenticated since we handle the check inside
GRANT EXECUTE ON FUNCTION public.spend_cash(uuid, bigint, uuid) TO authenticated;

-- Setting search_path to public for security
ALTER FUNCTION public.spend_cash(uuid, bigint, uuid) SET search_path = public;

-- Check other functions from linter results (I'll need their names)
-- I'll assume they are common ones or from previous tools
-- Let's re-run the functions query to be sure about others
