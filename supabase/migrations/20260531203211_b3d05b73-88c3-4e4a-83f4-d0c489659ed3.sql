CREATE OR REPLACE FUNCTION public.spend_cash(p_user uuid, p_amount bigint, p_product uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_profile_id UUID;
    v_balance BIGINT;
    v_product_name TEXT;
    v_product_kind TEXT;
BEGIN
    -- Validação de segurança: apenas o próprio usuário pode realizar o débito
    IF auth.uid() IS NULL OR auth.uid() <> p_user THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- Busca o ID interno do perfil e o saldo atual
    SELECT id, cash_balance INTO v_profile_id, v_balance 
    FROM public.profiles 
    WHERE user_id = p_user;
    
    IF v_profile_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Verifica se há saldo suficiente
    IF v_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance', 'missing', p_amount - v_balance);
    END IF;
    
    -- Busca informações do produto
    SELECT name, kind INTO v_product_name, v_product_kind FROM public.site_products WHERE id = p_product;
    
    IF v_product_name IS NULL THEN
        SELECT title INTO v_product_name FROM public.content_items WHERE id = p_product;
        v_product_kind := 'content';
    END IF;

    -- Realiza o débito no perfil
    UPDATE public.profiles
    SET cash_balance = cash_balance - p_amount
    WHERE id = v_profile_id;
    
    -- Registra a transação (FK aponta para public.profiles.id)
    INSERT INTO public.transactions (user_id, type, amount, reason, status, product_id)
    VALUES (v_profile_id, 'debit', p_amount, 'purchase', 'completed', p_product);

    -- Entrega do produto (FK aponta para auth.users.id)
    IF v_product_name IS NOT NULL THEN
        INSERT INTO public.purchased_accounts (user_id, account_type, status, credentials)
        VALUES (
            p_user, -- p_user é o UUID de auth.users
            v_product_name, 
            'active', 
            jsonb_build_object('info', 'Comprado com Cash via Convert Club.', 'method', 'cash')
        );
    END IF;
    
    RETURN jsonb_build_object('success', true, 'balance', v_balance - p_amount);
END;
$function$;
