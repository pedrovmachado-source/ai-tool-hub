-- Consolidate and secure validate_invite_code
DROP FUNCTION IF EXISTS public.validate_invite_code(text);
CREATE OR REPLACE FUNCTION public.validate_invite_code(invite_code_text text, p_fingerprint text DEFAULT NULL, p_ip_address text DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    target_invite_id UUID;
    target_owner_id UUID;
    v_user_id UUID := auth.uid();
    new_code TEXT;
    i INTEGER;
    is_abusive BOOLEAN := FALSE;
BEGIN
    -- Check auth
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sessão expirada. Faça login novamente.');
    END IF;

    -- Check if user is already validated
    IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_user_id AND invite_validated = TRUE) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuário já validado.');
    END IF;

    -- Check if the device is already blocked
    IF p_fingerprint IS NOT NULL AND EXISTS (SELECT 1 FROM public.blocked_devices WHERE fingerprint = p_fingerprint) THEN
        UPDATE public.profiles SET abuse_blocked = TRUE WHERE user_id = v_user_id;
        RETURN jsonb_build_object('success', false, 'message', 'Acesso bloqueado por abuso detectado.');
    END IF;

    -- Find the code
    SELECT id, owner_id INTO target_invite_id, target_owner_id
    FROM public.invite_codes
    WHERE code = invite_code_text AND is_used = FALSE
    LIMIT 1;

    IF target_invite_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou já utilizado.');
    END IF;

    -- Detect Abuse (Self-invite)
    IF p_fingerprint IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.device_logs 
        WHERE user_id = target_owner_id 
        AND (fingerprint = p_fingerprint OR (ip_address = p_ip_address AND p_ip_address IS NOT NULL))
    ) THEN
        is_abusive := TRUE;
    END IF;

    IF is_abusive THEN
        -- Block both accounts
        UPDATE public.profiles SET abuse_blocked = TRUE WHERE user_id IN (v_user_id, target_owner_id);
        
        -- Block the device
        IF p_fingerprint IS NOT NULL THEN
            INSERT INTO public.blocked_devices (fingerprint, ip_address, reason)
            VALUES (p_fingerprint, p_ip_address, 'Autoconvite detectado')
            ON CONFLICT (fingerprint) DO NOTHING;
        END IF;

        RETURN jsonb_build_object('success', false, 'message', 'Abuso detectado: autoconvite é estritamente proibido.');
    END IF;

    -- Mark code as used
    UPDATE public.invite_codes
    SET is_used = TRUE,
        used_by = v_user_id,
        used_at = now()
    WHERE id = target_invite_id;

    -- Update profile
    UPDATE public.profiles
    SET invite_validated = TRUE
    WHERE user_id = v_user_id;

    -- Log device
    IF p_fingerprint IS NOT NULL THEN
        INSERT INTO public.device_logs (user_id, fingerprint, ip_address)
        VALUES (v_user_id, p_fingerprint, p_ip_address);
    END IF;

    -- Generate 3 new codes for the new user
    FOR i IN 1..3 LOOP
        LOOP
            new_code := generate_unique_invite_code();
            BEGIN
                INSERT INTO public.invite_codes (code, owner_id)
                VALUES (new_code, v_user_id);
                EXIT;
            EXCEPTION WHEN unique_violation THEN
                -- loop again
            END;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'message', 'Convite validado com sucesso! Bem-vindo ao Club.');
END;
$function$;

-- Secure handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, nome, sobrenome, sobre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'sobrenome', ''),
    COALESCE(NEW.raw_user_meta_data->>'sobre', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nome = EXCLUDED.nome,
    sobrenome = EXCLUDED.sobrenome,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$function$;

-- Secure admin-only and sensitive functions
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
ALTER FUNCTION public.get_tool_premium(text) SET search_path = public;
ALTER FUNCTION public.set_activity_log_actor_email() SET search_path = public;
ALTER FUNCTION public.list_abuse_blocks() SET search_path = public;
ALTER FUNCTION public.remove_abuse_block(uuid, text) SET search_path = public;
ALTER FUNCTION public.regenerate_invite_code(uuid) SET search_path = public;
ALTER FUNCTION public.get_monthly_offer_ranking() SET search_path = public;
ALTER FUNCTION public.initialize_admin_invites() SET search_path = public;

-- Revoke and Grant EXECUTE for admin functions to be safe
REVOKE EXECUTE ON FUNCTION public.list_abuse_blocks() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_abuse_blocks() TO authenticated; -- Role check is inside function

REVOKE EXECUTE ON FUNCTION public.remove_abuse_block(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_abuse_block(uuid, text) TO authenticated; -- Role check is inside function

REVOKE EXECUTE ON FUNCTION public.initialize_admin_invites() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.initialize_admin_invites() TO service_role;
