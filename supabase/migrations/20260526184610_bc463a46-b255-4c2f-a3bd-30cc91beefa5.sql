-- Add invite_validated to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invite_validated BOOLEAN DEFAULT FALSE;

-- Create invite_codes table
CREATE TABLE public.invite_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    used_by UUID REFERENCES auth.users(id),
    used_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for performance
CREATE INDEX idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX idx_invite_codes_owner ON public.invite_codes(owner_id);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invite_codes TO authenticated;
GRANT ALL ON public.invite_codes TO service_role;

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own codes"
ON public.invite_codes
FOR SELECT
USING (auth.uid() = owner_id OR auth.uid() = used_by);

-- Function to generate a random 8-char alphanumeric code
CREATE OR REPLACE FUNCTION generate_unique_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed ambiguous chars (0, O, I, 1)
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to handle invite validation and generation of 3 new codes
CREATE OR REPLACE FUNCTION validate_invite_code(invite_code_text TEXT)
RETURNS JSONB AS $$
DECLARE
    target_invite_id UUID;
    target_owner_id UUID;
    v_user_id UUID := auth.uid();
    new_code TEXT;
    i INTEGER;
BEGIN
    -- Check if user is already validated
    IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_user_id AND invite_validated = TRUE) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuário já validado.');
    END IF;

    -- Find the code
    SELECT id, owner_id INTO target_invite_id, target_owner_id
    FROM public.invite_codes
    WHERE code = invite_code_text AND is_used = FALSE
    LIMIT 1;

    IF target_invite_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou já utilizado.');
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

    -- Generate 3 new codes for the new user
    FOR i IN 1..3 LOOP
        LOOP
            new_code := generate_unique_invite_code();
            BEGIN
                INSERT INTO public.invite_codes (code, owner_id)
                VALUES (new_code, v_user_id);
                EXIT; -- exit inner loop if insert succeeds
            EXCEPTION WHEN unique_violation THEN
                -- loop again to try a different code
            END;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'message', 'Convite validado com sucesso!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION validate_invite_code(TEXT) TO authenticated;
