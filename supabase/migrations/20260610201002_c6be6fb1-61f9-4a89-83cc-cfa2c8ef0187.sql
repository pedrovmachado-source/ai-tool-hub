-- Atualizar política das aulas (lessons)
DROP POLICY IF EXISTS "Max, Elite Plus, Elite Vitalício and admins can view lessons" ON public.lessons;

CREATE POLICY "Max, Elite Plus, Elite Vitalício and admins can view lessons" ON public.lessons
FOR SELECT
TO authenticated
USING (
  private.has_role(auth.uid(), 'admin'::app_role) 
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE (profiles.user_id = auth.uid() OR profiles.id = auth.uid())
    AND (profiles.plano = 'Max' OR profiles.plano = 'Elite Plus' OR profiles.plano = 'Elite Vitalício')
  )
);

-- Atualizar política dos objetos (PDFs)
DROP POLICY IF EXISTS "Max, Elite Plus and Elite Vitalício can read lesson pdfs" ON storage.objects;

CREATE POLICY "Max, Elite Plus and Elite Vitalício can read lesson pdfs" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-pdfs' AND (
    private.has_role(auth.uid(), 'admin'::app_role) OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE (profiles.user_id = auth.uid() OR profiles.id = auth.uid())
      AND (profiles.plano = 'Max' OR profiles.plano = 'Elite Plus' OR profiles.plano = 'Elite Vitalício')
    )
  )
);