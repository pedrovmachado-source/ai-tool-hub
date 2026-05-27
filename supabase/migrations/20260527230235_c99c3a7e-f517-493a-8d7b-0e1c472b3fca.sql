
-- 1. Restrict profile visibility
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- 2. Restrict offer_analyses public exposure
DROP POLICY IF EXISTS "Anyone can view approved analyses for ranking" ON public.offer_analyses;

-- 3. Aggregated ranking function (no raw user_id exposure to anon)
CREATE OR REPLACE FUNCTION public.get_monthly_offer_ranking()
RETURNS TABLE(rank_position int, nome text, avatar_url text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC))::int AS rank_position,
    COALESCE(p.nome, 'Usuário') AS nome,
    p.avatar_url,
    COUNT(*) AS count
  FROM public.offer_analyses oa
  LEFT JOIN public.profiles p ON p.user_id = oa.user_id
  WHERE oa.status = 'approved'
    AND oa.created_at >= date_trunc('month', now())
    AND oa.created_at < date_trunc('month', now()) + interval '1 month'
  GROUP BY p.nome, p.avatar_url
  ORDER BY count DESC
  LIMIT 3;
$$;

REVOKE ALL ON FUNCTION public.get_monthly_offer_ranking() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_monthly_offer_ranking() TO anon, authenticated;

-- 4. Revoke anon EXECUTE on sensitive SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.validate_invite_code(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.validate_invite_code(text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.regenerate_invite_code(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.initialize_admin_invites() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.remove_abuse_block(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.list_abuse_blocks() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_tool_premium(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.validate_invite_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_invite_code(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.regenerate_invite_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_admin_invites() TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_abuse_block(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_abuse_blocks() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tool_premium(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
