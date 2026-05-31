-- Add cash_balance to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cash_balance BIGINT DEFAULT 0;

-- Add price_cash to site_products
ALTER TABLE public.site_products ADD COLUMN IF NOT EXISTS price_cash INTEGER;

-- Create cash_packages table
CREATE TABLE IF NOT EXISTS public.cash_packages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    base_cash INTEGER NOT NULL,
    price_brl_cents INTEGER NOT NULL,
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Use GRANT to set permissions for cash_packages
GRANT SELECT ON public.cash_packages TO anon, authenticated;
GRANT ALL ON public.cash_packages TO service_role;

-- Enable RLS for cash_packages
ALTER TABLE public.cash_packages ENABLE ROW LEVEL SECURITY;

-- Create policy for reading cash_packages
CREATE POLICY "Cash packages are viewable by everyone" 
ON public.cash_packages 
FOR SELECT 
USING (active = true);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('deposit', 'pix_bonus', 'purchase', 'refund')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    stripe_session_id TEXT,
    stripe_event_id TEXT UNIQUE,
    product_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Use GRANT to set permissions for transactions
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to increment cash balance (security definer)
CREATE OR REPLACE FUNCTION public.increment_cash_balance(p_user UUID, p_amount BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET cash_balance = cash_balance + p_amount
    WHERE id = p_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to spend cash (security definer)
CREATE OR REPLACE FUNCTION public.spend_cash(p_user UUID, p_amount INTEGER, p_product UUID)
RETURNS JSONB AS $$
DECLARE
    v_balance BIGINT;
    v_result JSONB;
BEGIN
    -- Check balance
    SELECT cash_balance INTO v_balance FROM public.profiles WHERE id = p_user;
    
    IF v_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    IF v_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance', 'missing', p_amount - v_balance);
    END IF;
    
    -- Debit balance
    UPDATE public.profiles
    SET cash_balance = cash_balance - p_amount
    WHERE id = p_user;
    
    -- Record transaction
    INSERT INTO public.transactions (user_id, type, amount, reason, status, product_id)
    VALUES (p_user, 'debit', p_amount, 'purchase', 'completed', p_product);
    
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Populate initial cash packages
INSERT INTO public.cash_packages (name, base_cash, price_brl_cents, is_popular, sort_order)
VALUES 
    ('Iniciante', 500, 4900, false, 1),
    ('Essencial', 1000, 8900, false, 2),
    ('Avançado ⭐', 2800, 22900, true, 3),
    ('Pro', 5000, 38900, false, 4),
    ('Elite', 13500, 99000, false, 5)
ON CONFLICT DO NOTHING;
