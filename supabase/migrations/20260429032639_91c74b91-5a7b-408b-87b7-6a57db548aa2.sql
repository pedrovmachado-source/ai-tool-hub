-- Ensure the guard trigger is actually attached to profiles
DROP TRIGGER IF EXISTS guard_plano_update_trg ON public.profiles;
CREATE TRIGGER guard_plano_update_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_plano_update();

-- Replace the user self-update policy: restrict to authenticated role
-- and explicitly forbid changing the plano field (defense in depth alongside the trigger)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND plano IS NOT DISTINCT FROM (
      SELECT p.plano FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  );
