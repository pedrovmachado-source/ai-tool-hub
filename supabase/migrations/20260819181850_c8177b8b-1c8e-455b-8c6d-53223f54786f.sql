ALTER TABLE public.invite_codes
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS max_uses integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS uses integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS redeem_until timestamptz,
  ADD COLUMN IF NOT EXISTS grants_access_until timestamptz,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

UPDATE public.invite_codes SET uses = 1 WHERE is_used = true AND uses = 0;

-- ---------- métricas ----------
CREATE OR REPLACE FUNCTION public.admin_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'active_access', (SELECT count(*) FROM public.subscribers WHERE access_until IS NOT NULL AND access_until > now()),
    'by_invite', (SELECT count(*) FROM public.subscribers WHERE access_until > now() AND access_source = 'invite'),
    'by_subscription', (SELECT count(*) FROM public.subscribers WHERE access_until > now() AND access_source = 'subscription'),
    'blocked', (SELECT count(*) FROM public.profiles WHERE abuse_blocked IS TRUE),
    'mrr_cents', (SELECT count(*) * 990 FROM public.subscribers WHERE access_until > now() AND access_source = 'subscription' AND subscription_status IN ('active','trialing')),
    'pending_claims', (SELECT count(*) FROM public.access_claims WHERE status = 'pending'),
    'unmatched_open', (SELECT count(*) FROM public.unmatched_sales WHERE resolved IS NOT TRUE)
  ) INTO r;
  RETURN r;
END;
$$;

