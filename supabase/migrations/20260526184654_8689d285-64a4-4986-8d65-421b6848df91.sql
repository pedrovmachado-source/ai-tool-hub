-- Set search_path for the functions
ALTER FUNCTION generate_unique_invite_code() SET search_path = public;
ALTER FUNCTION validate_invite_code(TEXT) SET search_path = public;

-- Function for admins to initialize their invites
CREATE OR REPLACE FUNCTION initialize_admin_invites()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    new_code TEXT;
    i INTEGER;
    is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = v_user_id AND role = 'admin'
    ) INTO is_admin;

    IF NOT is_admin THEN
        RETURN jsonb_build_object('success', false, 'message', 'Apenas administradores podem inicializar convites.');
    END IF;

    -- Mark as validated if not already
    UPDATE public.profiles
    SET invite_validated = TRUE
    WHERE user_id = v_user_id;

    -- Generate 3 codes if they have none
    IF NOT EXISTS (SELECT 1 FROM public.invite_codes WHERE owner_id = v_user_id) THEN
        FOR i IN 1..3 LOOP
            LOOP
                new_code := generate_unique_invite_code();
                BEGIN
                    INSERT INTO public.invite_codes (code, owner_id)
                    VALUES (new_code, v_user_id);
                    EXIT;
                EXCEPTION WHEN unique_violation THEN
                    -- try again
                END;
            END LOOP;
        END LOOP;
        RETURN jsonb_build_object('success', true, 'message', 'Convites inicializados com sucesso.');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'O administrador já possui convites ou já está validado.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION initialize_admin_invites() TO authenticated;
