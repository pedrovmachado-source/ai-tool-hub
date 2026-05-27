CREATE TABLE public.offer_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_library_url TEXT NOT NULL,
  website_url TEXT NOT NULL,
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offer_analyses TO authenticated;
GRANT ALL ON public.offer_analyses TO service_role;

-- Enable RLS
ALTER TABLE public.offer_analyses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create their own analyses"
ON public.offer_analyses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analyses"
ON public.offer_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')));

CREATE POLICY "Admins can update analyses"
ON public.offer_analyses
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Create trigger for updated_at
-- Assuming update_updated_at_column() already exists in public schema
CREATE TRIGGER update_offer_analyses_updated_at
BEFORE UPDATE ON public.offer_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();