ALTER TABLE public.user_offers
  ADD COLUMN IF NOT EXISTS rejected boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_by uuid;

ALTER TABLE public.user_offers
  ADD CONSTRAINT user_offers_not_approved_and_rejected
  CHECK (NOT (approved AND rejected));

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
    NEW.rejected := OLD.rejected;
    NEW.rejected_at := OLD.rejected_at;
    NEW.rejected_by := OLD.rejected_by;
    NEW.is_definitive := OLD.is_definitive;
  END IF;
  RETURN NEW;
END;
$$;