ALTER TABLE public.user_offers
  ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS is_definitive boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS user_offers_one_definitive_per_user
  ON public.user_offers (user_id) WHERE is_definitive;

CREATE OR REPLACE FUNCTION public.guard_user_offer_flags()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    NEW.approved := OLD.approved;
    NEW.approved_at := OLD.approved_at;
    NEW.approved_by := OLD.approved_by;
    NEW.is_definitive := OLD.is_definitive;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_user_offer_flags_trg ON public.user_offers;
CREATE TRIGGER guard_user_offer_flags_trg
  BEFORE UPDATE ON public.user_offers
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_offer_flags();

DROP POLICY IF EXISTS "Admins can update user offers" ON public.user_offers;
CREATE POLICY "Admins can update user offers"
  ON public.user_offers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));