-- ---------- convites ----------
CREATE OR REPLACE FUNCTION public.admin_list_invites()
RETURNS TABLE(
  id uuid, code text, description text, max_uses integer, uses integer,
  redeem_until timestamptz, grants_access_until timestamptz, active boolean,
  is_used boolean, created_at timestamptz, owner_email text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
  SELECT ic.id, ic.code, ic.description, ic.max_uses, ic.uses,
         ic.redeem_until, ic.grants_access_until, ic.active, ic.is_used, ic.created_at,
         COALESCE(p.email, '')
  FROM public.invite_codes ic
  LEFT JOIN public.profiles p ON p.user_id = ic.owner_id
  ORDER BY ic.created_at DESC
  LIMIT 500;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_invites(
  p_quantity integer DEFAULT 1,
  p_description text DEFAULT NULL,
  p_max_uses integer DEFAULT 1,
  p_redeem_until timestamptz DEFAULT NULL,
  p_grants_access_until timestamptz DEFAULT NULL
)
RETURNS TABLE(code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE i integer; new_code text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 200 THEN
    RAISE EXCEPTION 'Quantidade inválida (1 a 200)';
  END IF;

  FOR i IN 1..p_quantity LOOP
    LOOP
      new_code := public.generate_unique_invite_code();
      BEGIN
        INSERT INTO public.invite_codes
          (code, owner_id, description, max_uses, uses, redeem_until, grants_access_until, active, is_used)
        VALUES
          (new_code, auth.uid(), NULLIF(btrim(COALESCE(p_description,'')), ''),
           GREATEST(COALESCE(p_max_uses, 1), 1), 0, p_redeem_until, p_grants_access_until, true, false);
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;
    RETURN QUERY SELECT new_code;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_invite_active(p_invite_id uuid, p_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.invite_codes SET active = COALESCE(p_active, true) WHERE id = p_invite_id;
END;
$$;

-- ---------- usuários ----------
CREATE OR REPLACE FUNCTION public.admin_list_users(p_search text DEFAULT NULL, p_limit integer DEFAULT 100)
RETURNS TABLE(
  user_id uuid, email text, nome text, plano text, abuse_blocked boolean,
  subscription_status text, access_until timestamptz, access_source text,
  plan_name text, next_charge_date timestamptz, roles text[], created_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
  SELECT p.user_id,
         COALESCE(p.email, '') AS email,
         COALESCE(p.nome, '') AS nome,
         COALESCE(p.plano, 'Free') AS plano,
         COALESCE(p.abuse_blocked, false),
         s.subscription_status,
         s.access_until,
         s.access_source,
         s.plan_name,
         s.next_charge_date,
         COALESCE(ARRAY(SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.user_id ORDER BY ur.role::text), '{}'::text[]),
         p.created_at
  FROM public.profiles p
  LEFT JOIN public.subscribers s ON s.user_id = p.user_id
  WHERE p_search IS NULL OR btrim(p_search) = ''
     OR p.email ILIKE '%' || btrim(p_search) || '%'
     OR p.nome ILIKE '%' || btrim(p_search) || '%'
  ORDER BY p.created_at DESC
  LIMIT LEAST(COALESCE(p_limit, 100), 500);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_access_until(
  p_user_id uuid,
  p_access_until timestamptz,
  p_reason text,
  p_source text DEFAULT 'manual'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_email text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'Justificativa obrigatória';
  END IF;

  SELECT email INTO v_email FROM public.profiles WHERE user_id = p_user_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  INSERT INTO public.subscribers (user_id, email, access_until, access_source, subscription_status)
  VALUES (p_user_id, v_email, p_access_until, p_source,
          CASE WHEN p_access_until IS NULL OR p_access_until <= now() THEN 'none' ELSE 'active' END)
  ON CONFLICT (user_id) DO UPDATE
    SET access_until = EXCLUDED.access_until,
        access_source = EXCLUDED.access_source,
        subscription_status = EXCLUDED.subscription_status,
        updated_at = now();

  INSERT INTO public.activity_logs (actor_id, actor_email, action, entity_type, entity_id, entity_label, metadata)
  VALUES (auth.uid(), '', 'access_until_manual', 'subscriber', p_user_id::text, v_email,
          jsonb_build_object('access_until', p_access_until, 'reason', btrim(p_reason), 'source', p_source));

  RETURN jsonb_build_object('success', true, 'access_until', p_access_until);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_role(p_user_id uuid, p_role public.app_role, p_grant boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF p_role = 'admin'::public.app_role THEN
    RAISE EXCEPTION 'O papel de administrador não pode ser alterado por aqui';
  END IF;

  IF p_grant THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, p_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = p_user_id AND role = p_role;
  END IF;

  INSERT INTO public.activity_logs (actor_id, actor_email, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), '', CASE WHEN p_grant THEN 'role_granted' ELSE 'role_revoked' END,
          'user_role', p_user_id::text, jsonb_build_object('role', p_role::text));

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ---------- vincular venda não identificada ----------
CREATE OR REPLACE FUNCTION public.admin_link_unmatched_sale(
  p_unmatched_id uuid,
  p_user_id uuid,
  p_access_until timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_email text; v_sale text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT sale_id INTO v_sale FROM public.unmatched_sales WHERE id = p_unmatched_id;
  IF v_sale IS NULL AND NOT EXISTS (SELECT 1 FROM public.unmatched_sales WHERE id = p_unmatched_id) THEN
    RAISE EXCEPTION 'Venda não encontrada';
  END IF;

  SELECT email INTO v_email FROM public.profiles WHERE user_id = p_user_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  INSERT INTO public.subscribers (user_id, email, access_until, access_source, subscription_status, kirvano_last_sale_id)
  VALUES (p_user_id, v_email, p_access_until, 'subscription', 'active', v_sale)
  ON CONFLICT (user_id) DO UPDATE
    SET access_until = GREATEST(COALESCE(public.subscribers.access_until, p_access_until), p_access_until),
        access_source = 'subscription',
        subscription_status = 'active',
        kirvano_last_sale_id = COALESCE(v_sale, public.subscribers.kirvano_last_sale_id),
        updated_at = now();

  UPDATE public.unmatched_sales SET resolved = true WHERE id = p_unmatched_id;

  INSERT INTO public.activity_logs (actor_id, actor_email, action, entity_type, entity_id, entity_label, metadata)
  VALUES (auth.uid(), '', 'unmatched_sale_linked', 'unmatched_sale', p_unmatched_id::text, v_email,
          jsonb_build_object('sale_id', v_sale, 'access_until', p_access_until, 'user_id', p_user_id));

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ---------- resgate de convite com novas regras ----------
CREATE OR REPLACE FUNCTION public.validate_invite_code(invite_code_text text, p_fingerprint text DEFAULT NULL::text, p_ip_address text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite public.invite_codes;
    v_user_id UUID := auth.uid();
    v_email text;
    new_code TEXT;
    i INTEGER;
    is_abusive BOOLEAN := FALSE;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sessão expirada. Faça login novamente.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_user_id AND invite_validated = TRUE) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuário já validado.');
    END IF;

    IF p_fingerprint IS NOT NULL AND EXISTS (SELECT 1 FROM public.blocked_devices WHERE fingerprint = p_fingerprint) THEN
        UPDATE public.profiles SET abuse_blocked = TRUE WHERE user_id = v_user_id;
        RETURN jsonb_build_object('success', false, 'message', 'Acesso bloqueado por abuso detectado.');
    END IF;

    SELECT * INTO v_invite
    FROM public.invite_codes
    WHERE code = invite_code_text
    LIMIT 1;

    IF v_invite.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou já utilizado.');
    END IF;

    IF v_invite.active IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'Este código está desativado.');
    END IF;

    IF v_invite.redeem_until IS NOT NULL AND v_invite.redeem_until < now() THEN
        RETURN jsonb_build_object('success', false, 'message', 'O prazo de resgate deste código expirou.');
    END IF;

    IF v_invite.uses >= GREATEST(COALESCE(v_invite.max_uses, 1), 1) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou já utilizado.');
    END IF;

    IF p_fingerprint IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.device_logs
        WHERE user_id = v_invite.owner_id
          AND (fingerprint = p_fingerprint OR (ip_address = p_ip_address AND p_ip_address IS NOT NULL))
    ) AND NOT public.has_role(v_invite.owner_id, 'admin'::public.app_role) THEN
        is_abusive := TRUE;
    END IF;

    IF is_abusive THEN
        UPDATE public.profiles SET abuse_blocked = TRUE WHERE user_id IN (v_user_id, v_invite.owner_id);
        IF p_fingerprint IS NOT NULL THEN
            INSERT INTO public.blocked_devices (fingerprint, ip_address, reason)
            VALUES (p_fingerprint, p_ip_address, 'Autoconvite detectado')
            ON CONFLICT (fingerprint) DO NOTHING;
        END IF;
        RETURN jsonb_build_object('success', false, 'message', 'Abuso detectado: autoconvite é estritamente proibido.');
    END IF;

    UPDATE public.invite_codes
    SET uses = uses + 1,
        used_by = COALESCE(used_by, v_user_id),
        used_at = COALESCE(used_at, now()),
        is_used = (uses + 1) >= GREATEST(COALESCE(max_uses, 1), 1)
    WHERE id = v_invite.id;

    UPDATE public.profiles SET invite_validated = TRUE WHERE user_id = v_user_id;

    IF v_invite.grants_access_until IS NOT NULL THEN
        SELECT email INTO v_email FROM public.profiles WHERE user_id = v_user_id;
        INSERT INTO public.subscribers (user_id, email, access_until, access_source, subscription_status)
        VALUES (v_user_id, COALESCE(v_email, ''), v_invite.grants_access_until, 'invite', 'active')
        ON CONFLICT (user_id) DO UPDATE
          SET access_until = GREATEST(COALESCE(public.subscribers.access_until, v_invite.grants_access_until), v_invite.grants_access_until),
              access_source = CASE WHEN public.subscribers.access_source = 'subscription' THEN 'subscription' ELSE 'invite' END,
              subscription_status = CASE WHEN public.subscribers.subscription_status = 'active' THEN 'active' ELSE 'active' END,
              updated_at = now();
    END IF;

    IF p_fingerprint IS NOT NULL THEN
        INSERT INTO public.device_logs (user_id, fingerprint, ip_address)
        VALUES (v_user_id, p_fingerprint, p_ip_address);
    END IF;

    FOR i IN 1..3 LOOP
        LOOP
            new_code := public.generate_unique_invite_code();
            BEGIN
                INSERT INTO public.invite_codes (code, owner_id, description, max_uses, uses, active, is_used)
                VALUES (new_code, v_user_id, 'Convite de indicação', 1, 0, true, false);
                EXIT;
            EXCEPTION WHEN unique_violation THEN
                NULL;
            END;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'message', 'Convite validado com sucesso! Bem-vindo ao Club.');
END;
$$;

REVOKE ALL ON FUNCTION public.admin_metrics() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_invites() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_create_invites(integer, text, integer, timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_invite_active(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_users(text, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_access_until(uuid, timestamptz, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_role(uuid, public.app_role, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_link_unmatched_sale(uuid, uuid, timestamptz) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_invites() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_invites(integer, text, integer, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_invite_active(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_access_until(uuid, timestamptz, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, public.app_role, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_link_unmatched_sale(uuid, uuid, timestamptz) TO authenticated;