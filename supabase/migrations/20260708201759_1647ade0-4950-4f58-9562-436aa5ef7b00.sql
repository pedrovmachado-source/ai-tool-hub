DROP POLICY IF EXISTS "Public UI settings are readable by anyone" ON public.site_settings;
CREATE POLICY "Public UI settings are readable by anyone"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (key = ANY (ARRAY['nav_menu_items'::text, 'plans_config'::text, 'pro_plan'::text, 'site_creation_banner'::text, 'max_subscribe_url'::text, 'dashboard_banner'::text]));