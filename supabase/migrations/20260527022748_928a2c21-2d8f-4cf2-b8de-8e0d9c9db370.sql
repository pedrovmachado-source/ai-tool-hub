-- Create the validated_offers table
CREATE TABLE IF NOT EXISTS public.validated_offers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    link TEXT NOT NULL,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.validated_offers ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.validated_offers TO anon;
GRANT SELECT ON public.validated_offers TO authenticated;
GRANT ALL ON public.validated_offers TO service_role;

-- Policies
-- Everyone can view
CREATE POLICY "Validated offers are viewable by everyone" 
ON public.validated_offers 
FOR SELECT 
USING (true);

-- Admins can manage everything
CREATE POLICY "Admins can manage validated offers" 
ON public.validated_offers 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Trigger for updated_at (assuming function exists from previous setup)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_validated_offers_updated_at
        BEFORE UPDATE ON public.validated_offers
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;