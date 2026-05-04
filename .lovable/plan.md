## Reposicionamento da landing principal para infoprodutores

Vou atualizar `src/pages/Home.tsx` com novo copy + 3 seções extras, mantendo a identidade visual (navy, brand-blue, brand-teal, DM Serif Display, cards arredondados).

### 1. Hero (substituir conteúdo atual)
- Badge: `🎯 Feito para infoprodutores, lançadores e gestores de tráfego`
- Headline: "A IA que escreve seus anúncios e multiplica seu faturamento — no piloto automático."
- Subheadline: "Feito para infoprodutores que querem parar de perder tempo com copy ruim e vender mais todos os dias."
- CTA: "Quero escalar meu infoproduto agora →" (mesmo estilo do botão grande atual, navega para `/ferramentas`)
- Manter botão secundário "Saiba mais" para scroll.

### 2. Nova seção "O que muda quando você usa o AdAi" (logo após hero)
Grid responsivo `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`, 6 cards estilo `Card` com ícone emoji + título + descrição:
- ⚡ Copies em segundos
- 📈 Escala sem equipe
- 🎯 Anúncios que convertem
- 💰 Mais lucro, menos custo
- 🔄 Lançamentos no automático
- 🌍 Venda para qualquer mercado

### 3. Faixa de métricas (após os cards)
Seção `bg-navy` com grid `grid-cols-2 md:grid-cols-4`, 4 números grandes em `font-serif-display` com cor `brand-blue-medium` e legendas:
- 10x mais variações de anúncios
- -60% no custo por criativo
- 3min para gerar uma VSL
- 0 copywriters necessários

### 4. CTA final (substituir o atual antes do footer)
- Título: "Pare de deixar dinheiro na mesa."
- Subtítulo: "Seu concorrente já está usando IA. Você vai ficar pra trás?"
- Botão: "Começar agora — é gratuito →"

### 5. Animação fade-in ao rolar
Adicionar pequeno hook utilitário `useReveal` (IntersectionObserver) dentro do próprio `Home.tsx` que aplica classe `animate-fade-in` quando a seção entra na viewport. Aplicar via `ref` nas novas seções (e nas existentes que se beneficiam). Usa o keyframe `fade-in` já definido no Tailwind config.

### Não alterado
- Navbar, demais seções existentes (Como funciona, Categorias, Benefícios, Para quem é, Depoimento, FAQ, Footer) — permanecem intactas exceto o CTA final que será reescrito.
- Nenhuma mudança de backend/Supabase/auth.

Arquivo afetado: `src/pages/Home.tsx`.