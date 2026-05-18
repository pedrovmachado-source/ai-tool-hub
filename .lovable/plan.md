## Visão geral

Cinco frentes integradas, reaproveitando o padrão já existente (módulos/aulas, `content_sections/items`, `site_settings`, painel admin com abas).

---

## 1. Botão "Assinar Max" no bloqueio de Aulas em Grupo

- Em `LessonsPage.tsx`, na tela de bloqueio (`!canAccess`), adicionar botão **"⚡ Assinar Max"** ao lado do "Voltar".
- O link vem de `site_settings.key = 'max_subscribe_url'` (com fallback para o link Stripe vitalício do Max já no `DEFAULT_PLANS_CONFIG`).
- Abre em nova aba (`target="_blank" rel="noopener"`).
- No admin (aba **Configurações** já existente), criar campo editável **"Link do botão Assinar Max"**.

---

## 2. Aulas por Nicho (renomeação + módulos próprios + popup)

- Renomear no `Navbar.tsx` o item de menu de **"Aulas por assunto" → "Aulas por nicho"**.
- Criar tabelas **`niche_modules`** e **`niche_lessons`** espelhando exatamente a estrutura de `modules`/`lessons` (título, descrição, capa, vídeo URL, PDF, ordem). RLS: leitura para Pro e Max; escrita só admin.
- No admin, nova aba **"Aulas por Nicho"** → componente `AdminNicheLessons.tsx` clonado de `AdminLessons.tsx`, apontando para as novas tabelas e usando o bucket `lesson-pdfs` (pasta `niche/`).
- No frontend, clicar em **"Aulas por nicho"** no menu hambúrguer abre um **popup modal** (overlay com botão X), não navega para outra página. Componente `NicheLessonsModal.tsx`: lista módulos → ao clicar abre lista de aulas com vídeo (modal interno) e PDF (PdfModal já existente). Substitui a rota atual `topic-lessons` em `Index.tsx`.

---

## 3. Ofertas Validadas — popup + admin

- Aumentar `content_items` com colunas opcionais:
  - `example_url text` (link de exemplo)
  - `buy_url text` (link Stripe / botão "Comprar")
- No `AdminContentSections.tsx`, adicionar esses dois campos no formulário do item (sempre visíveis, opcionais).
- No `ContentSectionPage.tsx`, ao clicar em qualquer item da seção `offers`, abrir um **`OfferModal`** mostrando título, descrição, botões "Ver exemplo" (`example_url`) e "Comprar" (`buy_url`), ambos em nova aba. Botão X para fechar.

---

## 4. Criação de Site — página dedicada

- Nova tabela **`site_products`**:
  - `id, slug, column ('ia'|'manual'), name, price text, short_desc text, example_url text, buy_url text, sort_order, active boolean`
  - RLS: leitura para qualquer autenticado; escrita só admin.
- Seed dos 8 produtos listados (Landing/Quiz/Advertorial/Type Bot × IA/Manual com os preços especificados).
- Nova tabela **`site_orders`**:
  - `id, user_id, product_slug, description, ref_link_1, ref_link_2, whatsapp, created_at`
  - RLS: usuário pode inserir o próprio; admin lê todos.
- Substituir a rota `site-creation` em `Index.tsx`: deixar de usar `ContentSectionPage` e renderizar um novo **`SiteCreationPage.tsx`** com layout em 2 colunas (Copy de IA / Copy à Mão), cada card com nome, preço, descrição, **"Ver exemplo"** (nova aba) e **"Comprar"** (abre modal de pedido).
- **`SiteOrderModal.tsx`**: 4 campos obrigatórios (descrição, ref 1, ref 2, WhatsApp) validados com zod (limites de tamanho, WhatsApp numérico). Ao confirmar: grava em `site_orders`, redireciona para `buy_url` em nova aba e fecha o modal. Botão X para fechar.
- Nova aba **"Criação de Site"** no admin → CRUD de `site_products` (igual padrão dos demais admin pages) + lista das `site_orders` recebidas (somente leitura, com filtro).

---

## 5. Painel admin — controle total (resumo das adições)

Novas abas/seções em `AdminPanel.tsx`:

| Aba | O que faz |
|---|---|
| Configurações (existente) | + campo "Link Assinar Max" |
| Aulas por Nicho (nova) | CRUD de módulos e aulas (`AdminNicheLessons`) |
| Conteúdos (existente) | + campos `example_url` e `buy_url` nos itens (afeta Ofertas) |
| Criação de Site (nova) | CRUD de produtos + lista de pedidos |

---

## Detalhes técnicos

```text
src/
├── components/
│   ├── AdminNicheLessons.tsx          (novo, clone de AdminLessons)
│   ├── AdminSiteCreation.tsx          (novo)
│   ├── NicheLessonsModal.tsx          (novo — popup)
│   ├── OfferModal.tsx                 (novo — popup ofertas)
│   ├── SiteCreationPage.tsx           (novo)
│   ├── SiteOrderModal.tsx             (novo + zod)
│   ├── AdminContentSections.tsx       (+ example_url, buy_url)
│   ├── AdminPanel.tsx                 (+ 2 abas + campo max_url)
│   ├── ContentSectionPage.tsx         (offers → OfferModal)
│   ├── LessonsPage.tsx                (+ botão Assinar Max)
│   └── Navbar.tsx                     (label "Aulas por nicho")
└── pages/Index.tsx                    (rotas: niche-lessons modal, site-creation custom)
```

Migrações (uma única chamada):
1. `ALTER TABLE content_items ADD COLUMN example_url text, ADD COLUMN buy_url text`
2. `CREATE TABLE niche_modules` e `niche_lessons` (mesma estrutura de `modules`/`lessons`)
3. `CREATE TABLE site_products` + seed dos 8 produtos
4. `CREATE TABLE site_orders` + RLS
5. `INSERT INTO site_settings (key, value) VALUES ('max_subscribe_url', ...)` se não existir

Regras gerais respeitadas: todos os popups com X; todos os links externos com `target="_blank" rel="noopener noreferrer"`; validação zod nos formulários de pedido; design tokens existentes (sem cores hardcoded).

---

## Pontos a confirmar

1. **Aulas por Nicho** — acesso é para **Pro + Max** (igual Ofertas/Conteúdos) ou só **Max** (igual Aulas em Grupo)?
2. **Pedidos de Criação de Site** — basta gravar no banco para o admin ver, ou também notificar (ex.: abrir WhatsApp pré-preenchido em paralelo)?

Se preferir que eu assuma defaults (Pro+Max + só gravar no banco), posso seguir direto.