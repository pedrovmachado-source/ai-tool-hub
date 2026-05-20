# Plano de correções

## 1. Labels padrão do menu (primeira abertura)
O banco já tem os nomes corretos ("Comprar Site", "Comprar Criativo", "Aulas gravadas"), mas os **fallbacks no código** ainda mostram os nomes antigos enquanto o fetch não termina. Atualizar:

- `src/components/Navbar.tsx` (linha 19): `DEFAULT_MENU` → `'Criação de site'` vira `'Comprar Site'`. Verificar também `creative-edit` e `lessons` para garantir consistência.
- `src/components/AdminMenu.tsx` (linha 27): opção do select → `'Comprar Site'`.
- `src/components/AdminPanel.tsx` (linha 492): item da navegação lateral admin → `'Comprar Site'`.

## 2. Notificação de novos pedidos no painel admin
A tabela `site_orders` já tem o campo `read_at`. Aproveitar isso:

- No `AdminPanel.tsx`, no carregamento inicial e a cada 30s, contar pedidos com `read_at IS NULL`.
- Adicionar um **badge vermelho com contagem** ao lado do item "Comprar Site" no menu lateral admin (`navItems`).
- Adicionar um **sino de notificação** no topo do painel (ao lado do título) que, ao clicar, navega para a aba "Comprar Site" (Pedidos).
- Quando o admin abrir a aba de pedidos no `AdminSiteCreation.tsx`, marcar todos os pedidos não lidos como `read_at = now()` automaticamente, zerando o badge.

## 3. Melhorar copy do banner "Fazemos a copy do seu site do zero"
O texto atual é genérico. Substituir por algo com mais valor de conversão. Sugestão (ajustável):

- **Título:** "Site pronto para vender em 7 dias — copy persuasiva incluída"
- **Subtítulo/CTA:** "Estrutura validada por quem fatura 6 dígitos. Sem enrolação, só conversão."

Como o banner hoje é uma única string em `site_settings.site_creation_banner.text`, vou:
- Estender a estrutura para suportar `title` + `subtitle` + opcional `cta_label`.
- Atualizar `SiteCreationPage.tsx` para renderizar o novo layout (gradiente atual mantido, tipografia mais hierárquica, ícone de raio/check).
- Atualizar `AdminContentSections.tsx` (ou onde o banner é editado) para permitir editar título e subtítulo separadamente.
- Preencher os defaults no DB via migration de update (`UPDATE site_settings SET value = ...`).

## Detalhes técnicos
- Polling de pedidos via `setInterval` + `supabase.channel('site_orders').on('postgres_changes', ...)` para realtime (já há precedente no projeto).
- Habilitar realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.site_orders;` (se ainda não estiver).
- Badge usa token semântico `bg-destructive text-destructive-foreground`.
- Migration única para: ativar realtime em `site_orders` + atualizar `site_creation_banner` com nova estrutura `{enabled, after_row_key, title, subtitle}`.

## Arquivos a alterar
- `src/components/Navbar.tsx`
- `src/components/AdminMenu.tsx`
- `src/components/AdminPanel.tsx`
- `src/components/AdminSiteCreation.tsx`
- `src/components/SiteCreationPage.tsx`
- `src/components/AdminContentSections.tsx` (editor do banner)
- nova migration SQL
