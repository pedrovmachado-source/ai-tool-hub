CREATE OR REPLACE FUNCTION public.spend_cash(p_user UUID, p_amount INTEGER, p_product UUID)
RETURNS JSONB AS $$
DECLARE
    v_balance BIGINT;
    v_product_name TEXT;
    v_product_kind TEXT;
BEGIN
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

    -- Product delivery: Record in purchased_accounts
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
