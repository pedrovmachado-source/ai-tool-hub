## Ajustes de responsividade no mobile (incluindo Admin)

Foco: deixar o site visualmente equilibrado em telas <768px sem alterar nada no desktop.

### Áreas que serão revisadas

1. **Home (`src/pages/Home.tsx`)**
   - Hero: headline escalável (`text-3xl sm:text-4xl md:text-6xl`), badge `text-xs`, subheadline `text-sm sm:text-base`, padding vertical menor.
   - CTAs: empilhar (`flex-col sm:flex-row`), botões `w-full sm:w-auto`.
   - Seção "O que muda quando você usa o AdAi": padding/ícones reduzidos no mobile.
   - Faixa de métricas: números (`text-4xl sm:text-5xl md:text-6xl`), legendas `text-xs sm:text-sm`.
   - Demais seções (Como funciona, Categorias, Para quem é, Depoimento, FAQ, CTA final): títulos e padding escaláveis.

2. **Navbar (`src/components/Navbar.tsx`)**
   - Logo, ícones e hambúrguer proporcionais; padding reduzido em mobile.

3. **Catálogo (`src/pages/Index.tsx`, `CategoryTabs.tsx`, `ToolCard.tsx`)**
   - Abas com scroll horizontal suave, fontes menores.
   - Busca + filtro empilhados em mobile.
   - Cards com padding interno menor e tipografia adaptativa.

4. **Modais (`EbookModal.tsx`, `AuthModal.tsx`, `QuizModal.tsx`)**
   - `w-[95vw] max-w-2xl`, `max-h-[90vh] overflow-y-auto`, padding interno reduzido, tabs com scroll horizontal no mobile.

5. **Páginas adicionais (`ProPage.tsx`, `LessonsPage.tsx`, `Profile.tsx`, `PromptsLibrary.tsx`, `UserProfile.tsx`)**
   - Títulos escaláveis, grids `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, botões `w-full sm:w-auto`.

6. **Painel Admin (mobile-only)** — `AdminPanel.tsx`, `AdminLessons.tsx`, `ActivityLogView.tsx`
   - **Sidebar**: vira drawer/off-canvas no mobile (botão hambúrguer no header). No desktop continua fixa lateral, idêntico ao atual.
   - **Header da seção**: título e botões "Adicionar" empilham no mobile (`flex-col sm:flex-row`), botões `w-full sm:w-auto`.
   - **Cards de métricas (Dashboard)**: empilham em 1 coluna em <640px (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), fontes dos números reduzidas (`text-2xl sm:text-3xl`).
   - **Tabelas (Usuários, Pagamentos, Atividade)**: encapsular em `overflow-x-auto` para scroll horizontal; em telas muito pequenas, esconder colunas secundárias com `hidden sm:table-cell`.
   - **Modais de edição** (`ToolFormModal`, etc.): `w-[95vw] max-h-[90vh] overflow-y-auto`, padding e fontes reduzidos.
   - **Configurações/Conteúdo**: campos full-width no mobile, gaps menores.
   - Apenas classes Tailwind responsivas — desktop permanece **idêntico** ao print enviado.

### Como vamos fazer

- Edições puramente de classes Tailwind (mobile-first com `sm:`, `md:`, `lg:`).
- Nenhuma mudança em lógica, backend, autenticação ou Supabase.
- Validação visual no preview em 390px (mobile) e ≥1024px (desktop).

### Arquivos que serão tocados

- `src/pages/Home.tsx`
- `src/pages/Index.tsx`
- `src/pages/Profile.tsx`
- `src/components/Navbar.tsx`
- `src/components/CategoryTabs.tsx`
- `src/components/ToolCard.tsx`
- `src/components/EbookModal.tsx`
- `src/components/AuthModal.tsx`
- `src/components/QuizModal.tsx`
- `src/components/ProPage.tsx`
- `src/components/LessonsPage.tsx`
- `src/components/PromptsLibrary.tsx`
- `src/components/UserProfile.tsx`
- `src/components/AdminPanel.tsx`
- `src/components/AdminLessons.tsx`
- `src/components/ActivityLogView.tsx`

### Não tocaremos

- Backend, Supabase, edge functions, auth.
- Layout desktop de qualquer página (apenas adições mobile-first).
