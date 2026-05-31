-- Remove duplicatas para evitar ambiguidade
DROP FUNCTION IF EXISTS public.spend_cash(p_user uuid, p_amount bigint, p_product uuid);
DROP FUNCTION IF EXISTS public.spend_cash(p_user uuid, p_amount integer, p_product uuid);

-- Cria a versão unificada
CREATE OR REPLACE FUNCTION public.spend_cash(p_user uuid, p_amount bigint, p_product uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_balance BIGINT;
    v_product_name TEXT;
    v_product_kind TEXT;
BEGIN
    -- Validação de segurança: apenas o próprio usuário pode realizar o débito
    IF auth.uid() IS NULL OR auth.uid() <> p_user THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- Busca o saldo atual
    SELECT cash_balance INTO v_balance FROM public.profiles WHERE user_id = p_user;
    
    IF v_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Verifica se há saldo suficiente
    IF v_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance', 'missing', p_amount - v_balance);
    END IF;
    
    -- Busca informações do produto (pode estar em site_products ou content_items)
    SELECT name, kind INTO v_product_name, v_product_kind FROM public.site_products WHERE id = p_product;
    
    IF v_product_name IS NULL THEN
        SELECT title INTO v_product_name FROM public.content_items WHERE id = p_product;
        v_product_kind := 'content';
    END IF;

    -- Realiza o débito
    UPDATE public.profiles
    SET cash_balance = cash_balance - p_amount
    WHERE user_id = p_user;
    
    -- Registra a transação
    INSERT INTO public.transactions (user_id, type, amount, reason, status, product_id)
    VALUES (p_user, 'debit', p_amount, 'purchase', 'completed', p_product);

    -- Entrega do produto (liberação nas contas compradas)
    IF v_product_name IS NOT NULL THEN
        INSERT INTO public.purchased_accounts (user_id, account_type, status, credentials)
        VALUES (
            p_user, 
            v_product_name, 
            'active', 
            jsonb_build_object('info', 'Comprado com Cash via Convert Club.', 'method', 'cash')
        );
    END IF;
    
    RETURN jsonb_build_object('success', true, 'balance', v_balance - p_amount);
END;
$function$;

-- Garante as permissões
GRANT EXECUTE ON FUNCTION public.spend_cash(p_user uuid, p_amount bigint, p_product uuid) TO authenticated;
GRANT ALL ON FUNCTION public.spend_cash(p_user uuid, p_amount bigint, p_product uuid) TO service_role;
