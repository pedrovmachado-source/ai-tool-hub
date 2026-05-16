## Visão geral

Introduzir o plano **Max** (acima do Pro), reformular preços em três modalidades (Mensal, Trimestral, Vitalício), tornar a página de planos totalmente responsiva e permitir que o admin altere o plano de cada usuário para Free, Pro ou Max.

## Preços confirmados

| Plano | Mensal | Trimestral | Vitalício |
|---|---|---|---|
| Pro | R$19,90 | R$49,90 | R$127,90 |
| Max | R$29,90 | R$79,90 | R$197,90 |

Max inclui tudo do Pro **+ vídeos dos e-books + aulas exclusivas**.

## 1. Stripe — produtos e preços

Criar 6 produtos no Stripe (modo test):

- **Pro Mensal** — recurring monthly, R$19,90
- **Pro Trimestral** — recurring monthly com `interval_count: 3`, R$49,90
- **Pro Vitalício** — one-time, R$127,90
- **Max Mensal** — recurring monthly, R$29,90
- **Max Trimestral** — recurring monthly com `interval_count: 3`, R$79,90
- **Max Vitalício** — one-time, R$197,90

Para cada um gerar um **Payment Link** (que é o padrão atual do projeto via `checkoutUrl`).

## 2. Banco de dados

Migração:

- Permitir `profiles.plano` com valores `'Free' | 'Pro' | 'Max'` (atualmente texto livre — manter assim, só atualizar a app).
- Atualizar políticas RLS que checam `plano = 'Pro'` para também aceitar `'Max'` (categorias, tools, modules, lessons).
- Atualizar `get_tool_premium` para liberar Pro **e** Max.
- Atualizar `site_settings.pro_plan` → substituir por uma nova chave `plans_config` em JSONB com a estrutura completa dos 6 planos (tier + período + preço + checkoutUrl + features).

## 3. Frontend — página de planos (`ProPage.tsx`)

Reescrever para mostrar **3 cards** (Free, Pro, Max) com **toggle de período** (Mensal / Trimestral / Vitalício) no topo:

```text
┌─────────────────────────────────────────┐
│  [ Mensal ] [ Trimestral ] [ Vitalício ]│
└─────────────────────────────────────────┘
┌────────┐  ┌────────┐  ┌────────┐
│ Free   │  │ Pro    │  │ Max    │
│ R$0    │  │ R$19,90│  │ R$29,90│
│        │  │ /mês   │  │ /mês   │
│ ...    │  │ Popular│  │ Premium│
└────────┘  └────────┘  └────────┘
```

- Cards empilham em coluna única no mobile (`grid-cols-1 md:grid-cols-3`).
- Toggle vira `select` em telas muito pequenas.
- Copy muda de "compra única / vitalício" para "assinatura" no Mensal e Trimestral.
- Botão de CTA dispara `window.open(checkoutUrl)` do plano+período selecionado.

## 4. Lógica de acesso (Max ⊇ Pro)

Em todos os pontos onde hoje se verifica `plano === 'Pro'`, passar a aceitar também `'Max'`. Helper único:

```ts
// src/lib/plan.ts
export const isPaid = (plano?: string) => plano === 'Pro' || plano === 'Max';
export const isMax = (plano?: string) => plano === 'Max';
```

Atualizar:
- `EbookModal.tsx` (acesso ao e-book → `isPaid`)
- `LessonsPage.tsx` (acesso à lista) → vídeos das aulas exigem **Max** (`isMax`); Pro vê só PDFs.
- Vídeos dentro do e-book (campo de vídeo no modal) → **Max** apenas.
- `Navbar.tsx`, `UserProfile.tsx`, `Profile.tsx` — badge mostra FREE / PRO / MAX com cores distintas.
- `AuthContext.tsx` — tipo `plano: 'Free' | 'Pro' | 'Max'`.

## 5. Admin

`AdminPanel.tsx`:
- Substituir botão "Upgrade / Rebaixar" por um **select** (Free / Pro / Max) por usuário, com confirmação e log em `activity_logs`.
- Tabelas de plano (desktop e mobile) mostram badge com 3 cores.
- Card de estatísticas: contagem separada Pro vs Max.
- Editor de planos no admin passa a editar a estrutura `plans_config` (6 planos com checkoutUrl individual).

Trigger `guard_plano_update` continua bloqueando que usuário comum altere o próprio plano — só admin pode.

## 6. Responsividade

Revisar `ProPage`, `AdminPanel` e `UserProfile`:
- Grids `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Tipografia escalonada (`text-[32px] sm:text-[42px]`).
- Toggle de período com `flex-wrap`.
- Tabela de usuários no admin já tem versão mobile — só adaptar para o novo select de plano.

## Ordem de execução

1. Criar os 6 produtos no Stripe e capturar Payment Links.
2. Migração SQL (RLS + função + seed de `plans_config`).
3. `src/lib/plan.ts` (helpers) + `AuthContext` tipo.
4. Reescrever `ProPage.tsx` com toggle de período + 3 cards responsivos.
5. Atualizar `EbookModal`, `LessonsPage`, `Navbar`, `UserProfile`, `Profile`.
6. Atualizar `AdminPanel` (select de plano, stats Max, editor de plans_config).
7. QA visual mobile + desktop.
