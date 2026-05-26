-- Add avatar_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile_images', 'profile_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile images
-- Everyone can view profile images
CREATE POLICY "Profile images are public" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile_images');

-- Users can upload their own profile image
CREATE POLICY "Users can upload their own profile image" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'profile_images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can update their own profile image
CREATE POLICY "Users can update their own profile image" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'profile_images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can delete their own profile image
CREATE POLICY "Users can delete their own profile image" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'profile_images' AND (storage.foldername(name))[1] = auth.uid()::text);
