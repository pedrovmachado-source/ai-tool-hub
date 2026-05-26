-- Create student_areas table
CREATE TABLE IF NOT EXISTS public.student_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  content JSONB NOT NULL DEFAULT '{"lessons": []}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_areas TO authenticated;
GRANT ALL ON public.student_areas TO service_role;

-- Enable RLS
ALTER TABLE public.student_areas ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own student area
CREATE POLICY "Users can view their own student area" 
ON public.student_areas 
FOR SELECT 
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = student_areas.user_id));

-- Policy for admins to manage all student areas
CREATE POLICY "Admins can manage all student areas"
ON public.student_areas
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_areas_updated_at
    BEFORE UPDATE ON public.student_areas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
