CREATE TABLE public.purchased_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL,
  account_data JSONB DEFAULT '{}'::jsonb,
  credentials JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.purchased_accounts TO authenticated;
GRANT ALL ON public.purchased_accounts TO service_role;

ALTER TABLE public.purchased_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchased accounts" 
ON public.purchased_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE TRIGGER update_purchased_accounts_updated_at
BEFORE UPDATE ON public.purchased_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();