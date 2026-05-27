ALTER TABLE public.offer_analyses 
ADD CONSTRAINT offer_analyses_user_id_fkey_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;