REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.guard_student_area_student_update() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.guard_user_offer_flags() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;