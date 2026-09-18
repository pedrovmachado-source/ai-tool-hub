import { useState } from 'react';
import { ArrowLeft, Check, FileCheck2, Layers3, PenLine, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CopySection = 'humanizada' | 'angulo-formato' | 'validacao';

const copySections = [
  { id: 'humanizada' as const, label: 'Copy Humanizada', icon: PenLine },
  { id: 'angulo-formato' as const, label: 'Copy, Ângulo e Formato', icon: Layers3 },
  { id: 'validacao' as const, label: 'Persuasão', icon: FileCheck2 },
];

const sections = [
  {
    title: '1. Primeiro: use a IA como rascunho, não como copy final',
    paragraphs: [
      'O método mostrado no vídeo começa com a utilização do ChatGPT para estruturar a copy.',
      'O processo é:',
    ],
    bullets: [
      'Você ensina à IA uma estrutura de copy.',
      'Mostra exemplos de copies que você mesmo escreveu.',
      'Explica como aquela estrutura funciona.',
      'Pede para a IA criar uma nova copy seguindo aquela estrutura.',
      'Recebe o primeiro rascunho.',
      'Não publica imediatamente.',
      'Você começa a reescrever manualmente.',
    ],
    highlight: 'IA → estrutura/ideias → humano → refinamento → copy final',
    after: 'O próprio autor deixa claro que não é contra IA. Ele considera a ferramenta excelente para ideias, estruturas e primeiros rascunhos. O problema começa quando o copywriter simplesmente aceita o texto gerado como se estivesse pronto.',
  },
  {
    title: '2. A estrutura utilizada: BALACLAVA',
    paragraphs: ['Na transcrição, a estrutura apresentada é:'],
    definitions: [
      ['B — Gancho', 'Chamar atenção e quebrar o padrão.'],
      ['A — Exposição', 'Mostrar a situação/problema que a pessoa vive.'],
      ['L — Realidade', 'Apresentar uma percepção, verdade ou mudança de perspectiva.'],
      ['Solução/conclusão', 'Conectar essa nova percepção ao mecanismo/produto e apresentar o próximo passo.'],
    ],
    highlight: 'GANCHO → EXPOSIÇÃO → REALIDADE → SOLUÇÃO → CTA',
    after: 'Essa estrutura serve como o esqueleto. Mas o ponto mais importante do vídeo é: ter uma estrutura correta não significa ter uma copy boa. A IA consegue seguir a estrutura e ainda produzir um texto artificial, genérico ou pouco convincente.',
  },
  {
    title: '3. O primeiro grande princípio: a IA escreve algo que "parece certo"',
    paragraphs: [
      'Esse é um dos conceitos mais importantes da transcrição.',
      'O autor diz que a IA é muito boa em fazer você olhar para uma copy e pensar: “Está decente.” Só que “estar correto” não significa necessariamente conectar.',
      'A IA tende a produzir frases que parecem bem escritas, possuem lógica, seguem a estrutura, explicam o problema, utilizam palavras de copywriting e parecem profissionais.',
      'Porém, podem faltar naturalidade, intensidade, especificidade, linguagem cotidiana, sensação, personalidade, imagens mentais, ritmo e espontaneidade.',
    ],
    highlight: 'A diferença está entre uma copy que explica uma situação e uma copy que faz a pessoa pensar: “Caralho, parece que ele está falando de mim.”',
  },
  {
    title: '4. O que significa “humanizar” uma copy?',
    paragraphs: [
      'Humanizar não significa simplesmente colocar gírias.',
      'O processo mostrado consiste em reescrever a maneira como a pessoa realmente pensaria, falaria e sentiria aquela situação.',
      'Você pega: “Você decide comer só um prato pequeno, mas quando vê, está repetindo.” E pergunta: como essa pessoa realmente vivenciaria isso?',
      'Em vez de apenas descrever: “Você come um prato pequeno e depois repete.” Você pode aumentar a sensação: “Toda hora que você tenta emagrecer, parece que sua fome aumenta 10 vezes mais só por causa disso.”',
      'A segunda versão não necessariamente traz uma informação completamente diferente. O que muda é a experiência transmitida. O autor inclusive destaca que a segunda versão parece estar “vivendo dentro do corpo da pessoa”.',
    ],
  },
  {
    title: '5. Técnica nº 1 — Troque frases “certinhas” por frases que uma pessoa realmente falaria',
    paragraphs: [
      'Um dos problemas encontrados na copy de IA foi: “Você engorda porque sua fome não tem botão de desligar.”',
      'O autor considera essa frase estranha porque ela cria uma contradição com a frase anterior e utiliza uma metáfora pouco natural.',
      'A primeira coisa a fazer é perguntar: “Uma pessoa realmente falaria isso?” Não: “A frase parece inteligente?” Mas: “Eu ouviria alguém falando isso em uma conversa?”',
    ],
    subheading: 'Teste da conversa',
    after: 'Leia sua copy em voz alta. Se parecer que um robô escreveu, um professor está dando aula, um anúncio corporativo está falando ou alguém está tentando parecer inteligente, reescreva.',
  },
  {
    title: '6. Técnica nº 2 — Simplifique',
    paragraphs: [
      'Outro problema recorrente na copy gerada foi o excesso de palavras.',
      'Por exemplo, a IA escreveu uma ideia equivalente a: “Esse apetite incontrolável faz o seu corpo pedir comida mesmo quando não precisa.”',
      'O autor simplifica para algo como: “É essa fome que te faz errar toda hora.”',
      'Isso é muito importante. A copy não precisa demonstrar que você conhece palavras sofisticadas. Ela precisa ser fácil de consumir.',
    ],
    highlight: 'Regra prática: se você consegue transmitir a mesma ideia com 12 palavras em vez de 25, teste as 12.',
    after: 'Não significa transformar tudo em frases curtas. Significa eliminar gordura verbal.',
  },
  {
    title: '7. Técnica nº 3 — Troque abstração por algo palpável',
    paragraphs: [
      'Esse talvez seja um dos princípios mais importantes da transcrição.',
      'Compare: “Você não tem força de vontade.” com: “Você nunca vai conquistar o corpo que deseja.”',
      'O segundo é mais concreto para a pessoa porque cria uma imagem de um resultado desejado. A pergunta que você deve fazer é: “A pessoa consegue visualizar isso?”',
      'Palavras abstratas como disciplina, força de vontade, controle, mudança, transformação, liberdade e resultado não são necessariamente ruins. Mas, isoladas, podem ser genéricas.',
      'Você pode transformá-las em experiências concretas. Abstrato: “Você precisa ter mais disciplina.” Palpável: “Você promete que hoje vai comer direito. Aí chega a noite e está atacando a geladeira.”',
      'A segunda frase cria uma cena.',
    ],
  },
  {
    title: '8. Técnica nº 4 — Faça a pessoa se enxergar na situação',
    paragraphs: [
      'A exposição da copy precisa representar momentos que o público reconhece.',
      'Na versão inicial aparecem situações como comer um prato, repetir, comer chocolate, sentir culpa e pensar que não tem disciplina.',
      'O conceito é bom. O problema é que a execução pode parecer uma descrição genérica. Para humanizar, você precisa entrar mais profundamente na experiência.',
    ],
    bullets: [
      'O que essa pessoa pensa nesse momento?',
      'O que ela fala para si mesma?',
      'O que ela faz escondido?',
      'Qual é o pequeno comportamento que ninguém percebe?',
      'O que acontece às 23h?',
      'O que ela sente depois?',
    ],
    after: 'É aí que a copy começa a ganhar vida.',
  },
  {
    title: '9. Técnica nº 5 — Use intensidade quando ela fizer sentido',
    paragraphs: [
      'O autor aumenta a intensidade da exposição: “Toda hora que você tenta emagrecer, parece que sua fome aumenta 10 vezes mais...”',
      'Isso transmite uma sensação muito mais forte do que: “Você decide comer um prato pequeno, mas acaba repetindo.” O objetivo é fazer a pessoa sentir a situação.',
    ],
    highlight: 'Intensidade ≠ exagero aleatório',
    after: 'Você não deve colocar: “Sua fome é literalmente um monstro intergaláctico devorando sua alma.” Isso pode chamar atenção, mas pode destruir credibilidade. A intensidade precisa parecer compatível com como o público realmente descreve aquela experiência.',
  },
  {
    title: '10. Técnica nº 6 — Use linguagem cotidiana',
    paragraphs: [
      'Na transcrição, o autor critica expressões como: “o estômago gritando o dia inteiro.” A crítica dele é baseada na naturalidade: ninguém fala normalmente dessa maneira.',
      'Ele prefere algo mais próximo de: “o estômago implorando por comida.”',
    ],
    highlight: 'Escreva como o público fala. Não necessariamente como você gostaria que o público falasse.',
    after: 'Isso significa pesquisar comentários, reviews, grupos, WhatsApp, Reddit, Instagram, TikTok, avaliações de produtos, reclamações e conversas reais — e capturar as palavras que as próprias pessoas usam.',
  },
  {
    title: '11. Técnica nº 7 — Não tente “parecer copywriter”',
    paragraphs: [
      'Esse é um erro comum. O copywriter sabe que está escrevendo uma copy. O consumidor não deveria sentir isso.',
      'Frases como “Isso vai mudar o jogo”, “Você finalmente terá liberdade”, “Chegou a hora da transformação” e “Descubra o segredo” podem funcionar em determinados contextos, mas são facilmente percebidas como linguagem publicitária quando usadas sem contexto.',
      'O objetivo é reduzir a sensação de “estão tentando me vender alguma coisa” e aumentar: “essa pessoa entende exatamente o que eu passo.”',
    ],
  },
  {
    title: '12. Técnica nº 8 — Crie frases com ritmo',
    paragraphs: ['Uma copy humanizada não precisa ter todas as frases do mesmo tamanho. Você pode alternar frase longa, frase curta, uma pergunta e outra frase curta. Isso cria ritmo de conversa.'],
    highlight: 'Você tenta fazer dieta.\nAguenta dois dias.\nNo terceiro, a fome bate.\nE aí já era.',
    after: 'Perceba que não é apenas a informação. É o ritmo da leitura.',
  },
  {
    title: '13. Técnica nº 9 — Evite explicar demais',
    paragraphs: [
      'A IA frequentemente tenta completar o raciocínio. Isso pode gerar parágrafos grandes e excessivamente explicativos.',
      'O autor demonstra isso diversas vezes ao comparar uma versão extensa da IA com uma versão reduzida manualmente.',
    ],
    highlight: 'Não explique aquilo que o leitor já consegue entender.',
    after: 'Se você escreve: “Você está com fome porque seu corpo está sinalizando fisiologicamente uma necessidade de ingestão alimentar...”, provavelmente está explicando demais para uma copy. Você poderia dizer: “A fome bateu. E você sabe o que acontece depois.” Menos explicação. Mais comunicação.',
  },
  {
    title: '14. Técnica nº 10 — Use o mecanismo para conectar a realidade ao produto',
    paragraphs: [
      'Na etapa da solução, o autor mostra uma mudança importante.',
      'Em vez de simplesmente dizer: “O produto reduz o apetite, aumenta a saciedade...”, ele tenta criar uma comparação que torne o mecanismo mais compreensível.',
      'Na transcrição, ele utiliza a referência a “canetinhas de farmácia” como uma maneira de tornar a ideia mais palpável.',
    ],
    highlight: 'Como posso explicar o mecanismo de uma maneira que a pessoa já consiga entender?',
    after: 'Você pode utilizar analogias, comparações, situações conhecidas, exemplos e metáforas simples. Mas a comparação precisa ser compreensível e coerente com o produto.',
  },
];

const transformation = [
  ['ETAPA 1 — Gere', 'Peça para a IA criar uma primeira versão seguindo a estrutura.'],
  ['ETAPA 2 — Leia criticamente', 'Não aceite a primeira versão. Procure: genérico, estranho, artificial, longo, abstrato, pouco palpável, frases de efeito, contradições e linguagem que ninguém usa.'],
  ['ETAPA 3 — Marque as partes ruins', 'Pegue cada frase e pergunte: “Eu falaria isso?”, “Meu público falaria isso?”, “Isso parece uma conversa?”, “Consigo visualizar essa situação?” e “Isso gera alguma sensação?”'],
  ['ETAPA 4 — Reescreva manualmente', 'Não apenas peça: “ChatGPT, humanize essa copy.” O autor enfatiza que esse processo deve ser feito pela mão humana, porque outro prompt pode gerar outra versão igualmente artificial.'],
  ['ETAPA 5 — Simplifique', 'Corte palavras desnecessárias.'],
  ['ETAPA 6 — Torne palpável', 'Troque conceitos abstratos por situações concretas.'],
  ['ETAPA 7 — Aumente a sensação', 'Faça o leitor sentir que você conhece aquela experiência.'],
  ['ETAPA 8 — Leia em voz alta', 'Se não parecer uma conversa, reescreva.'],
  ['ETAPA 9 — Conecte ao mecanismo', 'Mostre como o mecanismo/produto resolve especificamente o problema apresentado.'],
  ['ETAPA 10 — CTA', 'Faça o próximo passo parecer uma continuação natural da história.'],
];

const checklist = [
  ['Naturalidade', ['Eu realmente falaria isso?', 'Meu público falaria isso?', 'Parece conversa ou anúncio?']],
  ['Especificidade', ['Estou falando de uma situação específica?', 'A pessoa consegue imaginar a cena?', 'Estou descrevendo comportamentos reais?']],
  ['Palpabilidade', ['Existe uma imagem mental?', 'Estou usando conceitos concretos?', 'Posso substituir alguma abstração por uma situação?']],
  ['Emoção', ['A pessoa sente alguma coisa?', 'Existe identificação?', 'A situação parece familiar?']],
  ['Simplicidade', ['Posso cortar palavras?', 'Alguma frase está tentando parecer inteligente?', 'Existe explicação desnecessária?']],
  ['Conversação', ['Se eu ler em voz alta, parece natural?', 'Tem ritmo?', 'As frases possuem variação?', 'Parece que alguém está falando comigo?']],
  ['Persuasão', ['O gancho cria curiosidade?', 'A exposição mostra um problema real?', 'A realidade muda a percepção?', 'O produto aparece como consequência lógica?', 'O CTA faz sentido depois de tudo que foi apresentado?']],
] as const;

const angleFormatSections = [
  {
    title: '1. O conceito mais importante: você não testa “criativos”, testa ÂNGULOS',
    paragraphs: [
      'Na aula, o processo começa identificando dores, medos e diferentes perspectivas do problema. Depois, cada uma dessas perspectivas é transformada em pares de criativos.',
      'Isso é muito mais inteligente do que simplesmente fazer oito vídeos diferentes, porque oito vídeos podem estar dizendo exatamente a mesma coisa.',
    ],
    highlight: 'Dor 1 → Criativo A + Criativo B\nDor 2 → Criativo C + Criativo D\nMedo 1 → Criativo E + Criativo F\nMedo 2 → Criativo G + Criativo H',
    after: 'A pergunta correta é: “Quantas razões diferentes estou dando para essa pessoa se interessar pelo produto?” Esse é um conceito que vale levar para todas as suas ofertas.',
  },
  {
    title: '2. Um criativo precisa ter uma função',
    paragraphs: ['Na aula aparece uma divisão muito importante: criativos de gatilho e criativos de oferta.'],
    definitions: [
      ['Criativos de gatilho', 'Chamam atenção, apresentam o problema, geram interesse e fazem a pessoa conhecer o produto.'],
      ['Criativo de oferta', 'Pega uma pessoa que já teve contato com a oferta, reforça produto e preço e busca gerar conversão.'],
    ],
    after: 'Os primeiros funcionam como uma espécie de “boi de piranha”: ajudam a introduzir a oferta, enquanto o anúncio de oferta pode atuar mais diretamente na conversão. Nem todo anúncio precisa vender da mesma maneira.',
  },
  {
    title: '3. Copy não é apenas texto: é função dentro do funil',
    definitions: [
      ['COPY DE DESCOBERTA', 'Responde: “Quem é você e por que eu deveria prestar atenção?” Usa curiosidade, dor, medo, identificação, mecanismo e problema.'],
      ['COPY DE CONSIDERAÇÃO', 'Responde: “Por que isso poderia funcionar para mim?” Usa mecanismo, benefícios, demonstração, diferenciação, prova e objeções.'],
      ['COPY DE CONVERSÃO', 'Responde: “Por que eu deveria comprar agora?” Usa oferta, preço, desconto, condição, escassez e CTA.'],
    ],
    after: 'Essa distinção evita um erro comum: tentar colocar toda a oferta em todos os criativos.',
  },
  {
    title: '4. O nome do produto deve aparecer',
    paragraphs: [
      'Toda copy do produto deve falar o nome do produto. O motivo é simples: aumentar a conexão e fazer a pessoa lembrar da oferta.',
      'Quando alguém vê um criativo sobre o problema, outro sobre uma história, outro sobre transformação e outro sobre oferta, o mesmo nome cria uma associação consistente.',
    ],
    highlight: 'Problema → Produto\nDesejo → Produto\nSolução → Produto\nOferta → Produto',
    after: 'Isso ajuda a construir memorização da oferta, não apenas do problema.',
  },
  {
    title: '5. A estrutura básica de copy',
    paragraphs: ['A aula utiliza uma estrutura simples e poderosa, que evita complicar a produção:'],
    definitions: [
      ['HOOK', 'É a interrupção. Não precisa explicar o produto; precisa fazer a pessoa pensar: “Peraí...”'],
      ['BODY', 'Desenvolve problema, história, mecanismo, benefício, prova e transformação.'],
      ['CTA', 'Apresenta o próximo passo.'],
    ],
    highlight: 'HOOK → BODY → CTA',
    after: 'Exemplo: “Você ainda perde horas preparando suas refeições toda semana?” Depois, desenvolva a situação, apresente o produto e o benefício e finalize com: “Conheça o [Produto] e veja como funciona.”',
  },
  {
    title: '6. O hook não precisa ser “bonito”',
    paragraphs: ['Um hook pode ser uma afirmação, pergunta, contradição, descoberta, reclamação, experiência, opinião, demonstração ou comparação.'],
    highlight: 'Você não precisa inventar uma frase genial. Precisa encontrar uma entrada interessante para uma conversa.',
    after: 'Isso se conecta à humanização: se o hook parece uma frase publicitária artificial, ele perde força.',
  },
  {
    title: '7. Leia a copy em voz alta',
    paragraphs: [
      'Faça a copy como se estivesse conversando com alguém. Depois, leia a copy como se estivesse conversando com alguém.',
      'Se você escreveu “Hoje eu gostaria de apresentar a você...” e nunca falaria isso para uma pessoa, corte. Se escreveu “Este produto proporciona uma transformação significativa...”, mas diria “Isso aqui me ajudou pra caramba...”, reescreva.',
    ],
    highlight: 'TESTE DA VOZ: copy boa precisa funcionar na boca, não apenas na tela.',
  },
  {
    title: '8. Cuidado com a “dualidade de IA”',
    paragraphs: [
      'A IA tende a repetir o padrão “Não é X. É Y.”, como em “Não é apenas um livro. É uma transformação.” ou “Não é sobre emagrecer. É sobre...”',
      'Esse recurso pode funcionar ocasionalmente. O problema é quando vira um cacoete de escrita.',
    ],
    highlight: 'Eu escreveria isso naturalmente ou estou apenas fazendo uma frase de copy?',
  },
  {
    title: '9. O criativo visual também precisa carregar a promessa',
    paragraphs: ['Para imagens, mostre a transformação visual: problema e resultado, situação ruim e situação desejada. Assim, o cérebro não precisa interpretar tanto texto; a imagem já começa a contar a história.'],
    highlight: 'Antes → Depois\ngeladeira bagunçada → organizada\npessoa cansada → tranquila\nproblema → resultado',
  },
  {
    title: '10. Para imagem, pense em “prova visual”',
    paragraphs: [
      'Em vez de apenas dizer “Nosso produto vai facilitar sua vida”, represente essa facilidade.',
      'ANTES: uma pessoa diante de dez potes de comida, cansada e com a cozinha bagunçada. DEPOIS: refeições organizadas, freezer cheio e uma pessoa tranquila.',
    ],
    after: 'Você não está apenas dizendo “facilita”. Você está mostrando a facilidade.',
  },
  {
    title: '11. O criativo deve parecer nativo da plataforma',
    paragraphs: [
      'Não invente um formato se o formato que já funciona está na sua frente. Se o concorrente usa UGC, pessoa falando, demonstração, vídeo de produto ou narração, observe esse formato.',
      'A ideia é modelar a estrutura do criativo que já está sendo utilizado, em vez de reinventar tudo. Isso é diferente de copiar.',
    ],
    highlight: 'Estude: formato + estrutura + ritmo + hook + CTA. Depois, adapte para sua própria oferta.',
  },
  {
    title: '12. “Não invente a roda” é um princípio estratégico',
    paragraphs: [
      'Uma oferta anunciada há bastante tempo e com muitos anúncios ativos pode ser um sinal para investigar aquele padrão criativo. Isso não é, por si só, motivo para descartar a oferta.',
      'Anúncio ativo é sinal de investigação, não prova automática de lucratividade.',
    ],
    bullets: ['Tempo ativo', 'Quantidade de anúncios', 'Variações e frequência', 'Comentários', 'Landing page', 'Oferta e preço', 'Ângulos', 'Sinais de escala'],
  },
  {
    title: '13. A biblioteca de anúncios vira uma biblioteca de ideias',
    paragraphs: ['Use YouTube, Instagram, TikTok e a biblioteca de anúncios para encontrar criativos, analisar formatos, separar hook, body e CTA, identificar padrões e criar sua própria versão.'],
    highlight: 'Criativo | Hook | Ângulo | Formato | CTA | Oferta | Observação',
    after: 'Depois de analisar muitos criativos, você começa a enxergar padrões e constrói um verdadeiro banco de ideias.',
  },
  {
    title: '14. Desmonte o criativo',
    paragraphs: ['Em vez de assistir a um anúncio e pensar apenas “Gostei”, desmonte cada elemento:'],
    definitions: [
      ['HOOK', 'O que me fez parar?'], ['BODY', 'O que me manteve assistindo?'], ['MECANISMO', 'Qual explicação foi apresentada?'], ['PROVA', 'Por que eu deveria acreditar?'], ['TRANSFORMAÇÃO', 'O que eu ganho?'], ['OFERTA', 'O que está sendo vendido?'], ['CTA', 'O que querem que eu faça?'], ['FORMATO', 'Como isso foi apresentado?'],
    ],
    after: 'Essa análise é muito mais útil do que simplesmente salvar o vídeo.',
  },
  {
    title: '15. Um criativo pode ser desmontado em peças',
    paragraphs: [
      'Você pode pegar partes de diferentes vídeos e estudar novas combinações de hook, body e CTA.',
      'Se o Criativo A tem hook e CTA excelentes, mas body mediano, e o Criativo B tem body excelente, mas hook e CTA ruins, estude: Hook A + Body B + seu CTA.',
    ],
    after: 'O objetivo não é copiar o anúncio inteiro. É entender quais componentes possuem potencial individual.',
  },
  {
    title: '16. Criativo de oferta é diferente de criativo de descoberta',
    paragraphs: ['O criativo de escassez ou oferta fala um pouco da persona, relembra a dor, resume o produto e coloca maior peso em preço, promoção e conversão.'],
    highlight: 'PRIMEIRO CONTATO: “Olha esse problema.”\nSEGUNDO CONTATO: “Olha essa solução.”\nCONTATO POSTERIOR: “Você já viu isso. Agora existe essa condição para comprar.”',
    after: 'Essa sequência cria uma jornada muito mais coerente.',
  },
  {
    title: '17. Não faça todos os anúncios iguais',
    paragraphs: [
      'Busque diversidade de mensagem, não apenas diversidade de edição. Oito vídeos com pessoas, músicas e legendas diferentes, mas todos dizendo “Compre nosso ebook de receitas”, são essencialmente uma ideia repetida oito vezes.',
    ],
    bullets: ['Ângulo 1 — Economize tempo.', 'Ângulo 2 — Pare de comer sempre a mesma coisa.', 'Ângulo 3 — Organize sua semana.', 'Ângulo 4 — Comida pronta sem passar horas na cozinha.'],
    after: 'Cada ângulo aborda uma razão diferente para comprar.',
  },
  {
    title: '18. O método completo',
    definitions: [
      ['FASE 1 — MINERAÇÃO', 'Encontre ofertas e criativos.'], ['FASE 2 — DECONSTRUÇÃO', 'Separe hook, body, CTA, formato, ângulo e oferta.'], ['FASE 3 — PESQUISA DO PÚBLICO', 'Liste dores, medos, desejos, objeções, situações e linguagem.'], ['FASE 4 — MATRIZ DE ÂNGULOS', 'Escolha quatro dores e quatro medos.'], ['FASE 5 — COPY', 'Para cada ângulo, escreva hook, body e CTA.'], ['FASE 6 — HUMANIZAÇÃO', 'Corte frases artificiais, dualidade excessiva, palavras desnecessárias, abstrações e linguagem corporativa.'], ['FASE 7 — FORMATO', 'Escolha o formato que melhor comunica aquele ângulo.'], ['FASE 8 — PRODUÇÃO', 'Produza vídeo, UGC, narração, imagem ou demonstração.'], ['FASE 9 — OFERTA', 'Crie peças específicas para preço, promoção, escassez e CTA.'], ['FASE 10 — TESTE', 'Suba múltiplas hipóteses.'], ['FASE 11 — ANÁLISE', 'Identifique quais ângulos, hooks, formatos e ofertas geram os melhores sinais.'], ['FASE 12 — ITERAÇÃO', 'Descubra qual parte precisa mudar: hook, ângulo, criativo, oferta, página, preço ou CTA.'],
    ],
  },
  {
    title: '19. Encontre o “DNA” do criativo',
    paragraphs: [
      'Depois de analisar muitos anúncios, pare de enxergar apenas “um vídeo de uma mulher fazendo comida” e comece a enxergar: hook + dor + demonstração + benefício + CTA de oferta.',
      'Vídeos superficialmente diferentes podem compartilhar o mesmo padrão: falta de tempo → solução rápida → demonstração → CTA.',
    ],
    after: 'Quando você reconhece esse padrão, encontrou o DNA do criativo.',
  },
  {
    title: '20. Da copy humanizada ao sistema de aquisição',
    paragraphs: [
      'A primeira aula ensina como fazer uma copy parecer humana. Esta segunda aula ensina como transformar essa copy em um sistema de aquisição.',
      'O objetivo não é criar um anúncio perfeito. É construir um sistema capaz de produzir dezenas de boas hipóteses, descobrir quais mensagens funcionam e aprofundar nelas.',
    ],
    highlight: 'ÂNGULO → COPY → HOOK → FORMATO → CRIATIVO → OFERTA → DISTRIBUIÇÃO → MÉTRICAS → ITERAR',
  },
];

const persuasionSections = [
  {
    title: '1. O que é',
    paragraphs: [
      'O termo é usado para duas coisas diferentes. Você precisa das duas, e elas se combinam.',
      'Empilhamento horizontal (de produção): você valida um corpo de criativo e produz N criativos trocando só os primeiros segundos. 1 corpo × 12 ganchos = 12 anúncios que testam uma única variável: atenção. É assim que se fabrica volume de teste barato.',
      'Empilhamento vertical (dentro do criativo): você encadeia vários ganchos dentro do mesmo vídeo, posicionados exatamente nos pontos onde a curva de retenção cai. Cada novo gancho reabre a atenção antes que a pessoa role.',
    ],
    highlight: 'Horizontal escala produção. Vertical escala retenção. O sistema é usar vertical dentro da peça e horizontal na fábrica.',
  },
  {
    title: '2. Por que é o motor específico do low-ticket',
    paragraphs: [
      'Em ticket de €14–€27 (NutriChefs, MenteAttiva a €19,90) a compra é impulsiva e o criativo é a oferta — a landing só confirma a decisão já tomada no feed. Três consequências:',
    ],
    bullets: [
      'Margem pequena por venda: o CPA só fecha com CPM baixo e CTR alto, e os dois dependem do gancho, não do corpo.',
      'Fadiga violenta. Público amplo em país pequeno (Holanda, Bélgica, Croácia) satura em dias. Você precisa de fluxo, não de peças.',
      'Produzir do zero custa roteiro + gravação + edição. Com corpo modular, o custo marginal de um criativo novo cai para minutos.',
    ],
    after: 'E o principal: empilhamento é método de aprendizado. Se você troca gancho, corpo e formato ao mesmo tempo, o resultado não ensina nada.',
  },
  {
    title: '3. Anatomia modular do criativo',
    paragraphs: ['Pare de pensar em "vídeo" e passe a pensar em blocos:'],
    definitions: [
      ['G1 — Gancho de interrupção | 0–3s', 'Parar o scroll'],
      ['G2 — Gancho de contexto | 3–8s', 'Qualificar e prometer'],
      ['G3 — Gancho de prova | 8–15s', 'Provar e segurar até a oferta'],
      ['C — Corpo | 15–25s', 'Mecanismo, demonstração'],
      ['O — Oferta + CTA | final', 'Preço, bônus, garantia, chamada'],
    ],
    highlight: 'A regra operacional que faz tudo funcionar: grave o corpo sem nenhuma referência aos ganchos. Nada de “como eu te falei”, “isso que mostrei agora”. Se o corpo depende do gancho, os ganchos não são plugáveis e o empilhamento horizontal morre. Corpo neutro = corpo reutilizável em 20 criativos.',
  },
  {
    title: '4. Empilhamento vertical: os 3 ganchos no mesmo vídeo',
    subheading: 'Por que 3 e não 1',
    paragraphs: [
      'A curva de retenção de um vídeo vertical curto tem quedas previsíveis, não uma queda contínua:',
      'Queda 1 — segundo 0 a 3. É o scroll. Aqui você perde 65–80% das impressões.',
      'Queda 2 — segundo 5 a 8. É o momento “isso é pra mim?”. A pessoa parou, mas ainda não decidiu ficar. Se a promessa não for renovada e especificada aqui, ela sai.',
      'Queda 3 — segundo 12 a 18. É o momento “isso vai demorar?”. A pessoa já entendeu o tema e está avaliando se vale o investimento de tempo. Sem prova concreta aqui, ela sai antes de ver preço.',
      'Um gancho só resolve a queda 1. O modelo mental correto é: cada gancho é uma promessa de curtíssimo prazo. Um gancho compra 3 segundos de atenção. Três ganchos empilhados compram 25.',
      'Gancho 1 (0–3s) — interrupção',
      'Função: interromper padrão. Não é vender, não é explicar, não é apresentar. É criar uma pergunta aberta na cabeça de quem está rolando.',
      'As três camadas trabalham juntas nos mesmos 3 segundos:',
    ],
    bullets: [
      'Visual: movimento já no primeiro frame. Rosto em close, mão entrando em quadro, algo fora do lugar. Nada de plano parado bonito.',
      'Áudio: a primeira sílaba começa antes ou exatamente no primeiro frame (cold open). Som que entra 0,4s depois já perdeu.',
      'Texto na tela: 3 a 6 palavras, alto contraste, posicionado no terço superior — fora da área onde a UI do Reels/Stories cobre.',
    ],
    after: 'Erros que matam o G1: logo, intro, fade-in, respirar antes de falar, enquadrar devagar, começar com “oi gente”. Regra prática de edição: corte fora o primeiro 0,5 segundo de qualquer gravação — quase sempre é lixo respiratório.',
  },
  {
    title: 'Gancho 2 (3–8s) — contexto e promessa',
    paragraphs: [
      'Função: responder “por que isso é pra mim?” e abrir o loop maior. Aqui entram o callout de público, a dor específica e a promessa de resultado.',
      'A mecânica precisa é: o G2 honra parcialmente o G1 e cria uma nova pendência. Ele nunca fecha o loop, ele estreita.',
    ],
    highlight: 'G1: “Você usa a airfryer do jeito errado.”\nG2: “E não é a temperatura. É o que você coloca dentro antes de ligar.”',
    after: 'Isso resolve o mistério do G1 o suficiente para a pessoa sentir progresso, e abre um mistério maior. Regra sensorial: o G2 tem que vir acompanhado de uma mudança visual — corte de plano, troca de enquadramento, entrada de B-roll, zoom, mudança de cor do texto. O cérebro re-engaja com novidade visual, não só com a frase. Um G2 excelente falado com a câmera no mesmo plano do G1 rende metade.',
  },
  {
    title: 'Gancho 3 (8–15s) — prova e reabertura',
    paragraphs: [
      'Função: entregar a primeira prova concreta e reabrir para o fechamento. É o “olha isso funcionando”.',
      'Formatos que funcionam:',
    ],
    bullets: [
      'Demonstração visual: o prato saindo pronto, a criança preenchendo a ficha em silêncio, o PDF sendo aberto no celular',
      'Número ou prova social: “1.000 cópias em um único dia” — você tem isso na NutriChefs e é material de G3, não só de landing',
      'Objeção destruída: “e sem dieta, sem academia, sem contar caloria”',
      'Reversão: “o mais estranho é que funciona melhor com quem odeia salada”',
    ],
    after: 'É aqui que a maioria dos criativos low-ticket morre. Eles pulam do G2 direto para a oferta no segundo 9, sem nunca ter entregado nada. A pessoa vê preço antes de ver motivo e sai.',
  },
  {
    title: 'As emendas entre os ganchos',
    paragraphs: ['Empilhar mal é pior que não empilhar. Quatro regras de costura:'],
    bullets: [
      'Nunca feche todos os loops antes da oferta. Cada gancho fecha um loop pequeno e abre outro.',
      'Nenhum plano passa de ~2,5s sem corte, movimento de câmera ou mudança de texto na tela.',
      'Áudio contínuo. Silêncio na emenda é ponto de saída. Música ou voz atravessam o corte.',
      'Não reinicie o contexto. O G2 não pode soar como um vídeo novo começando — isso o espectador lê como “acabou” e ele rola.',
    ],
  },
  {
    title: 'Roteiro-modelo aplicado (MenteAttiva, mercado italiano)',
    definitions: [
      ['0–3s | G1', 'Mão da criança agarrando o tablet, mãe puxando. Texto na tela: “3 horas de tela por dia?”'],
      ['3–8s | G2', 'Corte seco para a mesa com as fichas impressas. “Não é castigo e não é gritar. São 10 minutos por dia.”'],
      ['8–15s | G3', 'B-roll da criança concentrada, preenchendo sozinha. “+200 fichas, 9 áreas, de 3 a 9 anos. Você imprime e acabou.”'],
      ['15–25s | C', 'Folheando as áreas, close nos exercícios. Mecanismo: por que 10 min focados valem mais que 1h'],
      ['25–35s | O', 'Tela do checkout / bônus. €19,90, acesso vitalício, garantia de 14 dias, CTA'],
    ],
    after: 'Escreva assim em português, bloco a bloco — como você já faz — e adapte para o italiano depois. Só lembre que os ganchos são a parte que mais sofre na tradução literal (ponto detalhado no item 10).',
  },
  {
    title: 'Quantos ganchos por duração',
    bullets: [
      'Vídeo de 15s: 2 ganchos (0–3s e 4–8s), oferta a partir de 9s',
      'Vídeo de 25–40s: 3 ganchos — o padrão de low-ticket',
      'VSL curto de 60–120s: 4 a 6 ganchos, um a cada ~15s',
    ],
    after: 'O espaçamento aumenta conforme o vídeo avança: quem ficou 30 segundos já está qualificado e precisa de menos reforço que quem está no segundo 4.',
  },
  {
    title: 'Como isso funciona em estático e carrossel',
    paragraphs: ['O empilhamento vertical não é exclusivo de vídeo — só muda o suporte:'],
    bullets: [
      'Estático: imagem = G1, headline sobre a imagem = G2, primeira linha do texto primário = G3',
      'Carrossel: card 1 = G1, card 2 = G2, card 3 = G3, cards seguintes = corpo e oferta',
    ],
  },
  {
    title: '5. O banco de ganchos: pense em eixos, não em frases',
    paragraphs: ['Dez frases diferentes do mesmo eixo são um teste, não dez. Os eixos que funcionam em infoproduto low-ticket na Europa:'],
    bullets: [
      'Callout de público — “Mães italianas de filhos de 3 a 9 anos:”',
      'Negação de crença — “Não é falta de disciplina da criança”',
      'Erro/contraste — “Você usa a airfryer do jeito errado”',
      'Curiosidade mecânica com número — “10 minutos por dia”, “as 3 verduras que sabotam sua salada”',
      'Demonstração visual pura — 0 palavras nos 3 primeiros segundos',
      'Prova social concreta — “1.000 cópias em um único dia”',
      'Objeção antecipada — “Sem dieta, sem academia”',
      'Antes/depois de situação — “3 horas de tela → 10 minutos de foco”',
      'Novidade/localidade — “Novo na Holanda”',
      'Confissão/persona — “Eu era a mãe que gritava toda noite no jantar”',
      'Ataque à alternativa — “Esquece os apps de receita”',
      'Pergunta de sim fácil — “Sua filha come salada?”',
    ],
    after: 'Cada gancho tem três camadas independentes: texto (o que é dito), visual (o que se vê) e entrega (UGC, voz off, POV, screen recording, texto estático). 10 textos × 3 aberturas visuais = 30 variações sem regravar um corpo. Essa é a matriz.',
  },
  {
    title: '6. Como testar — e a métrica de cada gancho',
    paragraphs: [
      'Estrutura: campanha de teste (Vendas), público amplo, um único ad set com 5 a 8 criativos — mesmo corpo, ganchos de eixos diferentes. Mesmo ad set para comparar gancho contra gancho no mesmo leilão.',
      'Orçamento: ~1 a 2× o ticket por criativo por dia. Oferta de €20 com 6 criativos → ad set de €40–€60/dia.',
      'Janela: gancho se julga com ~1.000–2.000 impressões por criativo (1–2 dias). CPA precisa de pelo menos ~3× o ticket em gasto antes de matar por conversão.',
      'A tabela diagnóstica — cada gancho tem sua própria métrica:',
    ],
    definitions: [
      ['Hook rate = views 3s ÷ impressões | G1', 'Baixo = o G1 não interrompe. Troque de eixo, não de palavra'],
      ['Hold rate = views 15s ÷ views 3s | G2', 'Parou e caiu no 5–8s = a promessa não foi especificada'],
      ['Retenção 50–75% | G3', 'Cai antes da oferta = faltou prova concreta'],
      ['CTR de link | Corpo + CTA', 'Retenção boa e CTR baixo = falta tensão de oferta'],
      ['CPA com CTR bom | LP / checkout / preço', 'Saiu do criativo — pare de produzir gancho'],
    ],
    after: 'Isso muda como você testa: teste um gancho por vez. Primeiro fixe o G1 pelo hook rate, com G2 e G3 congelados. Com o G1 vencedor definido, rode a rodada seguinte variando só o G2 e leia o hold rate. Depois o G3 pela retenção. Se você trocar os três de uma vez, tem 8 combinações e nenhum aprendizado. Calibre os números com a sua própria conta — hook rate na Polônia com CPM baixo não se compara com Alemanha. O que importa é o ranking relativo dentro da mesma rodada.',
  },
  {
    title: '7. Do vencedor até a escala',
    paragraphs: ['Achou um gancho que ganha? Não copie — empilhe em cima dele, uma camada por vez:'],
    bullets: [
      'Variações do mesmo eixo (5–10 reescritas) → aqui mora a maior parte do dinheiro',
      'Mesmo G1, corpos diferentes → agora o corpo é a variável',
      'Mesmo G1, formatos diferentes → UGC, estático, carrossel, VSL curto',
      'Mesmo G1, personas diferentes → você já roda personas femininas holandesas na NutriChefs',
      'Nunca mude dois níveis ao mesmo tempo.',
    ],
    after: 'A sacada estratégica: o criativo fadiga, o eixo de gancho não. Frequência sobe, CTR cai, CPM sobe, o vídeo morre. Mas “prova social” ou “negação de crença” roda meses com roupa nova. O ativo real da operação não é a pasta de vídeos: é o banco de ganchos com histórico de performance por mercado.',
  },
  {
    title: '8. Nomenclatura',
    highlight: 'OFERTA_MERCADO_G1[eixo]_G2[eixo]_C[corpo]_F[formato]_v[n]\n\nExemplo: NUTRI_NL_G1-06provasocial_G2-01callout_C02_FUGC_v1',
    after: 'Em cada rodada só um campo varia — é o que permite exportar o relatório, agrupar por eixo numa planilha e descobrir que callout performa na Itália e prova social na Holanda.',
  },
  {
    title: '9. Ciclo semanal por oferta',
    definitions: [
      ['Segunda', 'alimentar o banco — 10 ganchos novos da Ad Library (o minerador já entrega), comentários dos concorrentes, reviews, fóruns, perguntas do seu suporte'],
      ['Terça', 'produção em lote — 1 corpo novo + 8 a 10 G1 plugados'],
      ['Quarta', 'sobe a rodada'],
      ['Quinta/sexta', 'leitura por camada (hook rate → hold rate → retenção → CTR), corta os 50% piores'],
      ['Sexta', 'vencedores para escala + 5 variações para a rodada seguinte'],
    ],
    highlight: 'Volume-alvo em low-ticket: 15 a 30 criativos novos por semana por oferta ativa. Abaixo de ~10 você vive de sorte, não de sistema.',
  },
  {
    title: '10. Os erros que matam o método',
    bullets: [
      'Trocar G1, G2, corpo e thumbnail juntos — nenhum aprendizado',
      'Gancho descolado da oferta: hook rate lindo, CPA horrível',
      'Julgar gancho por venda com 300 impressões',
      '10 variações do mesmo eixo achando que são 10 testes',
      'Corpo gravado grudado no gancho (mata a modularidade)',
      'Empilhar G2 e G3 que fecham o loop cedo demais — a pessoa já entendeu tudo no segundo 10 e não tem motivo pra ficar',
      'Silêncio ou plano parado na emenda entre os ganchos',
      'Traduzir gancho literalmente do português. Seu fluxo de escrever a copy em PT e depois passar para o idioma do mercado funciona bem para corpo e oferta, mas o gancho é a parte que mais quebra: é referência cultural, gíria, formato de frase. Corpo você traduz; gancho você minera nativo na Ad Library local e adapta. Um gancho alemão bom raramente é a tradução de um gancho brasileiro bom.',
    ],
  },
];

function LessonSections({ items }: { items: typeof sections | typeof angleFormatSections | typeof persuasionSections }) {
  return (
    <div className="space-y-16">
      {items.map((section) => (
        <section key={section.title} className="border-l-2 border-brand-blue/50 pl-5 sm:pl-8">
          <h2 className="font-serif-display text-2xl leading-snug sm:text-3xl">{section.title}</h2>
          <div className="mt-6 space-y-4 text-[15px] leading-8 text-white/65 sm:text-base">
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {'bullets' in section && section.bullets && <ul className="space-y-2">{section.bullets.map((item) => <li key={item} className="flex gap-3"><Check className="mt-1.5 h-4 w-4 shrink-0 text-brand-teal" /><span>{item}</span></li>)}</ul>}
            {'definitions' in section && section.definitions && <div className="grid gap-3 sm:grid-cols-2">{section.definitions.map(([term, detail]) => <div key={term} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4"><strong className="text-white">{term}</strong><p className="mt-1 text-sm leading-6">{detail}</p></div>)}</div>}
            {'subheading' in section && section.subheading && <h3 className="pt-2 text-lg font-semibold text-white">{section.subheading}</h3>}
            {'highlight' in section && section.highlight && <blockquote className="my-6 whitespace-pre-line rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-5 font-medium leading-7 text-white/90"><Quote className="mb-3 h-4 w-4 text-brand-blue-medium" />{section.highlight}</blockquote>}
            {'after' in section && section.after && <p>{section.after}</p>}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function CopywriterGuide({ onBack }: { onBack: () => void }) {
  const [activeSection, setActiveSection] = useState<CopySection>('humanizada');

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-blue/30">
      <header className="border-b border-white/[0.08] px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto max-w-4xl">
          <Button variant="outline" size="sm" onClick={onBack} className="mb-12 gap-2 rounded-full border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Voltar ao menu
          </Button>
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-blue-medium">
            <PenLine className="h-4 w-4" /> Guia prático de copywriting
          </div>
          <h1 className="max-w-3xl font-serif-display text-4xl leading-tight sm:text-6xl">Como construir uma copy <em className="font-normal text-brand-blue-medium">humanizada</em></h1>
          <p className="mt-8 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">A transcrição apresenta um método prático para pegar uma copy gerada por IA e transformá-la em uma copy mais humana, natural, palpável e conectada com a experiência real do público. O ponto central é: a IA pode ajudar a criar o rascunho e a estrutura, mas a humanização precisa passar pelo olhar e pela escrita do copywriter.</p>
        </div>
      </header>

      <nav aria-label="Seções de copywriting" className="border-b border-white/[0.08] bg-white/[0.02] px-5 py-5 sm:px-8">
        <div className="mx-auto grid max-w-4xl gap-2 sm:grid-cols-3">
          {copySections.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <Button
                key={id}
                type="button"
                variant="outline"
                aria-pressed={isActive}
                onClick={() => setActiveSection(id)}
                className={`h-auto min-h-12 justify-start gap-3 rounded-lg px-4 py-3 text-left whitespace-normal transition-colors sm:justify-center ${
                  isActive
                    ? 'border-brand-blue bg-brand-blue/20 text-white hover:bg-brand-blue/25 hover:text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-brand-blue-medium' : ''}`} />
                <span>{label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {activeSection === 'humanizada' ? (
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="mb-12 font-serif-display text-3xl sm:text-4xl">Guia detalhado</h2>
        <LessonSections items={sections} />

        <section className="mt-24 border-t border-white/10 pt-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue-medium">15. A transformação completa</p>
          <h2 className="mt-3 font-serif-display text-3xl sm:text-4xl">Do rascunho à copy final</h2>
          <p className="mt-5 text-white/60">O processo mostrado no vídeo pode ser resumido assim:</p>
          <div className="mt-10 space-y-0">
            {transformation.map(([title, text], index) => (
              <div key={title} className="relative grid gap-3 border-l border-white/10 pb-9 pl-8 sm:grid-cols-[12rem_1fr] sm:gap-8">
                <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">{index + 1}</span>
                <h3 className="font-semibold text-white">{title}</h3><p className="leading-7 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-serif-display text-3xl sm:text-4xl">Checklist definitivo para humanizar uma copy</h2>
          <p className="mt-4 text-white/55">Antes de publicar, passe cada trecho por estas perguntas:</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {checklist.map(([title, items]) => (
              <article key={title} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-white/55">{items.map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-teal" />{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue-medium">O princípio central da aula</p>
          <h2 className="mt-5 font-serif-display text-2xl leading-snug sm:text-4xl">Não tente fazer a IA escrever como um humano. Use a IA para chegar até uma boa matéria-prima e depois escreva como um humano.</h2>
          <p className="mt-6 leading-8 text-white/65">A IA fornece velocidade e estrutura. Você fornece: experiência + percepção + linguagem + contexto + julgamento + emoção.</p>
          <p className="mt-4 leading-8 text-white/65">É justamente essa etapa manual que, segundo o autor, transforma uma copy “correta” em uma copy que parece ter sido escrita por alguém que realmente conhece aquela pessoa e o problema que ela vive.</p>
        </section>

        <section className="mt-10 rounded-lg border border-white/10 bg-white/[0.03] p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Fórmula prática para guardar</p>
          <h2 className="mt-4 font-serif-display text-3xl">COPY HUMANIZADA =</h2>
          <p className="mt-6 whitespace-pre-line font-medium leading-8 text-white/75">{`Estrutura da IA\n+ linguagem do público\n+ situações específicas\n+ sensação\n+ simplicidade\n+ ritmo de conversa\n+ especificidade\n− frases genéricas\n− palavras desnecessárias\n− “frases de copywriter”\n− explicações excessivas`}</p>
          <p className="mt-8 border-t border-white/10 pt-6 leading-8 text-white/60">E o ponto mais importante: não confunda “copy bonita” com “copy humana”. Uma copy pode estar gramaticalmente perfeita, estruturada e lógica e ainda assim não fazer o leitor sentir absolutamente nada.</p>
        </section>
      </div>
      ) : activeSection === 'angulo-formato' ? (
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue-medium">Copywriting + Criativos + Estratégia de testes</p>
            <h2 className="mt-4 font-serif-display text-3xl leading-tight sm:text-5xl">Copy, Ângulo e Formato</h2>
            <p className="mt-6 max-w-3xl leading-8 text-white/60">Esta aula ensina a construir um sistema de criativos em que copy, ângulo, formato, oferta e distribuição trabalham juntos. A lógica é criar múltiplos criativos a partir de diferentes dores e medos, em vez de depender de uma única mensagem.</p>
          </div>
          <LessonSections items={angleFormatSections} />
          <section className="mt-20 rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue-medium">Regra de ouro</p>
            <h2 className="mt-5 font-serif-display text-2xl leading-snug sm:text-4xl">Não pergunte: “Como faço um criativo viral?”</h2>
            <p className="mt-6 leading-8 text-white/70">Pergunte: “Qual é a melhor maneira de comunicar esta ideia específica para esta pessoa específica, neste estágio específico da decisão de compra?”</p>
          </section>
          <section className="mt-10 rounded-lg border border-white/10 bg-white/[0.03] p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Método completo</p>
            <p className="mt-5 font-serif-display text-2xl leading-snug text-white sm:text-3xl">Minere o que já funciona, extraia o DNA, escolha um ângulo real, escreva como humano, transforme a copy em um formato nativo e teste várias razões diferentes para a pessoa comprar.</p>
          </section>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue-medium">Produção + Retenção + Escala</p>
            <h2 className="mt-4 font-serif-display text-3xl leading-tight text-white sm:text-5xl">Empilhamento de gancho para low-ticket</h2>
            <p className="mt-6 max-w-3xl leading-8 text-white/60">Um sistema modular para fabricar volume de teste, reabrir a atenção nos pontos de queda e aprender com cada rodada.</p>
          </div>
          <LessonSections items={persuasionSections} />
        </div>
      )}
    </main>
  );
}
