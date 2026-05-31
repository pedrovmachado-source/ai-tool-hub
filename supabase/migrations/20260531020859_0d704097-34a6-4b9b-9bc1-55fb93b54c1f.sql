-- Create a table for purchases
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'completed',
  amount_total INTEGER,
  currency TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant permissions
GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;

-- Enable Row Level Security
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own purchases" 
ON public.purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);

-- Create function to update timestamps
CREATE TRIGGER update_purchases_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();