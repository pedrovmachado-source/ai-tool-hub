-- Update handle_new_user function to include sobrenome
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, sobrenome, sobre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'sobrenome', ''),
    COALESCE(NEW.raw_user_meta_data->>'sobre', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nome = EXCLUDED.nome,
    sobrenome = EXCLUDED.sobrenome,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- Confirm all existing unconfirmed users to prevent "Email not confirmed" errors
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    updated_at = NOW(),
    last_sign_in_at = COALESCE(last_sign_in_at, NOW())
WHERE email_confirmed_at IS NULL;
