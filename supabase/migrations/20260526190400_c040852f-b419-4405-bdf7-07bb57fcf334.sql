-- Add abuse_blocked to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS abuse_blocked BOOLEAN DEFAULT FALSE;

-- Create device_logs table
CREATE TABLE IF NOT EXISTS public.device_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    fingerprint TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blocked_devices table
CREATE TABLE IF NOT EXISTS public.blocked_devices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    fingerprint TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT ON public.device_logs TO authenticated;
GRANT ALL ON public.device_logs TO service_role;

GRANT SELECT ON public.blocked_devices TO authenticated;
GRANT ALL ON public.blocked_devices TO service_role;

-- Enable RLS
ALTER TABLE public.device_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_devices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own device logs"
ON public.device_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device logs"
ON public.device_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can check blocked devices"
ON public.blocked_devices FOR SELECT
USING (true);

-- Updated validate_invite_code to handle abuse detection
CREATE OR REPLACE FUNCTION validate_invite_code(
    invite_code_text TEXT,
    p_fingerprint TEXT,
    p_ip_address TEXT
)
RETURNS JSONB AS $$
DECLARE
    target_invite_id UUID;
    target_owner_id UUID;
    v_user_id UUID := auth.uid();
    new_code TEXT;
    i INTEGER;
    is_abusive BOOLEAN := FALSE;
BEGIN
    -- Check if user is already validated
    IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_user_id AND invite_validated = TRUE) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuário já validado.');
    END IF;

    -- Check if the device is already blocked
    IF EXISTS (SELECT 1 FROM public.blocked_devices WHERE fingerprint = p_fingerprint) THEN
        UPDATE public.profiles SET abuse_blocked = TRUE WHERE user_id = v_user_id;
        RETURN jsonb_build_object('success', false, 'message', 'Error 2 - Acesso bloqueado por abuso.');
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
    -- Check if code owner has used this fingerprint or IP
    IF EXISTS (
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
        INSERT INTO public.blocked_devices (fingerprint, ip_address, reason)
        VALUES (p_fingerprint, p_ip_address, 'Autoconvite detectado')
        ON CONFLICT (fingerprint) DO NOTHING;

        RETURN jsonb_build_object('success', false, 'message', 'Abuso detectado: autoconvite é proibido.');
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
    INSERT INTO public.device_logs (user_id, fingerprint, ip_address)
    VALUES (v_user_id, p_fingerprint, p_ip_address);

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

    RETURN jsonb_build_object('success', true, 'message', 'Convite validado com sucesso!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin function to list blocked items
CREATE OR REPLACE FUNCTION list_abuse_blocks()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    nome TEXT,
    fingerprint TEXT,
    ip_address TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    RETURN QUERY
    SELECT 
        p.user_id,
        p.email,
        p.nome,
        bd.fingerprint,
        bd.ip_address,
        bd.blocked_at
    FROM public.profiles p
    LEFT JOIN public.device_logs dl ON p.user_id = dl.user_id
    LEFT JOIN public.blocked_devices bd ON dl.fingerprint = bd.fingerprint
    WHERE p.abuse_blocked = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin function to remove abuse block
CREATE OR REPLACE FUNCTION remove_abuse_block(target_user_id UUID, target_fingerprint TEXT)
RETURNS JSONB AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Acesso negado.');
    END IF;

    -- Unblock profile
    UPDATE public.profiles SET abuse_blocked = FALSE WHERE user_id = target_user_id;
    
    -- Remove device block if provided
    IF target_fingerprint IS NOT NULL THEN
        DELETE FROM public.blocked_devices WHERE fingerprint = target_fingerprint;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Bloqueio removido com sucesso.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION list_abuse_blocks() TO authenticated;
GRANT EXECUTE ON FUNCTION remove_abuse_block(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_invite_code(TEXT, TEXT, TEXT) TO authenticated;