## Objetivo

Resolver as 4 falhas de segurança detectadas (incluindo "Public Can Execute SECURITY DEFINER Function") **sem bloquear o acesso público** a categorias e ferramentas públicas, e sem quebrar nada para usuários Free.

## Diagnóstico

Há 3 funções `SECURITY DEFINER` no schema `public` expostas via PostgREST:

| Função | Uso atual | Deve ser pública? |
|---|---|---|
| `list_categories_public()` | Catálogo público (home) | Sim — manter |
| `list_tools_public()` | Catálogo público (home) | Sim — manter |
| `has_role(uuid, app_role)` | Helper interno de RLS | **Não** — revogar |
| `get_tool_premium(text)` | Detalhes Pro de uma tool | Apenas autenticados Pro/admin |

A última migração (`20260429015936`) reabriu `has_role` para `anon` e `authenticated`, permitindo que qualquer um descubra quem é admin chamando a RPC. Isso também é a origem do alerta do linter Supabase.

Além disso, o scan revelou duas brechas críticas relacionadas:
1. **Escalada de plano**: política UPDATE em `profiles` permite usuário Free setar `plano = 'Pro'` sozinho.
2. **Escalada de privilégio**: `user_roles` não tem política INSERT/DELETE restritiva — qualquer autenticado pode se tornar admin.

Já existe um trigger `guard_plano_update` no código mas **não está anexado** à tabela `profiles` (a seção `db-triggers` está vazia). Vamos garantir que ele exista.

## Plano de correção (1 migração SQL)

### 1. Revogar `has_role` do acesso público
```sql
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  FROM PUBLIC, anon, authenticated;
```
RLS continua funcionando: políticas e triggers que chamam `has_role` rodam em contexto `SECURITY DEFINER` próprio e não dependem do GRANT externo.

### 2. Bloquear escalada de plano em `profiles`
Substituir a política UPDATE por uma versão com `WITH CHECK` que impede mudança de `plano` por não-admin, e (re)criar o trigger `guard_plano_update` como cinto-e-suspensório:
```sql
DROP POLICY "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND plano = (SELECT plano FROM public.profiles WHERE user_id = auth.uid())
  );

DROP TRIGGER IF EXISTS guard_plano_update_trg ON public.profiles;
CREATE TRIGGER guard_plano_update_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_plano_update();
```
Admin continua podendo alterar plano via política "Admins can update any profile".

### 3. Bloquear auto-promoção em `user_roles`
Adicionar políticas explícitas de INSERT/UPDATE/DELETE restritas a admin (a política `ALL` para admins já existe, mas a ausência de política específica para INSERT em `authenticated` deixa brecha — vamos formalizar negação):
```sql
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
```

### 4. Confirmar grants das RPCs públicas legítimas
```sql
GRANT EXECUTE ON FUNCTION public.list_categories_public() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_tools_public() TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_tool_premium(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_tool_premium(text) TO authenticated;
```

## Impacto para usuários

- **Visitantes (anon)**: continuam vendo o catálogo público (Home, lista de ferramentas/categorias) — `list_*_public` permanecem abertas.
- **Free autenticados**: sem mudança visível; não conseguem mais (corretamente) se promover a Pro/admin via API.
- **Pro**: sem mudança.
- **Admin (`pedruu1236@hotmail.com`)**: sem mudança — política admin cobre tudo; `has_role` continua chamável internamente pelas policies.

## Pós-deploy

- Rodar o linter Supabase para confirmar que os 4 findings sumiram.
- Marcar findings como `mark_as_fixed` no scanner.
