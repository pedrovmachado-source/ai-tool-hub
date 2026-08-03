DROP POLICY IF EXISTS "Users can view their own student area" ON public.student_areas;

CREATE POLICY "Users can view their own student area"
ON public.student_areas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = student_areas.user_id
      AND p.user_id = auth.uid()
  )
);