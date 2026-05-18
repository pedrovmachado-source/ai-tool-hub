## Mudanças em "Criação de Site" + Admin

### 1. Renomear botões nos cards
Em `SiteCreationPage.tsx`, o texto do botão "Comprar" passa a depender do tipo do produto:
- `kind = 'site'` → **"Comprar Site Pronto"**
- `kind = 'criativo'` → **"Comprar Criativo"**

### 2. Banner divisor entre as linhas de cards
Reorganizar a página para renderizar **linha por linha** (uma linha = um par IA+Manual do mesmo "produto base", ex.: Landing IA + Landing Manual). Entre a linha de **Site Quiz** e a linha de **Advertorial**, inserir uma faixa horizontal (largura total da grid) com:
> ✨ "Fazemos a copy do seu site do zero"

Estilo: gradient navy→teal, padding generoso, texto serif centralizado, ícone de varinha.

Para identificar qual linha, agrupar por um novo campo `row_key` em `site_products` (ex.: "landing", "quiz", "advertorial", "type-bot"). O banner aparece após a linha cujo `row_key = 'quiz'`. (Tornar isso configurável via `site_settings.key = 'site_creation_banner'` com `{ text, after_row_key, enabled }`.)

### 3. Nova 3ª seção: Criativos
Adicionar abaixo das colunas de site uma seção própria "Criativos" (grid de cards do mesmo estilo) usando `site_products` com `kind = 'criativo'`. Admin gerencia pelo mesmo CRUD, escolhendo kind no formulário.

### 4. Fluxo de pedido (popup antes do Stripe)
`SiteOrderModal` já faz isso para os produtos de site. Vamos:
- Garantir que **todo** clique em "Comprar Site Pronto" / "Comprar Criativo" abra o modal (já abre).
- Mostrar tipo + preço auto-preenchidos no header do modal (já mostra).
- Manter os 4 campos obrigatórios (descrição, ref1, ref2, WhatsApp) com validação zod.
- Após `insert` em `site_orders`, redirecionar para `buy_url` em nova aba.

### 5. "Pedidos Recebidos" no admin
Reformular a aba `orders` em `AdminSiteCreation.tsx`:
- Cabeçalhos: Data | Tipo (site/criativo + nome do produto) | Preço | WhatsApp | Descrição | Refs | **Status** | **Lido** | Ações
- Status: dropdown editável (`Novo` | `Em andamento` | `Concluído`) — atualiza inline na tabela.
- Botão "Marcar como lido" (ícone olho) alterna `read = true/false`. Pedidos não lidos ficam com fundo destacado + bolinha azul.
- Ordenação: `created_at desc` (já está).
- Badge "X novos" no topo da aba quando houver não lidos.
- Join com `site_products` (por `product_slug`) para mostrar nome e preço.

### 6. Migração de banco
```sql
ALTER TABLE site_products
  ADD COLUMN kind text NOT NULL DEFAULT 'site',
  ADD COLUMN row_key text;
-- kind ∈ ('site','criativo')

ALTER TABLE site_orders
  ADD COLUMN status text NOT NULL DEFAULT 'novo',
  ADD COLUMN read_at timestamptz;
-- status ∈ ('novo','em_andamento','concluido')

-- RLS extra: admin pode UPDATE em site_orders (para mudar status/read_at)
CREATE POLICY "Admins update orders" ON site_orders
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(),'admin'))
  WITH CHECK (private.has_role(auth.uid(),'admin'));

-- Seed row_key nos produtos existentes (landing/quiz/advertorial/type-bot)
-- Seed site_settings('site_creation_banner', {enabled:true, after_row_key:'quiz', text:'Fazemos a copy do seu site do zero'})
```

### Arquivos a alterar
- `supabase/migrations/<new>.sql` (schema acima)
- `src/components/SiteCreationPage.tsx` — agrupar por `row_key`, render linha-a-linha, inserir banner configurável, suporte a `kind` no label do botão, nova seção "Criativos".
- `src/components/SiteOrderModal.tsx` — passar `kind` para mostrar "Site Pronto" vs "Criativo" no header.
- `src/components/AdminSiteCreation.tsx` — form ganha select `kind` e input `row_key`; aba pedidos reescrita com status, lido, join de produto, badge de não lidos.
- `src/integrations/supabase/types.ts` — regenerado automaticamente após a migração.

### Perguntas
Nenhuma — sigo com `row_key` derivado dos slugs atuais (`ia-landing` / `manual-landing` → `landing`, etc.) se já bater; senão admin edita.