
-- allow server-side (service role / triggers, no auth.uid()) plan syncing
CREATE OR REPLACE FUNCTION public.guard_plano_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plano IS DISTINCT FROM OLD.plano THEN
    IF auth.uid() IS NOT NULL AND NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
      NEW.plano := OLD.plano;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- keep profiles.plano in sync with subscription status
CREATE OR REPLACE FUNCTION public.sync_plano_from_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active boolean;
BEGIN
  v_active := NEW.access_until IS NOT NULL AND NEW.access_until > now();

  IF v_active THEN
    UPDATE public.profiles
      SET plano = 'Elite', updated_at = now()
      WHERE user_id = NEW.user_id AND plano NOT IN ('Elite', 'Elite Plus', 'Max');

    INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.user_id, 'member'::public.app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    UPDATE public.profiles
      SET plano = 'Free', updated_at = now()
      WHERE user_id = NEW.user_id AND plano = 'Elite';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_plano_from_subscription ON public.subscribers;
CREATE TRIGGER trg_sync_plano_from_subscription
AFTER INSERT OR UPDATE OF access_until, subscription_status ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION public.sync_plano_from_subscription();

-- backfill current active subscribers
UPDATE public.profiles p
SET plano = 'Elite', updated_at = now()
FROM public.subscribers s
WHERE s.user_id = p.user_id
  AND s.access_until > now()
  AND p.plano NOT IN ('Elite', 'Elite Plus', 'Max');

INSERT INTO public.user_roles (user_id, role)
SELECT s.user_id, 'member'::public.app_role
FROM public.subscribers s
WHERE s.access_until > now()
ON CONFLICT (user_id, role) DO NOTHING;
