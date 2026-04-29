-- Replace INSERT policy on profiles to prevent users from creating themselves with plano='Pro'
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND plano = 'Free'
  );