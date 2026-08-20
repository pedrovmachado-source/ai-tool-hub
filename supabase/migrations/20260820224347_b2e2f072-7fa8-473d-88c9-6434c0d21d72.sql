CREATE OR REPLACE FUNCTION public.regenerate_invite_code(target_invite_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    new_code TEXT;
BEGIN
    IF NOT public.has_role(v_user_id, 'admin'::public.app_role) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Apenas administradores podem regenerar convites.');
    END IF;

    LOOP
        new_code := public.generate_unique_invite_code();
        IF NOT EXISTS (SELECT 1 FROM public.invite_codes WHERE code = new_code) THEN
            EXIT;
        END IF;
    END LOOP;

    UPDATE public.invite_codes
    SET code = new_code,
        is_used = FALSE,
        used_at = NULL,
        used_by = NULL,
        uses = 0,
        max_uses = GREATEST(COALESCE(max_uses, 1), 1),
        active = TRUE,
        created_at = now()
    WHERE id = target_invite_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Convite não encontrado.');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Código de convite substituído com sucesso!', 'new_code', new_code);
END;
$$;

REVOKE ALL ON FUNCTION public.regenerate_invite_code(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.regenerate_invite_code(uuid) TO authenticated, service_role;

-- Corrige convites que ficaram travados (uses >= max_uses mas sem uso real)
UPDATE public.invite_codes
SET uses = 0, is_used = FALSE
WHERE used_by IS NULL AND used_at IS NULL AND uses > 0;