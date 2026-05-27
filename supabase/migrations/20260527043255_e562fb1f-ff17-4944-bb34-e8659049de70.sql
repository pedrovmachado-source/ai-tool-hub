CREATE POLICY "Anyone can view approved analyses for ranking" 
ON public.offer_analyses 
FOR SELECT 
USING (status = 'approved');