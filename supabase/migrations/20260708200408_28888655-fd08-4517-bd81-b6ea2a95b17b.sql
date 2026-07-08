DROP POLICY IF EXISTS "Authorized plans can view modules" ON public.modules;
DROP POLICY IF EXISTS "Authorized plans can view lessons" ON public.lessons;

CREATE POLICY "Authenticated can view modules"
ON public.modules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can view lessons"
ON public.lessons FOR SELECT
TO authenticated
USING (true);