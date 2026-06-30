
-- 1) Fix lesson-pdfs storage policy
DROP POLICY IF EXISTS "Authorized plans and admins can read lesson pdfs" ON storage.objects;

CREATE POLICY "Authorized plans and admins can read lesson pdfs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-pdfs'
  AND (
    private.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.plano IN ('Max', 'Elite Plus', 'Elite Vitalício', 'Mentorado')
    )
  )
);

-- 2) Tighten profiles UPDATE policy: forbid users changing their own plan via RLS
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND plano IS NOT DISTINCT FROM (SELECT plano FROM public.profiles WHERE user_id = auth.uid())
);

-- Ensure guard_plano_update trigger is attached as defense in depth
DROP TRIGGER IF EXISTS guard_plano_update_trg ON public.profiles;
CREATE TRIGGER guard_plano_update_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_plano_update();
