DROP POLICY IF EXISTS "Max users and admins can view lessons" ON public.lessons;

CREATE POLICY "Max, Elite Plus, Elite Vitalício and admins can view lessons" ON public.lessons
FOR SELECT
TO authenticated
USING (
  private.has_role(auth.uid(), 'admin'::app_role) 
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (profiles.plano = 'Max' OR profiles.plano = 'Elite Plus' OR profiles.plano = 'Elite Vitalício')
  )
);