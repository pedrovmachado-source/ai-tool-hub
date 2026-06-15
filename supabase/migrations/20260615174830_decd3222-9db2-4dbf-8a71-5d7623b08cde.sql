DROP POLICY IF EXISTS "Max, Elite Plus, Elite Vitalício and admins can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Max users and admins can view modules" ON public.modules;

CREATE POLICY "Authenticated users can view lessons"
ON public.lessons FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view modules"
ON public.modules FOR SELECT TO authenticated USING (true);