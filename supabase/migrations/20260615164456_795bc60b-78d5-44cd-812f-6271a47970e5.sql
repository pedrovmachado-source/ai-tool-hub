
CREATE TABLE IF NOT EXISTS public.pix_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  payer_note text,
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.pix_deposits TO authenticated;
GRANT ALL ON public.pix_deposits TO service_role;

ALTER TABLE public.pix_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own or admin all" ON public.pix_deposits
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users insert own pending" ON public.pix_deposits
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins update" ON public.pix_deposits
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS pix_deposits_status_idx ON public.pix_deposits(status, created_at DESC);
CREATE INDEX IF NOT EXISTS pix_deposits_user_idx ON public.pix_deposits(user_id, created_at DESC);

-- Approve / reject (security definer, credits balance on approve)
CREATE OR REPLACE FUNCTION public.review_pix_deposit(p_deposit_id uuid, p_approve boolean, p_note text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dep public.pix_deposits;
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT * INTO v_dep FROM public.pix_deposits WHERE id = p_deposit_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not found');
  END IF;
  IF v_dep.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already reviewed');
  END IF;

  IF p_approve THEN
    UPDATE public.profiles
      SET cash_balance = COALESCE(cash_balance, 0) + v_dep.amount_cents
      WHERE user_id = v_dep.user_id;
    UPDATE public.pix_deposits
      SET status='approved', reviewed_by=auth.uid(), reviewed_at=now(), admin_note=p_note
      WHERE id = p_deposit_id;
  ELSE
    UPDATE public.pix_deposits
      SET status='rejected', reviewed_by=auth.uid(), reviewed_at=now(), admin_note=p_note
      WHERE id = p_deposit_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.review_pix_deposit(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_pix_deposit(uuid, boolean, text) TO authenticated, service_role;

-- Admin listing with user info
CREATE OR REPLACE FUNCTION public.list_pix_deposits_admin(p_status text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  amount_cents bigint,
  status text,
  payer_note text,
  admin_note text,
  created_at timestamptz,
  reviewed_at timestamptz,
  user_nome text,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
  SELECT d.id, d.user_id, d.amount_cents, d.status, d.payer_note, d.admin_note,
         d.created_at, d.reviewed_at,
         COALESCE(p.nome, '') AS user_nome,
         COALESCE(p.email, '') AS user_email
  FROM public.pix_deposits d
  LEFT JOIN public.profiles p ON p.user_id = d.user_id
  WHERE p_status IS NULL OR d.status = p_status
  ORDER BY d.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.list_pix_deposits_admin(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_pix_deposits_admin(text) TO authenticated, service_role;
