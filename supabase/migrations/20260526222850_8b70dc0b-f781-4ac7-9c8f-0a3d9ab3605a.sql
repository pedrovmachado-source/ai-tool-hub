ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sobrenome TEXT,
ADD COLUMN IF NOT EXISTS lgpd_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lgpd_accepted_at TIMESTAMP WITH TIME ZONE;

-- No need for extra RLS as existing profile policies should cover these new columns.
