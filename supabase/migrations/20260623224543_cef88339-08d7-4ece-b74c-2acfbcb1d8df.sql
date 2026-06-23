
-- 1. Activity logs: prevent actor_email spoofing by attaching server-side trigger
DROP TRIGGER IF EXISTS set_activity_log_actor_email_trg ON public.activity_logs;
CREATE TRIGGER set_activity_log_actor_email_trg
  BEFORE INSERT ON public.activity_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_activity_log_actor_email();

-- 2. Profiles: attach guard_plano_update trigger so non-admins cannot change plano via direct API
DROP TRIGGER IF EXISTS guard_plano_update_trg ON public.profiles;
CREATE TRIGGER guard_plano_update_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_plano_update();

-- 3. content_sections: plan-gated SELECT (mirrors content_items gating)
DROP POLICY IF EXISTS "Authenticated can read content_sections" ON public.content_sections;
CREATE POLICY "Plan-gated read content_sections"
  ON public.content_sections
  FOR SELECT
  TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin'::public.app_role)
    OR min_plan = 'Free'
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND (
          (min_plan = ANY (ARRAY['Elite','Pro']) AND p.plano = ANY (ARRAY['Elite','Elite Plus','Max','Mentorado','Pro']))
          OR (min_plan = 'Max' AND p.plano = ANY (ARRAY['Max','Mentorado','Elite Plus','Elite Vitalício']))
        )
    )
  );

-- 4 & 5. lessons + modules: align SELECT with lesson-pdfs storage tier (Max / Elite Plus / Elite Vitalício)
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.lessons;
CREATE POLICY "Authorized plans can view lessons"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.plano = ANY (ARRAY['Max','Elite Plus','Elite Vitalício','Mentorado'])
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view modules" ON public.modules;
CREATE POLICY "Authorized plans can view modules"
  ON public.modules
  FOR SELECT
  TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.plano = ANY (ARRAY['Max','Elite Plus','Elite Vitalício','Mentorado'])
    )
  );
