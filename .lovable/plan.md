# Aprovação de ofertas pelo admin (estrela + oferta definitiva)

## Objetivo
No painel admin, poder marcar as ofertas enviadas pelos alunos como **aprovada** (estrela) e como **oferta definitiva** (a oferta principal escolhida). O aluno vê essas marcações na página "Minhas Ofertas".

## Como vai funcionar

### No painel admin (Ofertas dos Usuários)
- Cada card de oferta ganha dois controles:
  - Botão de **estrela**: alterna aprovada / não aprovada.
  - Botão **"Oferta definitiva"**: marca aquela oferta como a definitiva daquele aluno. Ao marcar, qualquer outra oferta definitiva do mesmo aluno é desmarcada automaticamente (apenas uma por aluno).
- Feedback visual imediato: estrela preenchida em dourado quando aprovada; card com borda/gradiente azul quando definitiva.
- Filtro rápido opcional: todas / aprovadas / definitivas.

### Na página do aluno (/minhas-ofertas)
- Oferta aprovada: selo com estrela dourada e texto "Aprovada" no topo do card.
- Oferta definitiva: o box da oferta fica envolvido por um gradiente azul (borda em degradê + brilho suave) com selo "Oferta principal", destacando-a das demais.
- O aluno apenas visualiza — não consegue marcar nem desmarcar.

## Detalhes técnicos
1. **Banco**: migração adicionando em `public.user_offers`:
   - `approved boolean not null default false`
   - `approved_at timestamptz`, `approved_by uuid`
   - `is_definitive boolean not null default false`
   - Índice único parcial em `(user_id)` onde `is_definitive = true` para garantir uma definitiva por aluno.
   - Política de UPDATE existente mantida para o dono, e política de UPDATE para admin via `has_role(auth.uid(), 'admin')`. Para impedir que o aluno altere as flags, um trigger `BEFORE UPDATE` restaura `approved`/`is_definitive` aos valores antigos quando o autor não é admin.
2. **AdminUserOffers.tsx**: estado local dos toggles, `update` no Supabase (ao definir definitiva: limpar as outras do mesmo `user_id` e depois marcar esta), estilos de card conforme o status, `logActivity` opcional para auditoria.
3. **MinhasOfertas.tsx**: incluir `approved` e `is_definitive` no tipo `Row`/`Oferta` e no mapeamento; renderizar selos e o wrapper com gradiente azul usando tokens do design system (sem cores hardcoded).
4. Tipos do Supabase são regenerados após a migração, então o código entra depois dela.
