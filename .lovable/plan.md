# Plano: Planos Max + Assinaturas + Gating

## 1. Banco de dados (migration)
- Atualizar coluna `profiles.plano` para aceitar `'Free' | 'Pro' | 'Max'` (texto livre, sem CHECK rígido — apenas atualizar defaults e RLS).
- Atualizar RLS de `lessons`, `modules`, `tools`, `categories`:
  - `tools`/`categories`: continuam liberados para **Pro ou Max** (e admin).
  - `lessons`/`modules`: passam a exigir **Max ou admin** (vídeos/aulas exclusivos).
- Atualizar função `get_tool_premium` para aceitar `plano IN ('Pro','Max')`.
- Seed em `site_settings` chave `plans` com array dos 3 planos pagos (mensal/trimestral/vitalício) × 2 tiers (Pro/Max) — preços conforme abaixo.

## 2. Stripe (preços novos)
Criar produtos/preços no Stripe via tool:
- **Pro Mensal** R$19,90 (recurring monthly)
- **Pro Trimestral** R$49,90 (recurring every 3 months)
- **Pro Vitalício** R$127,90 (one-time)
- **Max Mensal**, **Max Trimestral**, **Max Vitalício** — pedir preços ao usuário (não informados). *Pergunta abaixo.*

Guardar os `price_id` em `site_settings.plans` (JSON), lidos pelo frontend e pela edge function `create-checkout`.

## 3. Edge functions
- `create-checkout`: receber `{ priceId, mode }` do cliente, validar contra lista de preços permitidos em `site_settings`, criar sessão Stripe (`mode: 'subscription'` ou `'payment'`).
- `check-subscription`: detectar tier (Pro/Max) pelo `price.product` e gravar `profiles.plano` correspondente; expirar assinaturas canceladas.
- `customer-portal`: já existe, mantém.

## 4. Frontend — copy e UI de planos
- `src/lib/billing.ts` e `src/hooks/usePlanConfig.ts`: substituir constante única por lista (Pro/Max × 3 períodos).
- `Home.tsx`: refazer seção de pricing com **6 cards** (ou 2 colunas Pro/Max com toggle Mensal/Trimestral/Vitalício). Atualizar FAQ (remover "vitalício único", explicar 3 opções).
- `ProPage.tsx`: novo layout comparando Pro vs Max, com seletor de período. Botão chama `create-checkout` com o `priceId` certo.
- `AuthContext`: tipo `plano: 'Free' | 'Pro' | 'Max'`.

## 5. Gating de conteúdo
- `EbookModal.tsx`: e-books continuam Pro+ (Pro ou Max). **Aba/seção de vídeos do e-book** passa a exigir Max — mostrar bloqueio "Disponível no plano Max" para usuários Pro.
- `LessonsPage.tsx`: `canAccess = isAdmin || plano === 'Max'`. Tela de upsell direciona para Max.
- `Navbar`: badge do plano mostra Free/Pro/Max com cores distintas.

## 6. Admin Panel (`AdminPanel.tsx`)
- Tabela de usuários: substituir botão "Rebaixar/Upgrade" por **select** com opções `Free | Pro | Max` (atualiza `profiles.plano` direto, com log em `activity_logs`).
- Métricas: cards separados "Assinantes Pro" e "Assinantes Max".
- Editor de planos (CRUD `site_settings.plans`): permitir editar preço, `price_id` Stripe, período e tier de cada plano.

## 7. Responsivo (mobile + desktop)
- Cards de preço: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, toggle período em pílulas full-width no mobile.
- Tabela admin de usuários: select de plano em `w-full sm:w-auto`, colunas secundárias com `hidden md:table-cell`.
- ProPage e seção de Home revisadas em 390px / 768px / 1280px.

## Arquivos a alterar
`supabase/migrations/*` (nova), `supabase/functions/create-checkout/index.ts`, `supabase/functions/check-subscription/index.ts`, `src/lib/billing.ts`, `src/hooks/usePlanConfig.ts`, `src/contexts/AuthContext.tsx`, `src/pages/Home.tsx`, `src/components/ProPage.tsx`, `src/components/EbookModal.tsx`, `src/components/LessonsPage.tsx`, `src/components/Navbar.tsx`, `src/components/AdminPanel.tsx`.

## Pergunta antes de implementar
Quais os preços do plano **Max** (mensal / trimestral / vitalício)? Sem isso, uso placeholders e você ajusta depois no admin.
