-- 1. Hardening spend_cash function
CREATE OR REPLACE FUNCTION public.spend_cash(p_user uuid, p_amount bigint, p_product uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_balance BIGINT;
    v_product_name TEXT;
    v_product_kind TEXT;
BEGIN
    -- Security check: strictly require authentication and match user id
    IF auth.uid() IS NULL OR auth.uid() <> p_user THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- Check balance
    SELECT cash_balance INTO v_balance FROM public.profiles WHERE user_id = p_user;
    
    IF v_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    IF v_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance', 'missing', p_amount - v_balance);
    END IF;
    
    -- Get product info
    SELECT name, kind INTO v_product_name, v_product_kind FROM public.site_products WHERE id = p_product;
    
    IF v_product_name IS NULL THEN
        -- Check content_items if not in site_products
        SELECT title INTO v_product_name FROM public.content_items WHERE id = p_product;
        v_product_kind := 'content';
    END IF;

    -- Debit balance
    UPDATE public.profiles
    SET cash_balance = cash_balance - p_amount
    WHERE user_id = p_user;
    
    -- Record transaction
    INSERT INTO public.transactions (user_id, type, amount, reason, status, product_id)
    VALUES (p_user, 'debit', p_amount, 'purchase', 'completed', p_product);

    -- Product delivery
    IF v_product_name IS NOT NULL THEN
        INSERT INTO public.purchased_accounts (user_id, account_type, status, credentials)
        VALUES (
            p_user, 
            v_product_name, 
            'active', 
            jsonb_build_object('info', 'Comprado com Cash. Seu acesso está liberado.', 'method', 'cash')
        );
    END IF;
    
    RETURN jsonb_build_object('success', true, 'balance', v_balance - p_amount);
END;
$function$;

-- 2. Update RLS policies for tools
DROP POLICY IF EXISTS "Pro/Max users and admins can view tools" ON public.tools;
CREATE POLICY "Members and admins can view tools" ON public.tools
FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'admin') 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.plano IN ('Elite', 'Elite Plus', 'Max', 'Mentorado', 'Pro')
  )
);

-- 3. Update RLS policies for categories
DROP POLICY IF EXISTS "Pro/Max users and admins can view categories" ON public.categories;
CREATE POLICY "Members and admins can view categories" ON public.categories
FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'admin') 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.plano IN ('Elite', 'Elite Plus', 'Max', 'Mentorado', 'Pro')
  )
);

-- 4. Update RLS policies for content_items
DROP POLICY IF EXISTS "Plan-gated read content_items" ON public.content_items;
CREATE POLICY "Plan-gated read content_items" ON public.content_items
FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'admin') 
  OR EXISTS (
    SELECT 1
    FROM public.content_sections s
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE s.slug = content_items.section_slug
    AND (
      s.min_plan = 'Free'
      OR (s.min_plan IN ('Elite', 'Pro') AND p.plano IN ('Elite', 'Elite Plus', 'Max', 'Mentorado', 'Pro'))
      OR (s.min_plan = 'Max' AND p.plano IN ('Max', 'Mentorado'))
    )
  )
);

-- 5. Ensure profile security
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Storage Security (Hardening based on linter warnings)
-- These are usually in storage schema, but we can set them if needed. 
-- Since we are on Supabase, the user might need to do this via UI if I can't reach storage schema directly.
-- I'll try to revoke public select on storage objects if it exists.
DO $$ 
BEGIN
    -- Check if storage bucket Select policy is too broad
    -- This is a placeholder for where storage hardening would go.
    -- Supabase storage policies are often managed via SQL as well.
END $$;
