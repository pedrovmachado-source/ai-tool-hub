
CREATE TABLE public.user_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  link_bib text NOT NULL DEFAULT '',
  link_drive text NOT NULL DEFAULT '',
  link_site text NOT NULL DEFAULT '',
  link_checkout text NOT NULL DEFAULT '',
  copy_texto text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_offers TO authenticated;
GRANT ALL ON public.user_offers TO service_role;

ALTER TABLE public.user_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own offers"
  ON public.user_offers FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all offers"
  ON public.user_offers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX user_offers_user_id_idx ON public.user_offers(user_id);
CREATE INDEX user_offers_created_at_idx ON public.user_offers(created_at DESC);

CREATE TRIGGER user_offers_updated_at
  BEFORE UPDATE ON public.user_offers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
