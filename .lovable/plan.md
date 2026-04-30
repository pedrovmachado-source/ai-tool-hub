
## O que será feito

Adicionar um banner/CTA discreto na hero section da página de ferramentas (`/ferramentas`) que mostra o preço do plano Pro e um botão para acessar a página Pro.

## Mudanças técnicas

### `src/pages/Index.tsx`

Abaixo do texto "E-books completos exclusivos para assinantes Pro" (linha ~191), adicionar um pequeno banner discreto com:

- Texto: "Acesso vitalício por apenas **R$14,90**" (usando `usePlanConfig` para pegar o preço dinâmico)
- Botão pequeno "Seja Pro" que navega para `setPage('pro')`
- Estilo sutil: fundo semi-transparente com borda, cores da paleta (amber/teal), tipografia pequena
- Visível para todos os usuários não-Pro (logados ou não)
- Posicionado dentro da hero, logo abaixo do aviso de conteúdo exclusivo

O hook `usePlanConfig` já existe e fornece preço e período dinamicamente do banco.
