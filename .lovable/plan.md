## 1. Menu lateral editável pelo admin

Hoje os itens do drawer (Ofertas validadas, Criação de site, Edição de criativo, Aulas por nicho, Aulas em grupo) estão **hard-coded** em `src/components/Navbar.tsx`. Vou torná-los gerenciáveis.

### Backend
- Nova chave em `site_settings`: `nav_menu_items` (já existe a tabela com RLS apropriada — só admin escreve).
- Valor: array JSON
  ```json
  [{ "key":"offers","label":"Ofertas validadas","icon":"Sparkles","color":"text-brand-amber","target":"offers","enabled":true,"sort_order":1 }, …]
  ```
- Seed da migration com os 5 itens atuais (idempotente: `INSERT … ON CONFLICT (key) DO NOTHING`).

### Frontend
- **Navbar**: carrega `nav_menu_items` ao montar; usa um mapa `iconMap` (Sparkles, Globe2, Wand2, BookOpen, GraduationCap, Shield, Video, etc.) para resolver o `icon` string → componente. Fallback para os defaults atuais se a query falhar/estiver vazia. Apenas itens `enabled` são renderizados, ordenados por `sort_order`.
- **AdminPanel**: novo item de nav `'menu'` (ícone `Menu`) e nova seção `AdminMenu.tsx` com:
  - Lista ordenada (drag handles via setas ↑/↓ ou input numérico de ordem).
  - Cada linha: campos `label`, `target` (select com rotas válidas: offers, site-creation, creative-edit, niche-lessons, lessons, pro, profile, custom URL), `icon` (select dos ícones permitidos), `color` (select de tokens: text-brand-amber, text-brand-blue-medium, text-brand-teal, text-brand-green, text-brand-red), toggle `enabled`.
  - Botões "Adicionar item", "Remover", "Salvar" (faz `upsert` em `site_settings` e dispara `logActivity`).

### Bônus — expor seções admin já existentes mas sem entrada no menu
Adiciono também ao sidebar:
- `niche-lessons` → `<AdminNicheLessons />`
- `site-creation` → `<AdminSiteCreation />` (já contém o CRUD de produtos site/criativo + Pedidos Recebidos)

## 2. Copy direta + cores mais atrativas nos botões de compra

Em `SiteCreationPage.tsx` (`Card`):
- Trocar labels:
  - `site` → **"Quero esse site agora"**
  - `criativo` → **"Quero esse criativo"**
- Trocar o `bg-brand-amber` plano por **gradiente vibrante** com hover animado e leve glow:
  ```
  bg-gradient-to-r from-brand-amber via-orange-500 to-brand-red
  shadow-[0_4px_14px_-2px_hsl(var(--brand-amber)/0.6)]
  hover:shadow-[0_6px_20px_-2px_hsl(var(--brand-amber)/0.8)]
  hover:scale-[1.02] transition-all font-semibold
  ```
- Aumentar peso (`font-semibold`) e tamanho (`text-sm`) para reforçar CTA.
- Mesmo tratamento no `OfferModal` (botão "Comprar agora") e no `SiteOrderModal` (CTA final), mantendo consistência de identidade.

## Arquivos afetados
- `supabase/migrations/<new>.sql` — seed de `nav_menu_items` em `site_settings`.
- `src/components/Navbar.tsx` — leitura dinâmica + `iconMap`.
- `src/components/AdminPanel.tsx` — 3 novos itens de nav e roteamento de seções.
- `src/components/AdminMenu.tsx` *(novo)* — CRUD de itens de menu.
- `src/components/SiteCreationPage.tsx` — novo CTA (copy + cores).
- `src/components/SiteOrderModal.tsx`, `src/components/OfferModal.tsx` — estilo consistente do CTA.

Posso seguir com a implementação?