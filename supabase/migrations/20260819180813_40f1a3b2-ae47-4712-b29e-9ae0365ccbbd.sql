
CREATE TABLE IF NOT EXISTS public.kirvano_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id text,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS kirvano_events_sale_event_uniq ON public.kirvano_events (sale_id, event) WHERE sale_id IS NOT NULL;
GRANT ALL ON public.kirvano_events TO service_role;
GRANT SELECT ON public.kirvano_events TO authenticated;
ALTER TABLE public.kirvano_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read kirvano events" ON public.kirvano_events;
CREATE POLICY "Admins can read kirvano events" ON public.kirvano_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.unmatched_sales (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id text,
  event text,
  email text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved boolean NOT NULL DEFAULT false,
  received_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.unmatched_sales TO service_role;
GRANT SELECT, UPDATE ON public.unmatched_sales TO authenticated;
ALTER TABLE public.unmatched_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read unmatched sales" ON public.unmatched_sales;
CREATE POLICY "Admins can read unmatched sales" ON public.unmatched_sales FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can update unmatched sales" ON public.unmatched_sales;
CREATE POLICY "Admins can update unmatched sales" ON public.unmatched_sales FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.access_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_email text NOT NULL,
  purchase_email text NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.access_claims TO authenticated;
GRANT ALL ON public.access_claims TO service_role;
ALTER TABLE public.access_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create their own claims" ON public.access_claims;
CREATE POLICY "Users can create their own claims" ON public.access_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can read their own claims" ON public.access_claims;
CREATE POLICY "Users can read their own claims" ON public.access_claims FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can update claims" ON public.access_claims;
CREATE POLICY "Admins can update claims" ON public.access_claims FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.site_settings (key, value)
VALUES ('kirvano_checkout_url', '{"url": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
