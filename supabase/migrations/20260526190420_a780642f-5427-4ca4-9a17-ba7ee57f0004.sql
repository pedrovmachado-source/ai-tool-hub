-- Set search_path and revoke public access for security
ALTER FUNCTION public.validate_invite_code(TEXT, TEXT, TEXT) SET search_path = public;
ALTER FUNCTION public.list_abuse_blocks() SET search_path = public;
ALTER FUNCTION public.remove_abuse_block(UUID, TEXT) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.validate_invite_code(TEXT, TEXT, TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION public.list_abuse_blocks() FROM public;
REVOKE EXECUTE ON FUNCTION public.remove_abuse_block(UUID, TEXT) FROM public;

GRANT EXECUTE ON FUNCTION public.validate_invite_code(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_abuse_blocks() TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_abuse_block(UUID, TEXT) TO authenticated;