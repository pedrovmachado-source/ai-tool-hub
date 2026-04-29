-- Restore public (anonymous) access to catalog listing functions
GRANT EXECUTE ON FUNCTION public.list_categories_public() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_tools_public() TO anon, authenticated;