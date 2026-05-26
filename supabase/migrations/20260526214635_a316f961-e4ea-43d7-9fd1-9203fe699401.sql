CREATE OR REPLACE FUNCTION public.regenerate_invite_code(target_invite_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    is_admin BOOLEAN;
    new_code TEXT;
BEGIN
    -- Check if caller is admin
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = v_user_id AND role = 'admin'
    ) INTO is_admin;

    IF NOT is_admin THEN
        RETURN jsonb_build_object('success', false, 'message', 'Apenas administradores podem regenerar convites.');
    END IF;

    -- Generate a new unique code
    LOOP
        new_code := generate_unique_invite_code();
        IF NOT EXISTS (SELECT 1 FROM public.invite_codes WHERE code = new_code) THEN
            EXIT;
        END IF;
    END LOOP;

    -- Update the existing invite record
    UPDATE public.invite_codes
    SET code = new_code,
        is_used = FALSE,
        used_at = NULL,
        used_by = NULL,
        created_at = now()
    WHERE id = target_invite_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Convite não encontrado.');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Código de convite substituído com sucesso!', 'new_code', new_code);
END;
$$;

GRANT EXECUTE ON FUNCTION public.regenerate_invite_code(UUID) TO authenticated;
GRANT ALL ON FUNCTION public.regenerate_invite_code(UUID) TO service_role;