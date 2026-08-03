CREATE OR REPLACE FUNCTION public.guard_student_area_student_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_owner FROM public.profiles WHERE id = OLD.user_id;
  IF v_owner IS NULL OR v_owner <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  NEW.user_id := OLD.user_id;
  NEW.content := (COALESCE(OLD.content, '{}'::jsonb))
    || jsonb_build_object('completed_ids', COALESCE(NEW.content->'completed_ids', OLD.content->'completed_ids', '[]'::jsonb))
    || jsonb_build_object('tasks_done', COALESCE(NEW.content->'tasks_done', OLD.content->'tasks_done', '[]'::jsonb));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_student_area_student_update_trg ON public.student_areas;
CREATE TRIGGER guard_student_area_student_update_trg
BEFORE UPDATE ON public.student_areas
FOR EACH ROW EXECUTE FUNCTION public.guard_student_area_student_update();

DROP POLICY IF EXISTS "Users can update their own progress" ON public.student_areas;
CREATE POLICY "Users can update their own progress"
ON public.student_areas
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = student_areas.user_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = student_areas.user_id AND p.user_id = auth.uid()));