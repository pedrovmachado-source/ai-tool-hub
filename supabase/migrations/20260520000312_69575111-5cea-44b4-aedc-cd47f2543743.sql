
-- 1. Restrict lesson PDFs to Max plan and admins only
DROP POLICY IF EXISTS "Pro and admins can read lesson pdfs" ON storage.objects;
CREATE POLICY "Max and admins can read lesson pdfs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-pdfs'
  AND (
    private.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND plano = 'Max'
    )
  )
);

-- 2. Prevent actor_email spoofing in activity_logs by attaching server-side trigger
DROP TRIGGER IF EXISTS set_activity_log_actor_email_trg ON public.activity_logs;
CREATE TRIGGER set_activity_log_actor_email_trg
BEFORE INSERT ON public.activity_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_activity_log_actor_email();
