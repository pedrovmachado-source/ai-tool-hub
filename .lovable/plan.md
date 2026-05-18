# Plano

## 1. Atualizar links de pagamento (Stripe)

Atualizar `DEFAULT_PLANS_CONFIG` em `src/lib/plan.ts` e a linha equivalente em `plans_config` no `site_settings` com os 6 links live:

| Plano | Preço | Link |
|---|---|---|
| Pro Mensal | 19,90 | `bJe8wR2JSg00ehN2rf5wI07` |
| Pro Trimestral | 49,90 | `8x2eVf1FO156flR5Dr5wI06` |
| Pro Vitalício | 127,90 | `9B614pbgo156c9F5Dr5wI03` |
| Max Mensal | 29,90 | `5kQbJ384cbJK1v19TH5wI08` |
| Max Trimestral | 79,90 | `00w9AV5W47tuflRd5T5wI05` |
| Max Vitalício | 197,90 | `14AfZjfwE8xy3D99TH5wI02` |

Substituir os URLs `test_…` por `https://buy.stripe.com/<id>` e rodar uma migration para atualizar `site_settings.plans_config`.

## 2. Botão hambúrguer + drawer lateral

Em `src/components/Navbar.tsx`:
- Adicionar botão `Menu` (lucide) à esquerda da navbar (visível para todos os usuários logados) — substituindo o hambúrguer flutuante de admin, que vira um item dentro do drawer.
- Drawer lateral (mesmo padrão do drawer de "E-books salvos") com seções:
  - **Aulas em grupo** → chama `onNavigate('lessons')` (move o botão "Aulas" que hoje fica no canto direito para dentro do drawer e remove do header).
  - **Ofertas validadas** → nova rota `offers`.
  - **Criação de site** → nova rota `site-creation`.
  - **Edição de criativo** → nova rota `creative-edit`.
  - **Aulas por assunto** (mineração de produtos, copy, criação de sites, etc.) → nova rota `topic-lessons`.
  - Se admin: link "Painel Administrativo".

## 3. Conteúdo dinâmico para as novas seções

Cada uma das 4 novas seções (Ofertas validadas, Criação de site, Edição de criativo, Aulas por assunto) usa o **mesmo modelo de conteúdo**: descrição, vídeos (URL), PDFs e imagens — totalmente controlado pelo admin.

### Banco (migration)
- Nova tabela `content_sections`:
  - `id uuid pk`, `slug text unique` (`offers`, `site-creation`, `creative-edit`, `topic-lessons`),
  - `title text`, `description text`, `intro text`, `cover_url text`, `updated_at`.
- Nova tabela `content_items`:
  - `id uuid pk`, `section_slug text references content_sections(slug)`,
  - `topic text` (para "Aulas por assunto": ex. "Mineração", "Copy", "Sites"), nullable nas outras seções,
  - `title text`, `description text`,
  - `kind text check in ('video','pdf','image','text')`,
  - `video_url text`, `pdf_path text` (no bucket `lesson-pdfs`), `image_url text`,
  - `sort_order int`, `created_at`, `updated_at`.
- RLS: leitura para `Pro` ou `Max` (configurável por seção via coluna `min_plan` — default `Pro`; "Aulas por assunto" e "Edição de criativo" podem ficar `Max`). Escrita só admin.
- Seed das 4 seções com slugs.

### Frontend
- Novo componente `src/components/ContentSectionPage.tsx` parametrizado por `slug`. Renderiza intro + grid de itens. Vídeos abrem em modal (reaproveitando `getEmbedUrl` de `LessonsPage`). PDFs abrem no visor PDF (reaproveitar lógica de `LessonsPage`). Imagens em lightbox simples. Para `topic-lessons`, agrupa por `topic` com tabs.
- Em `src/pages/Index.tsx`, adicionar rotas `offers`, `site-creation`, `creative-edit`, `topic-lessons` que renderizam `<ContentSectionPage slug=... />`. Gating: bloqueio amigável + CTA para `pro` se o usuário não tem plano suficiente.

### Admin
- Novo componente `src/components/AdminContentSections.tsx` (espelhando `AdminLessons.tsx`):
  - Lista as 4 seções; ao abrir uma, mostra editor do header (título/intro/cover) + CRUD de itens (título, descrição, tipo, upload de PDF/imagem, link de vídeo, tópico, ordem).
  - Upload de PDF reusa bucket `lesson-pdfs`; imagens vão para novo bucket público `content-images` (criado na migration).
- Adicionar aba "Conteúdos" em `AdminPanel.tsx`.

## 4. Remover hambúrguer flutuante antigo

Mover o acesso ao admin para dentro do novo drawer e remover o botão `fixed top-[80px] left-3` do `Navbar`.

## Detalhes técnicos

- Reutilizar componentes/utilitários: `getEmbedUrl`, fluxo PDF (`pdfjs`, blob/URL), `logActivity`, `inputCls`/`Field` do `AdminLessons`. Considerar extrair `getEmbedUrl` e o `PDFViewerModal` para `src/components/lessons/` para reuso entre `LessonsPage` e `ContentSectionPage`.
- Manter padrão de estado central em `Index.tsx` (page string) e drawer controlado dentro do `Navbar`.
- Plan gating via helpers existentes `isPaid`, `isMax` em `src/lib/plan.ts`.
- Migration única cobrindo: `content_sections`, `content_items`, bucket `content-images`, RLS, seed, update de `plans_config`.

## Fora do escopo
- Mudanças de design system / tokens.
- Novas integrações de pagamento — só atualização dos URLs.
