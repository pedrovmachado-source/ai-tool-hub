-- Revoke direct modify permissions from authenticated users
REVOKE INSERT, UPDATE, DELETE ON public.invite_codes FROM authenticated;

-- Ensure SELECT is still allowed (already enabled via policy, but let's be explicit)
GRANT SELECT ON public.invite_codes TO authenticated;

-- The functions are SECURITY DEFINER, so they will still work.
