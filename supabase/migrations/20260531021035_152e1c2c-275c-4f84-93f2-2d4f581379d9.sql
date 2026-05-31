CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    result jsonb;
    current_user_id uuid;
    is_admin boolean;
BEGIN
    current_user_id := auth.uid();
    
    -- Check if requester is admin
    SELECT (role = 'admin') INTO is_admin FROM public.profiles WHERE id = current_user_id;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT jsonb_agg(jsonb_build_object('id', id, 'email', email))
    INTO result
    FROM auth.users
    WHERE id = ANY(user_ids);

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO authenticated;