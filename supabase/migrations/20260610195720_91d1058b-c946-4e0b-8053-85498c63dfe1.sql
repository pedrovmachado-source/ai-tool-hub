DROP POLICY IF EXISTS "Max and admins can read lesson pdfs" ON storage.objects;

CREATE POLICY "Max and admins can read lesson pdfs" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'lesson-pdfs' AND (
    private.has_role(auth.uid(), 'admin'::app_role) OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.plano = 'Max' OR profiles.plano = 'Elite Plus' OR profiles.plano = 'Elite Vitalício')
    )
  )
);