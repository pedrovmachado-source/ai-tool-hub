-- 1. Fix search_path and permissions for sensitive functions
-- spend_cash: Ensure only the user themselves can spend their cash
CREATE OR REPLACE FUNCTION public.spend_cash(p_user uuid, p_amount integer, p_product uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    v_balance BIGINT;
    v_product_name TEXT;
    v_product_kind TEXT;
BEGIN
    -- Security check: only the user themselves can call this, or a service role
    IF auth.uid() IS NOT NULL AND auth.uid() <> p_user THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- Check balance
    SELECT cash_balance INTO v_balance FROM public.profiles WHERE id = p_user;
    
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
    WHERE id = p_user;
    
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

-- increment_cash_balance: Should ONLY be callable by service_role (webhooks/admin)
CREATE OR REPLACE FUNCTION public.increment_cash_balance(p_user uuid, p_amount bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    -- This function is dangerous if public. We revoke its public execute right below.
    UPDATE public.profiles
    SET cash_balance = cash_balance + p_amount
    WHERE id = p_user;
END;
$function$;

-- get_user_emails: Already has check but fix search_path
CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, auth
AS $function$
DECLARE
    result jsonb;
    current_user_id uuid;
    is_admin boolean;
BEGIN
    current_user_id := auth.uid();
    
    -- Check if requester is admin
    SELECT (role = 'admin') INTO is_admin FROM public.profiles WHERE id = current_user_id;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT jsonb_agg(jsonb_build_object('id', id, 'email', email))
    INTO result
    FROM auth.users
    WHERE id = ANY(user_ids);

    RETURN COALESCE(result, '[]'::jsonb);
END;
$function$;

-- Generic utility functions: set search_path
ALTER FUNCTION public.touch_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.generate_unique_invite_code() SET search_path = public;

-- Revoke public execution on sensitive functions
REVOKE EXECUTE ON FUNCTION public.increment_cash_balance(uuid, bigint) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_cash_balance(uuid, bigint) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_cash_balance(uuid, bigint) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_cash_balance(uuid, bigint) TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_user_emails(uuid[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_emails(uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO service_role;

-- 2. Storage Listing Restriction
-- To prevent enumeration while keeping public read, we can keep the policy but it's often better to just accept the listing warning if listing is desired.
-- However, for senior security, we should ideally restrict it.
-- But standard public avatars usually allow listing by bucket. 
-- I'll keep them as is for now as fixing them might break UI parts that rely on public access without specific IDs, 
-- but I'll focus on the DB functions which are much more critical.

-- Ensure RLS is enabled on ALL tables (it seems to be, but let's be sure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validated_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niche_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niche_lessons ENABLE ROW LEVEL SECURITY;
