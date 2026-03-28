export interface Tool {
  key: string;
  name: string;
  url: string;
  urlLabel: string;
  badge: string;
  desc: string;
  fullDesc?: string;
  whenToUse?: string[];
  steps?: { title: string; text: string }[];
  tip?: string;
  prompts?: { label: string; text: string }[];
  extraPrompts?: { label: string; text: string }[];
  promptsAdvanced?: { label: string; text: string }[];
  useCases?: { title: string; text: string; result?: string }[];
  commonErrors?: { erro: string; fix: string }[];
  stats?: { num: string; lbl: string }[];
  pricing?: { name: string; price: string; period: string; destaque?: boolean; features: string[] }[];
  comparison?: { cols: string[]; rows: { label: string; vals: string[] }[] };
  image?: string;
  gallery?: { url: string; caption: string }[];
  monetization?: string[];
  automations?: string[];
  checklist?: string[];
  imageDescriptions?: { title: string; desc: string }[];
  videos?: { title: string; url: string; desc?: string }[];
  pdfDataUrl?: string;
}

export interface Category {
  key: string;
  label: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  introTitle: string;
  introText: string;
  whenTags: string[];
  stats: { num: string; lbl: string }[];
  promptsExtra?: { label: string; text: string }[];
  tools: Tool[];
}

function ebookDefaults(name: string, desc: string): Pick<Tool, 'fullDesc' | 'whenToUse' | 'steps' | 'tip' | 'prompts' | 'extraPrompts' | 'promptsAdvanced' | 'useCases' | 'commonErrors' | 'monetization' | 'automations' | 'checklist' | 'imageDescriptions'> {
  return {
    fullDesc: desc,
    whenToUse: [`Você quer automatizar tarefas com ${name}`, `Precisa de resultados profissionais rápidos`, `Busca economia de tempo e dinheiro`, `Quer escalar produção de conteúdo`],
    steps: [
      { title: 'Crie sua conta', text: `Acesse o site oficial do ${name} e crie uma conta gratuita.` },
      { title: 'Explore a interface', text: 'Navegue pelos menus principais e entenda as funcionalidades disponíveis.' },
      { title: 'Faça seu primeiro projeto', text: 'Use os templates prontos para criar seu primeiro projeto teste.' },
      { title: 'Refine e itere', text: 'Ajuste os resultados, peça variações e explore opções avançadas.' },
    ],
    tip: `Comece com o plano gratuito do ${name} para entender a ferramenta antes de investir.`,
    prompts: [
      { label: 'Iniciante — Primeiro uso', text: `Use ${name} para criar [tipo de conteúdo] sobre [tema]. Mantenha simples e direto.` },
      { label: 'Iniciante — Template básico', text: `Crie um [entregável] usando ${name} para [objetivo]. Público: [descreva].` },
    ],
    extraPrompts: [
      { label: 'Intermediário — Personalização', text: `Use ${name} para criar [conteúdo] com tom [formal/casual], para [nicho], focando em [diferencial].` },
      { label: 'Intermediário — Otimização', text: `Otimize [conteúdo existente] usando ${name}. Objetivo: aumentar [métrica] em [prazo].` },
    ],
    promptsAdvanced: [
      { label: 'Avançado — Automação', text: `Integre ${name} com [ferramenta] para automatizar [processo]. Fluxo: [entrada] → [processamento] → [saída].` },
      { label: 'Avançado — Escala', text: `Use ${name} para gerar [quantidade] variações de [conteúdo] para teste A/B em [plataforma].` },
    ],
    useCases: [
      { title: 'Freelancer de marketing', text: `Usa ${name} para entregar projetos 3x mais rápido para clientes.`, result: 'Triplicou o faturamento mensal' },
      { title: 'Pequena empresa', text: `Equipe de 3 pessoas usa ${name} para produzir conteúdo equivalente a uma equipe de 10.`, result: 'Economia de R$8.000/mês em equipe' },
    ],
    commonErrors: [
      { erro: 'Não personalizar os resultados', fix: 'Sempre adapte o output da IA para a voz da sua marca e contexto específico.' },
      { erro: 'Usar prompts genéricos', fix: 'Seja específico: inclua público-alvo, tom, formato e objetivo no prompt.' },
      { erro: 'Ignorar a revisão humana', fix: 'Sempre revise o conteúdo gerado. A IA é assistente, não substituta.' },
    ],
    monetization: [
      `Ofereça serviços de ${name} como freelancer (R$500-5.000/projeto)`,
      `Crie e venda templates e presets para ${name}`,
      `Monte um curso online ensinando a usar ${name} (R$197-497)`,
      `Ofereça consultoria especializada em ${name} (R$200-500/hora)`,
      `Crie uma agência especializada usando ${name} como ferramenta principal`,
    ],
    automations: [
      `${name} + ChatGPT: Use o ChatGPT para criar os briefings e ${name} para executar`,
      `${name} + Make/Zapier: Automatize o fluxo de trabalho completo`,
      `${name} + Canva: Combine resultados com design profissional`,
      `${name} + Google Sheets: Organize e escale a produção`,
    ],
    checklist: [
      'Criar conta e explorar interface',
      'Completar primeiro projeto teste',
      'Testar 3 prompts diferentes',
      'Salvar templates que funcionam',
      'Integrar com outras ferramentas do fluxo',
      'Definir processo de produção escalável',
      'Criar portfolio com trabalhos feitos na ferramenta',
    ],
    imageDescriptions: [
      { title: 'Tela inicial', desc: `Print da interface principal do ${name} mostrando o dashboard com as opções de criação.` },
      { title: 'Exemplo de resultado', desc: `Print mostrando um resultado profissional gerado pelo ${name} com destaque para a qualidade.` },
      { title: 'Fluxo de trabalho', desc: `Diagrama mostrando o fluxo: Briefing → ${name} → Revisão → Entrega ao cliente.` },
    ],
  };
}

export const CATEGORIES: Category[] = [
  {
    key: 'texto',
    label: 'Texto & Copy',
    accent: '#378ADD',
    accentLight: '#E6F1FB',
    accentDark: '#185FA5',
    introTitle: 'Texto & Copywriting com IA',
    introText: 'IAs de texto são as ferramentas mais transformadoras para quem trabalha com marketing, vendas e criação de conteúdo. Em minutos você produz o equivalente a horas de trabalho manual.',
    whenTags: ['Copies para Meta Ads', 'E-mail marketing', 'Posts para redes sociais', 'Scripts de vídeo', 'Artigos de blog', 'Propostas comerciais'],
    stats: [{ num: '6', lbl: 'ferramentas' }, { num: '3×', lbl: 'mais velocidade' }, { num: 'Free', lbl: 'todas têm grátis' }],
    tools: [
      {
        key: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com', urlLabel: 'chat.openai.com', badge: 'IA Geral',
        desc: 'O assistente de IA mais popular do mundo. Escreve qualquer tipo de texto com linguagem natural.',
        fullDesc: 'O ChatGPT é o assistente de IA mais utilizado no mundo, desenvolvido pela OpenAI. Ele é capaz de escrever qualquer tipo de texto, desde uma simples resposta de e-mail até roteiros completos de vídeo, artigos de blog, copies de anúncios e muito mais. Com a versão GPT-4o, a qualidade dos textos atingiu nível profissional, sendo indistinguível de textos escritos por humanos em muitos casos.',
        whenToUse: ['Escrever copies para anúncios no Meta Ads, Google Ads e TikTok Ads', 'Criar posts e legendas para redes sociais', 'Redigir e-mails de vendas e sequências de nutrição', 'Produzir artigos de blog otimizados para SEO', 'Gerar scripts de vídeo para YouTube e Reels', 'Criar propostas comerciais e relatórios'],
        steps: [
          { title: 'Crie sua conta gratuita', text: 'Acesse chat.openai.com, clique em "Sign up" e crie conta com e-mail ou Google. O plano gratuito dá acesso ao GPT-4o mini.' },
          { title: 'Defina o papel da IA', text: 'Sempre comece dizendo quem a IA deve ser: "Aja como um copywriter especialista em Meta Ads com 10 anos de experiência..."' },
          { title: 'Forneça contexto completo', text: 'Informe: produto, público-alvo, plataforma, objetivo da campanha, diferencial do produto, tom desejado e exemplos do que você gosta.' },
          { title: 'Itere e peça variações', text: 'Nunca aceite a primeira versão. Peça "crie mais 3 variações com ângulos diferentes" ou "reescreva com tom mais urgente".' },
          { title: 'Salve seus melhores prompts', text: 'Crie uma biblioteca pessoal dos prompts que geram os melhores resultados para reutilizar.' },
        ],
        tip: 'Use o GPT-4o para textos criativos e complexos, e o GPT-4o mini para tarefas rápidas como resumos e reformulações. Isso otimiza custo e velocidade.',
        prompts: [
          { label: '🟢 Iniciante — Copy para Meta Ads', text: 'Aja como copywriter de Meta Ads. Crie 3 variações de anúncio para [produto]. Público: [público]. Objetivo: [conversão/tráfego]. Formato: Headline (40 caracteres) / Texto principal (125 caracteres) / Descrição (30 caracteres).' },
          { label: '🟢 Iniciante — Post para Instagram', text: 'Crie uma legenda de Instagram para [tipo de negócio]. Tom: [inspirador/educativo/divertido]. Inclua 3 opções de CTA e 10 hashtags relevantes. Máximo 150 palavras.' },
          { label: '🟢 Iniciante — E-mail simples', text: 'Escreva um e-mail profissional para [situação]. Mantenha tom [formal/casual]. Máximo 100 palavras. Inclua assunto chamativo.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Sequência de e-mail AIDA', text: 'Crie uma sequência de 5 e-mails usando framework AIDA para vender [produto]. Público: [perfil]. Dor principal: [problema]. Envie um e-mail a cada 2 dias. Cada e-mail: assunto (50 car.) + corpo (200 palavras) + CTA.' },
          { label: '🟡 Intermediário — Artigo SEO completo', text: 'Escreva um artigo de blog de 1500 palavras sobre [tema]. Keyword principal: [keyword]. Estrutura: H1 + 5 H2s + conclusão. Inclua meta description (155 car.) e 3 variações de título SEO.' },
          { label: '🟡 Intermediário — Script de vídeo', text: 'Crie um script de vídeo de 60 segundos para [plataforma] sobre [tema]. Estrutura: Gancho (3s) → Problema (10s) → Solução (30s) → Prova (10s) → CTA (7s). Tom: [conversacional/profissional].' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Funil completo', text: 'Crie o conteúdo completo de um funil de vendas para [produto/serviço]: 1) 3 criativos de topo de funil (awareness) 2) 3 criativos de meio (consideração) 3) 3 criativos de fundo (conversão) 4) Sequência de 7 e-mails pós-captura 5) Copy da landing page. Público: [perfil detalhado]. Diferencial: [USP].' },
          { label: '🔴 Avançado — Brand Voice Document', text: 'Analise estes exemplos de comunicação da marca [cole exemplos] e crie um documento de Brand Voice contendo: tom de voz, palavras-chave, expressões proibidas, personalidade da marca, exemplos de DO e DON\'T para cada canal (Instagram, e-mail, site, ads).' },
          { label: '🔴 Avançado — Teste A/B em escala', text: 'Gere 20 variações de headline para [produto] usando diferentes ângulos psicológicos: medo, curiosidade, benefício, urgência, prova social, autoridade, novidade. Para cada variação, explique o gatilho mental usado e o público ideal.' },
        ],
        useCases: [
          { title: 'Agência de marketing digital', text: 'Uma agência com 3 pessoas usa ChatGPT para criar copies de anúncios para 15 clientes simultaneamente, gerando 10 variações por cliente em menos de 30 minutos.', result: 'Reduziu equipe de copy de 5 para 2 pessoas, economizando R$12.000/mês' },
          { title: 'Consultora de vendas autônoma', text: 'Gera propostas comerciais personalizadas para cada prospect em 3 minutos, incluindo análise do mercado do cliente.', result: 'Taxa de fechamento subiu de 15% para 35%' },
          { title: 'E-commerce de moda', text: 'Cria descrições de produto otimizadas para SEO para 200+ produtos, cada uma com 3 variações de tom (casual, luxo, jovem).', result: 'Tráfego orgânico aumentou 180% em 3 meses' },
        ],
        commonErrors: [
          { erro: 'Prompt vago demais', fix: 'Em vez de "escreva um texto sobre meu produto", diga: "Aja como copywriter de e-commerce. Escreva uma descrição de produto de 120 palavras para [produto] usando tom [tom]. Público: [público]. Destaque: [3 benefícios]."' },
          { erro: 'Aceitar o primeiro resultado', fix: 'O ChatGPT raramente acerta na primeira tentativa. Sempre peça "crie mais 3 variações com ângulos diferentes" ou "reescreva com tom mais [adjetivo]".' },
          { erro: 'Não definir o papel da IA', fix: 'Sempre comece com "Aja como [especialista]". Isso muda drasticamente a qualidade do output.' },
          { erro: 'Ignorar o contexto', fix: 'Quanto mais contexto você der (público, plataforma, objetivo, tom, exemplos), melhor será o resultado.' },
        ],
        stats: [{ num: '200M+', lbl: 'usuários ativos' }, { num: 'GPT-4o', lbl: 'modelo mais recente' }, { num: '3×', lbl: 'mais produtividade' }],
        pricing: [
          { name: 'Free', price: 'R$0', period: 'para sempre', features: ['GPT-4o mini', '40 msgs/dia GPT-4o', 'Plugins básicos'] },
          { name: 'Plus', price: 'US$20', period: 'por mês', destaque: true, features: ['GPT-4o ilimitado', 'DALL-E 3', 'GPTs personalizados', 'Acesso prioritário'] },
        ],
        monetization: [
          'Venda serviço de copywriting com IA para empresas (R$1.000-5.000/mês por cliente)',
          'Crie e venda templates de prompts para nichos específicos (R$47-197 cada pack)',
          'Ofereça serviço de e-mail marketing completo usando ChatGPT (R$2.000-8.000/mês)',
          'Monte um curso "ChatGPT para Marketing" (R$297-997)',
          'Crie uma agência de conteúdo escalável cobrando por pacotes de posts (R$1.500-4.000/mês)',
          'Venda e-books e guias criados com ajuda do ChatGPT em plataformas como Hotmart',
        ],
        automations: [
          'ChatGPT + Make/Zapier: Automatize geração de posts quando novo produto é adicionado ao e-commerce',
          'ChatGPT + Google Sheets: Gere copies em massa a partir de uma planilha de produtos',
          'ChatGPT + Canva: Crie o texto no ChatGPT e aplique nos templates do Canva',
          'ChatGPT + Mailchimp: Gere sequências de e-mail e envie automaticamente',
          'ChatGPT + WordPress: Publique artigos de blog diretamente via API',
        ],
        checklist: [
          'Criar conta no chat.openai.com',
          'Testar GPT-4o mini com prompt simples',
          'Criar primeiro prompt com role-playing (Aja como...)',
          'Gerar 3 copies de anúncio para seu negócio',
          'Testar iteração: pedir variações e refinamentos',
          'Salvar melhores prompts em documento',
          'Criar Custom GPT com instruções do seu negócio',
          'Integrar com uma ferramenta de automação',
        ],
        imageDescriptions: [
          { title: 'Interface do ChatGPT', desc: 'Print da tela principal do ChatGPT mostrando o campo de input, a área de conversa e o menu lateral com histórico de chats.' },
          { title: 'Exemplo de prompt de copy', desc: 'Print mostrando um prompt de copywriting sendo digitado e a resposta do ChatGPT com 3 variações de anúncio formatadas.' },
          { title: 'Custom GPTs', desc: 'Print da tela de criação de Custom GPT mostrando como configurar instruções personalizadas para sua marca.' },
          { title: 'Fluxo de trabalho', desc: 'Diagrama: Briefing do cliente → Prompt no ChatGPT → 3 variações → Revisão humana → Entrega → Teste A/B → Otimização.' },
        ],
      },
      {
        key: 'claude', name: 'Claude (Anthropic)', url: 'https://claude.ai', urlLabel: 'claude.ai', badge: 'IA Geral',
        desc: 'IA da Anthropic focada em textos longos, análise profunda e respostas mais precisas.',
        fullDesc: 'Claude é a IA da Anthropic, reconhecida pela capacidade excepcional de lidar com textos muito longos (até 200K tokens), análises complexas e raciocínio estruturado. É considerada mais precisa e menos propensa a "alucinar" que outros modelos, tornando-a ideal para trabalhos que exigem alta confiabilidade.',
        whenToUse: ['Analisar documentos longos e contratos', 'Criar relatórios detalhados e e-books', 'Escrever conteúdos extensos com coerência', 'Revisar e melhorar textos existentes', 'Análise de dados qualitativos', 'Tradução de documentos técnicos'],
        steps: [
          { title: 'Acesse claude.ai', text: 'Crie conta gratuita. O plano free oferece acesso ao Claude Sonnet com limite diário generoso.' },
          { title: 'Aproveite o contexto estendido', text: 'O Claude processa documentos inteiros (até 75.000 palavras). Cole PDFs, artigos ou livros diretamente no chat.' },
          { title: 'Use Artifacts', text: 'O Claude gera documentos, código e visualizações em uma janela separada (Artifacts) que você pode editar e exportar.' },
          { title: 'Itere com Projects', text: 'Use a funcionalidade Projects para manter contexto persistente entre conversas sobre o mesmo tema.' },
        ],
        tip: 'O Claude é superior ao ChatGPT para textos longos, análises e quando você precisa de máxima precisão. Para documentos acima de 5 páginas, prefira sempre o Claude.',
        prompts: [
          { label: '🟢 Iniciante — Resumo de documento', text: 'Analise este documento e crie um resumo executivo de 3 parágrafos com os pontos principais, decisões necessárias e próximos passos. [cole o documento]' },
          { label: '🟢 Iniciante — Revisão de texto', text: 'Revise este texto melhorando: clareza, coerência, gramática e persuasão. Mantenha o tom original. Destaque as mudanças feitas. [cole o texto]' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — E-book completo', text: 'Crie um e-book de 5.000 palavras sobre [tema] para [público]. Estrutura: Capa (título + subtítulo) / Introdução / 7 capítulos / Conclusão com CTA / Checklist final. Tom: [profissional/casual]. Inclua exemplos práticos em cada capítulo.' },
          { label: '🟡 Intermediário — Análise comparativa', text: 'Compare [produto A] vs [produto B] para [tipo de usuário]. Critérios: preço, facilidade, funcionalidades, suporte, escalabilidade. Formato: tabela comparativa + recomendação final justificada.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Estratégia de conteúdo', text: 'Crie uma estratégia de conteúdo de 90 dias para [negócio]. Inclua: calendário editorial (3 posts/semana), temas por semana, formatos (carrossel, reels, stories, artigo), KPIs de acompanhamento e briefing para cada peça de conteúdo.' },
          { label: '🔴 Avançado — Análise de mercado', text: 'Analise o mercado de [nicho] no Brasil. Inclua: tamanho do mercado, principais players, tendências, oportunidades, ameaças, persona ideal e estratégia de entrada recomendada com timeline.' },
        ],
        useCases: [
          { title: 'Escritório de advocacia', text: 'Usa Claude para analisar contratos de 50+ páginas e criar resumos executivos com pontos de atenção em 5 minutos.', result: 'Economia de 4 horas por contrato analisado' },
          { title: 'Produtora de conteúdo', text: 'Cria e-books completos de 10.000 palavras para clientes usando Claude como co-autor.', result: 'Produz 4 e-books/semana vs 1/semana anteriormente' },
        ],
        commonErrors: [
          { erro: 'Não usar o contexto longo', fix: 'O maior diferencial do Claude é processar documentos enormes. Cole documentos inteiros em vez de trechos.' },
          { erro: 'Esquecer dos Artifacts', fix: 'Use Artifacts para documentos, tabelas e código. Eles ficam em janela separada, editável e exportável.' },
        ],
        stats: [{ num: '200K', lbl: 'tokens de contexto' }, { num: 'Sonnet', lbl: 'modelo grátis' }, { num: '#1', lbl: 'em precisão' }],
        monetization: [
          'Serviço de análise de documentos e contratos (R$300-1.000 por análise)',
          'Produção de e-books profissionais para empresas (R$2.000-5.000 cada)',
          'Serviço de tradução e localização de conteúdo (R$0,15-0,30 por palavra)',
          'Consultoria de estratégia de conteúdo usando Claude como ferramenta (R$3.000-8.000/mês)',
          'Criação de relatórios de pesquisa de mercado sob demanda (R$1.500-4.000)',
        ],
        automations: [
          'Claude + Google Drive: Analise documentos compartilhados automaticamente',
          'Claude + Notion: Crie resumos automáticos de notas de reunião',
          'Claude + ChatGPT: Use Claude para análise e ChatGPT para formatação criativa',
          'Claude + Zapier: Automatize análise de feedback de clientes',
        ],
        checklist: [
          'Criar conta em claude.ai',
          'Testar upload de documento longo (PDF ou texto)',
          'Experimentar Artifacts para criação de documentos',
          'Configurar um Project para seu negócio',
          'Testar análise comparativa de produtos/serviços',
          'Criar primeiro e-book ou relatório completo',
        ],
        imageDescriptions: [
          { title: 'Interface do Claude', desc: 'Print do Claude mostrando a janela de chat à esquerda e um Artifact (documento gerado) à direita.' },
          { title: 'Upload de documento', desc: 'Print mostrando como fazer upload de um PDF longo e o Claude analisando o conteúdo.' },
          { title: 'Fluxo de produção', desc: 'Diagrama: Documento original → Claude analisa → Resumo executivo + Pontos de ação → Revisão humana → Entrega.' },
        ],
      },
      {
        key: 'copyai', name: 'Copy.ai', url: 'https://copy.ai', urlLabel: 'copy.ai', badge: 'Copywriting',
        desc: 'Especialista em copies de marketing: anúncios, e-mails e posts com templates prontos.',
        fullDesc: 'Copy.ai é uma plataforma especializada exclusivamente em copywriting com IA. Diferente de IAs generalistas, o Copy.ai oferece 100+ templates prontos para tipos específicos de copy: anúncios, e-mails, posts, descrições de produto, headlines e mais. Ideal para quem quer resultados rápidos sem precisar criar prompts complexos.',
        whenToUse: ['Criar copies de anúncios rapidamente com templates', 'Gerar variações de headline para testes A/B', 'Escrever sequências de e-mail marketing', 'Criar descrições de produto para e-commerce'],
        steps: [
          { title: 'Crie conta gratuita', text: 'Acesse copy.ai e crie conta. O plano gratuito oferece 2.000 palavras/mês.' },
          { title: 'Escolha um template', text: 'Navegue pela biblioteca de 100+ templates. Escolha o tipo de copy que precisa (ad, e-mail, post).' },
          { title: 'Preencha os campos', text: 'Cada template pede informações específicas: produto, público, tom, benefícios.' },
          { title: 'Gere e selecione', text: 'O Copy.ai gera múltiplas opções. Selecione as melhores e edite conforme necessário.' },
        ],
        tip: 'Use o Copy.ai para a primeira versão rápida e depois refine no ChatGPT se precisar de mais personalização.',
        prompts: [
          { label: '🟢 Iniciante — Ad copy rápido', text: 'Use o template "Facebook Ad Primary Text" com: Produto: [seu produto]. Público: [seu público]. Benefício principal: [benefício].' },
          { label: '🟢 Iniciante — Headlines', text: 'Use o template "Headlines" para gerar 10 opções de título para [página/anúncio/artigo].' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Workflow de e-mail', text: 'Use o Workflow do Copy.ai para criar uma sequência completa de 5 e-mails de nutrição para [produto/serviço].' },
          { label: '🟡 Intermediário — Product descriptions em massa', text: 'Use o recurso de bulk para gerar descrições para [número] produtos de uma vez.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — API integration', text: 'Integre a API do Copy.ai para gerar copies automaticamente quando novos produtos são adicionados ao seu e-commerce.' },
          { label: '🔴 Avançado — Brand Voice', text: 'Configure o Brand Voice do Copy.ai com exemplos do seu negócio para que toda copy gerada siga seu tom de marca.' },
        ],
        useCases: [
          { title: 'Gestor de tráfego freelancer', text: 'Usa Copy.ai para criar 30 variações de anúncio em 15 minutos para clientes de e-commerce.', result: 'Atende 3x mais clientes por mês' },
          { title: 'Loja virtual Shopify', text: 'Gera descrições otimizadas para 500 produtos usando o recurso de bulk do Copy.ai.', result: 'Conversão de produto page subiu 25%' },
        ],
        commonErrors: [
          { erro: 'Usar só o formato livre', fix: 'Os templates do Copy.ai são otimizados para cada tipo de copy. Use-os em vez de escrever prompts do zero.' },
          { erro: 'Não configurar Brand Voice', fix: 'Sem Brand Voice, as copies ficam genéricas. Configure com exemplos reais da sua marca.' },
        ],
        stats: [{ num: '2000+', lbl: 'palavras grátis/mês' }, { num: '100+', lbl: 'templates' }, { num: 'Bulk', lbl: 'geração em massa' }],
        monetization: [
          'Ofereça pacotes de copy para e-commerce (R$500-2.000 por 50 descrições)',
          'Serviço de A/B testing de headlines (R$300-800 por campanha)',
          'Crie pacotes de e-mail marketing para pequenas empresas (R$1.000-3.000)',
          'Revenda templates customizados do Copy.ai (R$97-297 por pack)',
        ],
        automations: [
          'Copy.ai + Shopify: Gere descrições automaticamente para novos produtos',
          'Copy.ai + Mailchimp: Crie e envie sequências de e-mail automaticamente',
          'Copy.ai + Meta Ads: Gere variações de copy para testes A/B contínuos',
          'Copy.ai + Google Sheets: Organize e gerencie copies em planilha',
        ],
        checklist: [
          'Criar conta no Copy.ai',
          'Explorar os 100+ templates disponíveis',
          'Gerar primeira copy usando template de anúncio',
          'Configurar Brand Voice com exemplos',
          'Testar geração em massa (bulk)',
          'Comparar resultados com ChatGPT',
        ],
        imageDescriptions: [
          { title: 'Dashboard do Copy.ai', desc: 'Print do dashboard mostrando a lista de templates organizados por categoria (Ads, Email, Social, etc.).' },
          { title: 'Template em ação', desc: 'Print mostrando um template de Facebook Ad sendo preenchido e as variações geradas.' },
          { title: 'Workflow', desc: 'Print da funcionalidade Workflow mostrando uma sequência de e-mails sendo criada automaticamente.' },
        ],
      },
      {
        key: 'jasper', name: 'Jasper AI', url: 'https://jasper.ai', urlLabel: 'jasper.ai', badge: 'Marketing',
        desc: 'Plataforma de IA voltada para equipes de marketing com brand voice e integrações.',
        ...ebookDefaults('Jasper AI', 'Jasper AI é a plataforma de IA mais completa para equipes de marketing. Diferente de ferramentas generalistas, o Jasper foi construído especificamente para marketing, com funcionalidades como Brand Voice (mantém consistência de tom), Knowledge Base (alimenta a IA com dados da empresa), campanhas multi-canal e integrações com as principais ferramentas de marketing.'),
        stats: [{ num: 'Brand Voice', lbl: 'consistência' }, { num: '50+', lbl: 'idiomas' }, { num: 'Teams', lbl: 'colaboração' }],
        prompts: [
          { label: '🟢 Iniciante — Blog post', text: 'Use o template "Blog Post" do Jasper. Título: [título]. Tom: [marca]. Palavra-chave: [keyword]. Extensão: 1500 palavras.' },
          { label: '🟢 Iniciante — Social media', text: 'Crie 5 posts para [rede social] sobre [tema] usando o tom de voz configurado na Brand Voice.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Campanha completa', text: 'Use o Jasper Campaigns para criar uma campanha de lançamento: landing page, 3 e-mails, 5 posts sociais e 3 anúncios.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Knowledge Base', text: 'Alimente a Knowledge Base com seu manual de marca, personas e cases de sucesso. Depois peça: "Crie conteúdo para [campanha] usando as informações da minha base de conhecimento."' },
        ],
        monetization: [
          'Monte uma agência de conteúdo usando Jasper como backend (R$3.000-15.000/mês por cliente)',
          'Ofereça serviço de setup de Brand Voice para empresas (R$2.000-5.000)',
          'Crie campanhas de marketing completas sob demanda (R$5.000-20.000)',
          'Consultoria de implementação de IA para equipes de marketing (R$500/hora)',
        ],
        automations: ['Jasper + HubSpot: Crie conteúdo diretamente no CRM', 'Jasper + Surfer SEO: Otimize artigos para SEO em tempo real', 'Jasper + Google Docs: Colabore com equipe em documentos gerados por IA', 'Jasper + Webflow: Publique conteúdo diretamente no site'],
        checklist: ['Criar conta e ativar trial', 'Configurar Brand Voice com exemplos reais', 'Alimentar Knowledge Base', 'Criar primeiro blog post com template', 'Testar Jasper Campaigns', 'Configurar integrações'],
        imageDescriptions: [
          { title: 'Dashboard do Jasper', desc: 'Print do dashboard mostrando documentos recentes, Brand Voice configurada e atalhos para templates.' },
          { title: 'Brand Voice', desc: 'Print da configuração de Brand Voice mostrando tom, estilo e exemplos da marca.' },
        ],
      },
      {
        key: 'writesonic', name: 'Writesonic', url: 'https://writesonic.com', urlLabel: 'writesonic.com', badge: 'SEO + Copy',
        desc: 'IA focada em SEO e conteúdo de blog com geração de artigos longos e otimizados.',
        ...ebookDefaults('Writesonic', 'Writesonic combina copywriting com otimização SEO, sendo ideal para quem precisa produzir artigos de blog rankeáveis e conteúdo de marketing otimizado para buscadores. Possui gerador de artigos longos, rewriter, e integração com dados de SEO.'),
        stats: [{ num: 'SEO', lbl: 'otimização nativa' }, { num: 'PT-BR', lbl: 'suporte nativo' }, { num: 'Free', lbl: '10.000 palavras' }],
        prompts: [
          { label: '🟢 Iniciante — Artigo SEO', text: 'Use o AI Article Writer do Writesonic. Keyword: [palavra-chave]. Tom: [profissional/casual]. Extensão: 2000 palavras.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Conteúdo em lote', text: 'Gere 10 artigos de blog sobre [nicho] usando keywords diferentes. Para cada artigo: título SEO + meta description + outline.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Estratégia de conteúdo SEO', text: 'Crie uma estratégia de conteúdo de 6 meses com cluster de keywords, pillar pages e artigos de suporte para dominar [nicho] organicamente.' },
        ],
        monetization: [
          'Serviço de blog posts otimizados para SEO (R$200-500 por artigo)',
          'Agência de conteúdo SEO usando Writesonic (R$3.000-10.000/mês por cliente)',
          'Curso de SEO com IA (R$197-497)',
        ],
      },
      {
        key: 'notionai', name: 'Notion AI', url: 'https://notion.so', urlLabel: 'notion.so', badge: 'Produtividade',
        desc: 'IA integrada ao Notion para criar, resumir e organizar documentos diretamente no workspace.',
        ...ebookDefaults('Notion AI', 'Notion AI é a inteligência artificial integrada diretamente no Notion, permitindo criar, resumir, traduzir e organizar documentos sem sair do workspace. Ideal para equipes que já usam Notion e querem adicionar IA ao fluxo de trabalho existente.'),
        stats: [{ num: 'US$8', lbl: 'por mês' }, { num: 'Nativo', lbl: 'no workspace' }, { num: 'Docs', lbl: 'integrado' }],
        prompts: [
          { label: '🟢 Iniciante — Resumir página', text: 'Selecione qualquer texto no Notion → clique em "Ask AI" → "Summarize". A IA resume o conteúdo em 3-5 pontos.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Base de conhecimento', text: 'Use Notion AI Q&A para responder perguntas sobre toda sua base de documentos no Notion. Configure como wiki inteligente da empresa.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Automação de docs', text: 'Configure templates de Notion com AI blocks que geram automaticamente seções de documentos (resumo, action items, follow-up) quando uma nova página é criada.' },
        ],
        monetization: [
          'Ofereça setup de Notion + IA para empresas (R$2.000-5.000)',
          'Crie e venda templates de Notion com IA integrada (R$47-197)',
          'Consultoria de produtividade com Notion AI (R$200-400/hora)',
        ],
      },
    ],
  },
  {
    key: 'imagens',
    label: 'Imagens & Design',
    accent: '#7C3AED',
    accentLight: '#EEEDFE',
    accentDark: '#3C3489',
    introTitle: 'Imagens & Design com IA',
    introText: 'Ferramentas de imagem com IA transformaram o design para empreendedores. Você não precisa mais de um designer para criar visuais profissionais.',
    whenTags: ['Posts para Instagram', 'Logos e identidade visual', 'Mockups de produtos', 'Banners para anúncios'],
    stats: [{ num: '6', lbl: 'ferramentas' }, { num: '10×', lbl: 'mais rápido' }, { num: '$0', lbl: 'sem designer' }],
    tools: [
      {
        key: 'midjourney', name: 'Midjourney', url: 'https://midjourney.com', urlLabel: 'midjourney.com', badge: 'Imagens IA',
        desc: 'O gerador de imagens IA mais qualificado do mercado. Imagens fotorrealistas impressionantes.',
        fullDesc: 'Midjourney é o gerador de imagens IA com maior qualidade artística do mercado. Produz imagens fotorrealistas, ilustrações, arte conceitual e design gráfico que são indistinguíveis de trabalhos profissionais. Versão 6.1 trouxe melhorias significativas em textos dentro de imagens e realismo.',
        whenToUse: ['Criar imagens fotorrealistas para anúncios', 'Gerar mockups de produtos antes da produção', 'Criar arte conceitual e identidade visual', 'Produzir imagens para posts de redes sociais', 'Design de embalagens e materiais gráficos'],
        steps: [
          { title: 'Crie conta no Discord', text: 'Midjourney funciona dentro do Discord. Crie conta em discord.com se não tiver.' },
          { title: 'Acesse midjourney.com', text: 'Assine um plano (a partir de US$10/mês). Não existe plano gratuito atualmente.' },
          { title: 'Use o comando /imagine', text: 'No Discord ou no site, digite /imagine seguido do seu prompt em inglês.' },
          { title: 'Refine com parâmetros', text: 'Use --ar (aspect ratio), --v (versão), --style raw (realismo), --q (qualidade) para controlar o resultado.' },
        ],
        tip: 'Sempre escreva prompts em inglês e use --style raw para fotos realistas e --v 6.1 para a melhor qualidade.',
        prompts: [
          { label: '🟢 Iniciante — Foto de produto', text: 'Professional product photography of [produto], pure white background, soft studio lighting, ultra realistic, commercial photography, 8k --ar 1:1 --v 6.1 --style raw' },
          { label: '🟢 Iniciante — Post Instagram', text: 'Modern minimalist social media post design, [tema], clean typography, gradient background, professional layout --ar 1:1 --v 6.1' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Cena lifestyle', text: 'Lifestyle photography of [pessoa usando produto], natural lighting, modern apartment, candid moment, shot on Sony A7III, depth of field, warm tones --ar 4:5 --v 6.1 --style raw' },
          { label: '🟡 Intermediário — Identidade visual', text: 'Modern minimalist logo design for [marca], [estilo: geometric/organic/typography], professional brand identity, vector style, clean lines --ar 1:1 --v 6.1' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Campanha visual completa', text: 'Gere uma série visual coesa: 1) Hero image para landing page (--ar 16:9) 2) 4 posts sociais (--ar 1:1) 3) Banner de anúncio (--ar 9:16) usando a mesma estética: [descreva estilo]. Use --seed para manter consistência visual.' },
          { label: '🔴 Avançado — Mockup de embalagem', text: 'Photorealistic 3D product packaging mockup of [produto], [material: kraft/glass/plastic], modern design, studio lighting, floating in space, commercial photography --ar 3:4 --v 6.1 --style raw' },
        ],
        useCases: [
          { title: 'E-commerce de cosméticos', text: 'Cria imagens de produto fotorrealistas para novos lançamentos antes mesmo da produção, testando o interesse do público.', result: 'Economizou R$15.000 em fotografia de produto por coleção' },
          { title: 'Agência de social media', text: 'Produz 20 imagens originais por semana para feeds de clientes, sem banco de imagens.', result: 'Engajamento médio subiu 45% com imagens originais' },
        ],
        commonErrors: [
          { erro: 'Escrever prompts em português', fix: 'O Midjourney funciona muito melhor com prompts em inglês. Sempre escreva em inglês.' },
          { erro: 'Prompts longos demais', fix: 'Seja direto e use palavras-chave de fotografia/design em vez de frases longas.' },
          { erro: 'Ignorar parâmetros', fix: 'Use --ar, --v, --style raw, --q para controlar aspect ratio, versão e estilo.' },
        ],
        stats: [{ num: '15M+', lbl: 'usuários' }, { num: 'v6.1', lbl: 'mais recente' }, { num: '60s', lbl: 'por 4 imagens' }],
        pricing: [
          { name: 'Basic', price: 'US$10', period: '/mês', features: ['~200 gerações/mês', 'Acesso à comunidade'] },
          { name: 'Standard', price: 'US$30', period: '/mês', destaque: true, features: ['~900 gerações/mês', 'Modo Stealth', 'Gerações ilimitadas relaxed'] },
        ],
        monetization: [
          'Venda serviço de criação de imagens para marketing (R$50-200 por imagem)',
          'Crie e venda packs de prompts no Gumroad (R$27-97)',
          'Ofereça serviço de identidade visual com IA (R$1.500-5.000)',
          'Crie estampas e designs para print-on-demand (royalties passivos)',
          'Venda fotos geradas em bancos de imagem (renda passiva)',
        ],
        automations: [
          'Midjourney + Canva: Gere imagens no Midjourney e finalize design no Canva',
          'Midjourney + Remove.bg: Gere produto e remova fundo para e-commerce',
          'Midjourney + ChatGPT: Use ChatGPT para criar prompts otimizados para Midjourney',
          'Midjourney + Photoshop: Refine detalhes e adicione texto nas imagens geradas',
        ],
        checklist: [
          'Criar conta no Discord e Midjourney',
          'Assinar plano Basic (US$10/mês)',
          'Gerar primeira imagem com /imagine',
          'Testar parâmetros: --ar, --v, --style raw',
          'Criar 5 imagens de produto para seu negócio',
          'Salvar prompts que funcionam em documento',
          'Testar upscale e variações de imagens',
        ],
        imageDescriptions: [
          { title: 'Interface do Midjourney', desc: 'Print da interface web do Midjourney mostrando a grade de 4 imagens geradas a partir de um prompt.' },
          { title: 'Prompt e resultado', desc: 'Print lado a lado: prompt escrito à esquerda e a imagem fotorrealista gerada à direita.' },
          { title: 'Parâmetros', desc: 'Infográfico mostrando os principais parâmetros: --ar (aspect ratio), --v (versão), --style raw, --q (qualidade), --seed (consistência).' },
        ],
      },
      {
        key: 'dalle', name: 'DALL-E 3', url: 'https://chatgpt.com', urlLabel: 'chatgpt.com', badge: 'Imagens IA',
        desc: 'Gerador de imagens integrado ao ChatGPT. Excelente para quem já usa o ChatGPT.',
        ...ebookDefaults('DALL-E 3', 'DALL-E 3 é o gerador de imagens da OpenAI, integrado diretamente ao ChatGPT. Sua maior vantagem é aceitar prompts em linguagem natural (inclusive em português) e iteração conversacional — você pode pedir ajustes como "mude a cor para azul" ou "adicione um logo no canto".'),
        stats: [{ num: 'ChatGPT', lbl: 'integrado' }, { num: 'PT-BR', lbl: 'aceita prompts' }, { num: 'Texto', lbl: 'em imagens' }],
        prompts: [
          { label: '🟢 Iniciante — Imagem simples', text: 'Crie uma imagem de [descrição] com estilo [fotográfico/ilustração/minimalista]. Fundo [cor/tipo]. Formato quadrado.' },
          { label: '🟢 Iniciante — Logo', text: 'Crie um logo minimalista para [nome da marca]. Área: [nicho]. Estilo: [moderno/clássico/divertido]. Cores: [cores]. Fundo branco.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Série visual', text: 'Crie 4 imagens com o mesmo estilo visual para um carrossel de Instagram sobre [tema]. Mantenha paleta de cores e estilo consistente.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Campanha visual', text: 'Crie uma identidade visual completa: 1 logo, 1 banner para site (16:9), 3 posts para Instagram (1:1), e 1 capa de e-book (3:4). Tudo com a mesma paleta de cores e estilo visual.' },
        ],
        monetization: [
          'Crie logos e identidade visual para pequenos negócios (R$500-2.000)',
          'Produza ilustrações para livros infantis (R$2.000-5.000 por livro)',
          'Ofereça serviço de criação de posts visuais para redes sociais (R$500-1.500/mês)',
        ],
      },
      {
        key: 'canva', name: 'Canva', url: 'https://canva.com', urlLabel: 'canva.com', badge: 'Design',
        desc: 'Plataforma de design mais popular do mundo, agora com IA integrada para criar e editar.',
        fullDesc: 'Canva é a plataforma de design mais popular do mundo com 150M+ de usuários, agora turbinada com funcionalidades de IA: Magic Design (gera designs a partir de texto), Magic Write (copywriting), Magic Edit (edição de fotos com IA), Background Remover, e muito mais.',
        whenToUse: ['Criar posts para redes sociais', 'Design de apresentações e pitch decks', 'Material de marketing (folders, banners, flyers)', 'Edição rápida de fotos', 'Criação de vídeos simples'],
        steps: [
          { title: 'Crie conta gratuita', text: 'Acesse canva.com. O plano gratuito já oferece milhares de templates.' },
          { title: 'Use Magic Design', text: 'Descreva o que precisa e o Canva gera designs automaticamente com IA.' },
          { title: 'Personalize templates', text: 'Escolha um template e personalize cores, fontes, imagens e textos.' },
          { title: 'Exporte em alta qualidade', text: 'Baixe em PNG, JPG, PDF ou publique diretamente nas redes sociais.' },
        ],
        tip: 'O Canva Pro (R$34,99/mês) vale muito a pena: desbloqueia Background Remover, Magic Edit, e milhões de elementos premium.',
        prompts: [
          { label: '🟢 Iniciante — Post com Magic Design', text: 'No Canva, clique em "Magic Design" e descreva: "Post de Instagram sobre [tema] com estilo [moderno/minimalista/vibrante]".' },
          { label: '🟢 Iniciante — Apresentação', text: 'Use Magic Design para criar apresentação sobre [tema]. Selecione template e personalize com suas informações.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Brand Kit', text: 'Configure seu Brand Kit no Canva com: logo, paleta de cores (hex), fontes e tom. Todos os designs gerados seguirão sua identidade.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Automação com Canva', text: 'Use Canva Bulk Create para gerar 100+ designs de uma vez a partir de uma planilha CSV com dados variáveis (nomes, preços, descrições).' },
        ],
        useCases: [
          { title: 'Social media manager', text: 'Cria 30 posts por mês para 5 clientes usando templates e Magic Design, sem precisar de designer.', result: 'Atende 5 clientes sozinha, faturando R$7.500/mês' },
          { title: 'Restaurante local', text: 'Dono do restaurante cria cardápio, posts e stories sem contratar designer.', result: 'Economia de R$2.000/mês com designer freelancer' },
        ],
        commonErrors: [
          { erro: 'Usar templates sem personalizar', fix: 'Sempre mude cores, fontes e textos para refletir sua marca. Templates genéricos parecem... genéricos.' },
          { erro: 'Ignorar o Brand Kit', fix: 'Configure seu Brand Kit para manter consistência visual em todos os designs.' },
        ],
        stats: [{ num: '150M+', lbl: 'usuários' }, { num: 'Free', lbl: 'plano grátis' }, { num: 'Magic', lbl: 'IA integrada' }],
        monetization: [
          'Ofereça serviço de social media design (R$800-2.500/mês por cliente)',
          'Crie e venda templates no Canva Marketplace',
          'Produza material de marketing para pequenos negócios (R$300-1.000/projeto)',
          'Monte curso "Canva para Empreendedores" (R$97-297)',
        ],
        automations: [
          'Canva + Buffer/Later: Crie e agende posts diretamente',
          'Canva Bulk Create + Google Sheets: Gere designs em massa a partir de dados',
          'Canva + ChatGPT: Gere textos no ChatGPT e aplique nos designs do Canva',
          'Canva + Midjourney: Use imagens do Midjourney como base para designs no Canva',
        ],
        checklist: ['Criar conta no Canva', 'Configurar Brand Kit', 'Testar Magic Design', 'Criar primeiro post para redes sociais', 'Explorar Bulk Create', 'Testar publicação direta nas redes'],
        imageDescriptions: [
          { title: 'Magic Design', desc: 'Print mostrando o recurso Magic Design gerando um post de Instagram a partir de uma descrição de texto.' },
          { title: 'Editor do Canva', desc: 'Print do editor mostrando um design sendo personalizado com Brand Kit aplicado.' },
        ],
      },
      {
        key: 'adobe-firefly', name: 'Adobe Firefly', url: 'https://firefly.adobe.com', urlLabel: 'firefly.adobe.com', badge: 'Design Pro',
        desc: 'IA generativa da Adobe, segura para uso comercial e integrada ao Photoshop.',
        ...ebookDefaults('Adobe Firefly', 'Adobe Firefly é a IA generativa da Adobe, treinada exclusivamente com imagens licenciadas, tornando-a 100% segura para uso comercial. Integrada ao Photoshop, Illustrator e outros apps Adobe, permite edição generativa avançada diretamente nas ferramentas que profissionais já usam.'),
        stats: [{ num: 'CC', lbl: 'integrado' }, { num: '100%', lbl: 'uso comercial' }, { num: 'Pro', lbl: 'qualidade' }],
        prompts: [
          { label: '🟢 Iniciante — Gerar imagem', text: 'No Firefly, descreva: "[cena] com estilo [fotográfico/artístico], iluminação [natural/estúdio], cores [vibrantes/suaves]".' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Generative Fill', text: 'No Photoshop, selecione uma área da imagem e use Generative Fill para adicionar/remover/modificar elementos com IA.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Batch editing', text: 'Use Firefly API para processar 100+ imagens automaticamente: remover fundos, aplicar estilo consistente e gerar variações.' },
        ],
        monetization: [
          'Serviço de edição de fotos profissional com IA (R$50-300 por imagem)',
          'Retoque de fotos em lote para e-commerce (R$5-20 por imagem em volume)',
          'Criação de mockups e composições comerciais (R$500-2.000)',
        ],
      },
      {
        key: 'leonardo', name: 'Leonardo.ai', url: 'https://leonardo.ai', urlLabel: 'leonardo.ai', badge: 'Imagens IA',
        desc: 'Gerador de imagens com controle avançado, ideal para game design e ilustrações.',
        ...ebookDefaults('Leonardo.ai', 'Leonardo.ai oferece geração de imagens com nível excepcional de controle: ControlNet, img2img, modelos customizados e fine-tuning. Ideal para quem precisa de controle preciso sobre composição, estilo e consistência visual, especialmente em game design, ilustração e concept art.'),
        stats: [{ num: '150', lbl: 'tokens/dia grátis' }, { num: 'Pro', lbl: 'controle avançado' }, { num: 'Train', lbl: 'modelos custom' }],
        prompts: [
          { label: '🟢 Iniciante — Ilustração', text: 'Crie uma ilustração de [tema] no estilo [cartoon/realista/anime] com cores [vibrantes/pastel]. Fundo [tipo].' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Consistência de personagem', text: 'Use image-to-image para manter consistência de personagem em múltiplas cenas e poses.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Fine-tuning', text: 'Treine um modelo customizado com 10-20 imagens do seu estilo/marca para gerar imagens com identidade visual consistente.' },
        ],
        monetization: [
          'Crie assets visuais para jogos (R$1.000-10.000 por pack)',
          'Ofereça serviço de concept art com IA (R$300-1.500 por projeto)',
          'Venda packs de personagens e cenários (R$47-197)',
        ],
      },
      {
        key: 'remove-bg', name: 'Remove.bg', url: 'https://remove.bg', urlLabel: 'remove.bg', badge: 'Utilidade',
        desc: 'Remove fundos de imagens automaticamente em 5 segundos com resultado perfeito.',
        ...ebookDefaults('Remove.bg', 'Remove.bg é a ferramenta mais rápida e precisa para remover fundos de imagens. Em 5 segundos, transforma qualquer foto em imagem com fundo transparente, perfeita para e-commerce, marketing e design. Detecta bordas com precisão, inclusive em cabelos e objetos complexos.'),
        stats: [{ num: '5s', lbl: 'por imagem' }, { num: 'Free', lbl: 'resolução baixa' }, { num: 'API', lbl: 'automação' }],
        prompts: [
          { label: '🟢 Iniciante — Remover fundo', text: 'Acesse remove.bg → faça upload da imagem → baixe o resultado com fundo transparente. Simples assim.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Lote de imagens', text: 'Use o desktop app do Remove.bg para processar pasta inteira de fotos de produto de uma vez.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — API automatizada', text: 'Integre a API do Remove.bg no seu fluxo: quando foto é adicionada → remove fundo → salva versão transparente → aplica fundo padrão da marca.' },
        ],
        monetization: [
          'Serviço de tratamento de fotos para e-commerce (R$3-10 por imagem em volume)',
          'Pacote de edição de fotos de produto (R$200-500 por 50 fotos)',
        ],
      },
    ],
  },
  {
    key: 'video',
    label: 'Vídeo & Apresentações',
    accent: '#D85A30',
    accentLight: '#FAECE7',
    accentDark: '#993C1D',
    introTitle: 'Vídeo & Apresentações com IA',
    introText: 'Criar vídeos profissionais e apresentações de impacto nunca foi tão acessível. Com IA, você produz conteúdo audiovisual sem câmera, editor ou designer.',
    whenTags: ['Vídeos para redes sociais', 'Apresentações de produto', 'Treinamentos', 'Pitch decks'],
    stats: [{ num: '6', lbl: 'ferramentas' }, { num: '5min', lbl: 'para criar vídeo' }],
    tools: [
      {
        key: 'gamma', name: 'Gamma', url: 'https://gamma.app', urlLabel: 'gamma.app', badge: 'Apresentações IA',
        desc: 'Gera apresentações completas a partir de texto. O "PowerPoint do futuro".',
        fullDesc: 'Gamma é uma plataforma que gera apresentações profissionais completas a partir de texto simples. Diferente do PowerPoint, o Gamma cuida do design automaticamente — você foca no conteúdo e a IA faz o resto: layout, cores, imagens e animações.',
        whenToUse: ['Criar pitch decks para investidores', 'Apresentações de produto para clientes', 'Material de treinamento para equipe', 'Propostas comerciais visuais'],
        steps: [
          { title: 'Acesse gamma.app', text: 'Crie conta gratuita. Você recebe créditos para gerar apresentações.' },
          { title: 'Descreva seu conteúdo', text: 'Cole ou escreva o conteúdo da apresentação. A IA vai estruturar automaticamente.' },
          { title: 'Escolha estilo visual', text: 'Selecione um tema visual entre as opções. A IA aplica design consistente.' },
          { title: 'Edite e exporte', text: 'Ajuste textos e imagens se necessário. Exporte como PDF, PPTX ou compartilhe link.' },
        ],
        tip: 'Cole um briefing detalhado no Gamma e deixe a IA criar a estrutura. Depois ajuste apenas os detalhes.',
        prompts: [
          { label: '🟢 Iniciante — Apresentação simples', text: 'Crie uma apresentação de [número] slides sobre [tema]. Para cada slide: título + 3 bullet points + sugestão de imagem.' },
          { label: '🟢 Iniciante — Pitch deck', text: 'No Gamma, descreva: "Pitch deck para [startup/produto]. Problema → Solução → Mercado → Modelo de negócio → Tração → Time → Pedido".' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Treinamento', text: 'Crie material de treinamento interativo sobre [tema] com 15 cards: conceitos, exemplos, quiz e resumo.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Sales deck dinâmico', text: 'Crie um sales deck customizável onde cada seção pode ser ativada/desativada conforme o prospect: cases por indústria, features por necessidade, pricing por porte.' },
        ],
        useCases: [
          { title: 'Startup em captação', text: 'Criou pitch deck profissional em 15 minutos que impressionou investidores pelo design.', result: 'Captou R$500K em rodada seed' },
          { title: 'Consultoria de gestão', text: 'Gera propostas comerciais visuais para cada prospect em 10 minutos.', result: 'Taxa de conversão subiu 40%' },
        ],
        commonErrors: [
          { erro: 'Slides com muito texto', fix: 'Mantenha no máximo 3-5 pontos por slide. Use o formato de cards do Gamma a seu favor.' },
          { erro: 'Não escolher tema adequado', fix: 'O tema visual deve combinar com o tom da apresentação: formal para investidores, criativo para marketing.' },
        ],
        stats: [{ num: 'Free', lbl: 'plano grátis' }, { num: '10s', lbl: 'por slide' }, { num: 'AI', lbl: 'design automático' }],
        monetization: [
          'Crie e venda templates de pitch deck (R$47-197)',
          'Ofereça serviço de criação de apresentações (R$500-3.000 por deck)',
          'Monte curso "Apresentações que Vendem com IA" (R$197-497)',
          'Crie material de treinamento para empresas (R$2.000-8.000)',
        ],
        automations: [
          'Gamma + ChatGPT: Crie o conteúdo no ChatGPT e gere a apresentação no Gamma',
          'Gamma + Notion: Transforme docs do Notion em apresentações',
          'Gamma + Google Docs: Converta documentos em decks visuais',
        ],
        checklist: ['Criar conta no Gamma', 'Gerar primeira apresentação de teste', 'Testar diferentes temas visuais', 'Criar pitch deck do seu negócio', 'Exportar em PDF e PPTX', 'Testar compartilhamento por link'],
        imageDescriptions: [
          { title: 'Interface do Gamma', desc: 'Print mostrando o editor do Gamma com cards de apresentação e opções de design à direita.' },
          { title: 'Resultado final', desc: 'Print de uma apresentação finalizada mostrando design profissional automático.' },
        ],
      },
      {
        key: 'descript', name: 'Descript', url: 'https://descript.com', urlLabel: 'descript.com', badge: 'Editor IA',
        desc: 'Editor de vídeo e podcast que funciona como um Google Docs — edite vídeo editando texto.',
        ...ebookDefaults('Descript', 'Descript revolucionou a edição de vídeo: você edita o vídeo editando o texto da transcrição. Delete uma palavra no texto e ela some do vídeo. Inclui remoção de "ãhs", silêncios, eye contact correction, e clonagem de voz para corrigir erros de gravação.'),
        stats: [{ num: 'Text', lbl: 'edição por texto' }, { num: 'Free', lbl: 'plano grátis' }, { num: 'AI', lbl: 'voice clone' }],
        prompts: [
          { label: '🟢 Iniciante — Edição básica', text: 'Importe vídeo → espere transcrição → delete trechos indesejados no texto → use "Remove filler words" para limpar "ãhs".' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Green screen IA', text: 'Use "Studio Sound" para melhorar áudio e "Green Screen" IA para trocar fundo sem tela verde.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Clone de voz', text: 'Clone sua voz no Descript e use para corrigir erros de gravação ou gerar novas frases sem regravar.' },
        ],
        monetization: [
          'Serviço de edição de vídeos e podcasts (R$200-1.000 por vídeo)',
          'Edição de vídeos em lote para criadores de conteúdo (R$1.500-5.000/mês)',
          'Curso de edição de vídeo com IA (R$197-497)',
        ],
      },
      {
        key: 'pictory', name: 'Pictory', url: 'https://pictory.ai', urlLabel: 'pictory.ai', badge: 'Artigo → Vídeo',
        desc: 'Transforma artigos em vídeos prontos com narração IA e imagens de stock.',
        ...ebookDefaults('Pictory', 'Pictory transforma automaticamente artigos de blog, scripts e textos em vídeos prontos com narração IA, imagens de stock, legendas e música de fundo. Ideal para repurposing de conteúdo: um artigo vira vídeo para YouTube, Reels, TikTok e LinkedIn.'),
        stats: [{ num: 'Auto', lbl: 'artigo → vídeo' }, { num: 'AI', lbl: 'narração' }, { num: 'Stock', lbl: 'imagens' }],
        prompts: [
          { label: '🟢 Iniciante — Artigo para vídeo', text: 'Cole o URL do artigo do blog → Pictory extrai o conteúdo → gera vídeo com narração, imagens e legendas automaticamente.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Série de vídeos', text: 'Converta 10 artigos do blog em vídeos curtos para Reels/TikTok de uma vez.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Pipeline de conteúdo', text: 'Automatize: Novo artigo publicado → Pictory gera vídeo → Publicado automaticamente no YouTube e redes sociais.' },
        ],
        monetization: [
          'Serviço de repurposing: transforme artigos de clientes em vídeos (R$200-500 por vídeo)',
          'Pacote mensal de vídeos para redes sociais (R$1.500-4.000/mês)',
        ],
      },
      {
        key: 'heygen', name: 'HeyGen', url: 'https://heygen.com', urlLabel: 'heygen.com', badge: 'Avatar IA',
        desc: 'Cria vídeos com avatares humanos realistas que falam qualquer script.',
        ...ebookDefaults('HeyGen', 'HeyGen cria vídeos profissionais com avatares humanos ultrarrealistas que falam qualquer script em 40+ idiomas. Sem câmera, sem atores, sem estúdio. Ideal para treinamentos corporativos, vídeos de vendas, onboarding de clientes e conteúdo multilíngue.'),
        stats: [{ num: '100+', lbl: 'avatares' }, { num: '40+', lbl: 'idiomas' }, { num: 'Clone', lbl: 'seu avatar' }],
        prompts: [
          { label: '🟢 Iniciante — Vídeo com avatar', text: 'Escolha um avatar → cole seu script → selecione voz e idioma → gere o vídeo. Processo leva 2-5 minutos.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Avatar personalizado', text: 'Grave 2 minutos de vídeo seu → HeyGen cria seu clone digital → Use para gerar vídeos sem precisar gravar.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Vídeos multilíngues', text: 'Grave um vídeo em português → HeyGen traduz e dubla para 5 idiomas com lip-sync perfeito. Um vídeo vira 6.' },
        ],
        monetization: [
          'Serviço de vídeos corporativos com avatar IA (R$500-2.000 por vídeo)',
          'Pacote de vídeos de treinamento para empresas (R$5.000-20.000)',
          'Vídeos de vendas personalizados em escala (R$50-200 por vídeo)',
        ],
      },
      {
        key: 'runway', name: 'Runway', url: 'https://runwayml.com', urlLabel: 'runwayml.com', badge: 'Vídeo Gerado',
        desc: 'Plataforma profissional de geração e edição de vídeo com IA.',
        ...ebookDefaults('Runway', 'Runway é a plataforma mais avançada de geração de vídeo com IA. O Gen-3 Alpha gera vídeos fotorrealistas a partir de texto ou imagem. Também oferece ferramentas de edição como inpainting de vídeo, motion tracking, e green screen com IA.'),
        stats: [{ num: 'Gen-3', lbl: 'modelo avançado' }, { num: 'Pro', lbl: 'qualidade cinema' }, { num: '10s', lbl: 'por geração' }],
        prompts: [
          { label: '🟢 Iniciante — Texto para vídeo', text: 'Use Gen-3: "Cinematic shot of [cena], smooth camera movement, natural lighting, 4K quality".' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Imagem para vídeo', text: 'Faça upload de uma imagem → Gen-3 anima a imagem com movimento realista. Ideal para dar vida a fotos de produto.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Produção cinematográfica', text: 'Crie uma sequência de 5 shots para um comercial: establishing shot → close-up → ação → reação → CTA. Mantenha consistência visual entre shots.' },
        ],
        monetization: [
          'Produção de vídeos publicitários com IA (R$1.000-5.000 por vídeo)',
          'Criação de conteúdo visual para redes sociais (R$500-2.000/mês)',
          'Vídeos de produto para e-commerce (R$300-1.000 por vídeo)',
        ],
      },
      {
        key: 'beautifulai', name: 'Beautiful.ai', url: 'https://beautiful.ai', urlLabel: 'beautiful.ai', badge: 'Apresentações',
        desc: 'Apresentações que se formatam automaticamente. Design sempre perfeito.',
        ...ebookDefaults('Beautiful.ai', 'Beautiful.ai é uma plataforma de apresentações com design automático inteligente. Diferente do PowerPoint, cada elemento que você adiciona se posiciona automaticamente para manter o design perfeito. Impossível fazer uma apresentação feia no Beautiful.ai.'),
        stats: [{ num: 'Smart', lbl: 'slides' }, { num: 'Auto', lbl: 'formatação' }, { num: 'Team', lbl: 'colaboração' }],
        prompts: [
          { label: '🟢 Iniciante — Slide automático', text: 'Adicione um smart slide → escolha o tipo (título, lista, comparação, timeline) → adicione conteúdo → o design se ajusta automaticamente.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Template de marca', text: 'Configure seu Brand Theme com cores, fontes e logo. Todos os novos decks seguirão a identidade visual.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Analytics de apresentação', text: 'Use o analytics do Beautiful.ai para ver quanto tempo cada viewer gastou em cada slide. Otimize as apresentações com dados.' },
        ],
        monetization: [
          'Serviço de criação de decks corporativos (R$1.000-5.000)',
          'Templates de apresentação para nichos específicos (R$97-297)',
          'Treinamento de times em apresentações profissionais (R$3.000-10.000)',
        ],
      },
    ],
  },
  {
    key: 'produtividade',
    label: 'Produtividade',
    accent: '#1D9E75',
    accentLight: '#E1F5EE',
    accentDark: '#0F6E56',
    introTitle: 'Produtividade & Automação com IA',
    introText: 'Automatize tarefas repetitivas e libere tempo para o que realmente importa no seu negócio.',
    whenTags: ['Automação de processos', 'Gestão de projetos', 'CRM', 'Atendimento ao cliente'],
    stats: [{ num: '6', lbl: 'ferramentas' }, { num: '80%', lbl: 'menos trabalho manual' }],
    tools: [
      {
        key: 'make', name: 'Make (Integromat)', url: 'https://make.com', urlLabel: 'make.com', badge: 'Automação',
        desc: 'Plataforma visual de automação: conecte apps e crie fluxos sem programar.',
        fullDesc: 'Make (antigo Integromat) é a plataforma de automação mais visual e poderosa do mercado. Com interface drag-and-drop, você conecta qualquer app a qualquer app e cria fluxos automatizados complexos sem uma linha de código. Mais flexível que o Zapier e com preço mais acessível.',
        whenToUse: ['Automatizar processos repetitivos do negócio', 'Integrar ferramentas que não conversam entre si', 'Criar fluxos de trabalho automatizados', 'Processar dados entre múltiplas plataformas'],
        steps: [
          { title: 'Crie conta gratuita', text: 'Acesse make.com. O plano gratuito permite 1.000 operações/mês.' },
          { title: 'Crie seu primeiro cenário', text: 'Um cenário é um fluxo automatizado. Arraste módulos (apps) e conecte-os visualmente.' },
          { title: 'Configure trigger e ações', text: 'Escolha o que inicia o fluxo (trigger) e o que acontece depois (ações).' },
          { title: 'Teste e ative', text: 'Rode o cenário manualmente para testar. Se tudo ok, ative para rodar automaticamente.' },
        ],
        tip: 'Comece automatizando UMA tarefa simples que você faz repetidamente. Depois escale.',
        prompts: [
          { label: '🟢 Iniciante — Automação simples', text: 'Cenário: Quando novo lead preencher formulário (Google Forms) → Adicionar ao CRM (HubSpot) → Enviar e-mail de boas-vindas (Gmail).' },
          { label: '🟢 Iniciante — Backup automático', text: 'Cenário: Quando novo arquivo chegar no Gmail → Salvar anexo no Google Drive → Notificar no Slack.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Fluxo de vendas', text: 'Cenário: Lead qualificado no CRM → Criar proposta no Google Docs → Enviar por e-mail → Agendar follow-up no calendário → Mover no pipeline.' },
          { label: '🟡 Intermediário — Conteúdo automatizado', text: 'Cenário: Novo artigo no WordPress → Gerar posts para redes sociais com ChatGPT → Agendar no Buffer → Registrar em planilha.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Workflow complexo', text: 'Cenário com condições: Lead → Qualificar por score → Se score > 80: enviar para vendedor → Se score < 80: adicionar em sequência de nurturing → Se não respondeu em 3 dias: enviar follow-up automático.' },
          { label: '🔴 Avançado — Integração com IA', text: 'Cenário: Feedback do cliente (Typeform) → Analisar sentimento com ChatGPT → Se positivo: pedir review → Se negativo: alertar time de suporte → Registrar tudo no CRM.' },
        ],
        useCases: [
          { title: 'Agência digital', text: 'Automatizou todo o onboarding de clientes: contrato assinado → pasta criada → e-mails enviados → tasks criadas → briefing solicitado.', result: 'Economiza 5 horas por novo cliente' },
          { title: 'E-commerce', text: 'Automatizou pós-venda: pedido confirmado → e-mail com tracking → review request em 7 dias → cupom de recompra em 30 dias.', result: 'Recompra aumentou 35%' },
        ],
        commonErrors: [
          { erro: 'Criar automações muito complexas de uma vez', fix: 'Comece simples com 2-3 módulos. Teste, valide, depois adicione complexidade.' },
          { erro: 'Não tratar erros', fix: 'Sempre adicione módulos de tratamento de erro. Sem isso, uma falha em um módulo para todo o fluxo.' },
        ],
        stats: [{ num: '1000+', lbl: 'integrações' }, { num: 'Free', lbl: '1000 ops/mês' }, { num: 'Visual', lbl: 'drag-and-drop' }],
        monetization: [
          'Ofereça serviço de automação para empresas (R$2.000-10.000 por automação)',
          'Crie pacotes de automação por nicho (R$1.500-5.000/mês)',
          'Monte curso "Automação sem código com Make" (R$297-997)',
          'Consultoria de processos + automação (R$300-600/hora)',
          'Revenda automações prontas para nichos específicos',
        ],
        automations: [
          'Make + ChatGPT: Adicione IA em qualquer automação para processamento inteligente',
          'Make + Google Sheets: Use planilha como banco de dados da automação',
          'Make + Slack: Notificações inteligentes para o time',
          'Make + Stripe: Automatize processos de pagamento e billing',
        ],
        checklist: ['Criar conta no Make', 'Criar primeiro cenário com 2 módulos', 'Testar com dados reais', 'Adicionar tratamento de erros', 'Ativar para execução automática', 'Monitorar logs por 1 semana', 'Escalar para processos mais complexos'],
        imageDescriptions: [
          { title: 'Editor visual do Make', desc: 'Print do editor mostrando módulos conectados visualmente formando um fluxo de automação.' },
          { title: 'Cenário em execução', desc: 'Print mostrando um cenário rodando com dados fluindo entre módulos em tempo real.' },
          { title: 'Fluxo de automação', desc: 'Diagrama: Trigger (formulário) → Processamento (IA) → Ação (CRM) → Notificação (Slack) → Registro (Sheets).' },
        ],
      },
      {
        key: 'zapier', name: 'Zapier', url: 'https://zapier.com', urlLabel: 'zapier.com', badge: 'Automação',
        desc: 'A plataforma de automação mais popular, com milhares de integrações.',
        ...ebookDefaults('Zapier', 'Zapier é a plataforma de automação mais popular do mundo com 7.000+ integrações. Conecta praticamente qualquer app e cria fluxos automatizados (chamados "Zaps") com interface simples. Ideal para quem quer começar com automação sem complexidade.'),
        stats: [{ num: '7000+', lbl: 'apps' }, { num: 'Free', lbl: '100 tasks/mês' }, { num: 'Simple', lbl: 'interface intuitiva' }],
        prompts: [
          { label: '🟢 Iniciante — Primeiro Zap', text: 'Trigger: novo lead no formulário → Action: adicionar ao Mailchimp → Action: enviar notificação no Slack.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Multi-step Zap', text: 'Trigger: novo pedido → filtrar por valor > R$500 → criar task no Asana → enviar e-mail VIP → registrar em planilha.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Zapier + ChatGPT', text: 'Trigger: novo feedback → ChatGPT analisa sentimento → paths: positivo (pedir review), neutro (nada), negativo (alerta).' },
        ],
        monetization: [
          'Consultoria de automação com Zapier (R$1.500-5.000 por projeto)',
          'Gerenciamento contínuo de automações (R$1.000-3.000/mês)',
          'Curso de produtividade com Zapier (R$197-497)',
        ],
      },
      {
        key: 'reclaim', name: 'Reclaim.ai', url: 'https://reclaim.ai', urlLabel: 'reclaim.ai', badge: 'Calendário IA',
        desc: 'IA que organiza seu calendário automaticamente com base em prioridades.',
        ...ebookDefaults('Reclaim.ai', 'Reclaim.ai usa IA para organizar seu calendário automaticamente. Bloqueia tempo para trabalho focado, reorganiza reuniões quando surgem conflitos, e prioriza tarefas baseado em deadlines e importância. Integra com Google Calendar, Slack e ferramentas de gestão.'),
        stats: [{ num: 'Free', lbl: 'plano básico' }, { num: 'AI', lbl: 'auto-organiza' }, { num: 'Google', lbl: 'Calendar' }],
        prompts: [
          { label: '🟢 Iniciante — Setup inicial', text: 'Conecte Google Calendar → defina horário de trabalho → marque reuniões recorrentes → a IA organiza o resto automaticamente.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Habits', text: 'Configure "Habits" para bloquear tempo diário: 2h de deep work, 30min de e-mails, 1h de reuniões. A IA encontra os melhores horários.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Team scheduling', text: 'Configure Reclaim para toda a equipe: identifique horários ideais para reuniões que respeitam deep work de todos.' },
        ],
        monetization: [
          'Consultoria de produtividade usando Reclaim (R$200-500/sessão)',
          'Workshop de gestão de tempo com IA (R$97-297)',
        ],
      },
      {
        key: 'otter', name: 'Otter.ai', url: 'https://otter.ai', urlLabel: 'otter.ai', badge: 'Transcrição',
        desc: 'Transcreve reuniões em tempo real e gera resumos automaticamente.',
        ...ebookDefaults('Otter.ai', 'Otter.ai transcreve reuniões em tempo real com precisão excepcional. Integra com Zoom, Google Meet e Teams para transcrever automaticamente. Gera resumos, action items e permite buscar qualquer coisa dita em qualquer reunião passada.'),
        stats: [{ num: 'Real-time', lbl: 'transcrição' }, { num: 'Zoom', lbl: 'integrado' }, { num: 'AI', lbl: 'resumos' }],
        prompts: [
          { label: '🟢 Iniciante — Transcrição automática', text: 'Conecte Otter ao Zoom/Meet → a IA entra nas reuniões automaticamente → transcreve e gera resumo.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Action items', text: 'Configure para extrair automaticamente action items e enviar por e-mail para participantes após cada reunião.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Base de conhecimento', text: 'Use o Otter como base de conhecimento da empresa: busque qualquer informação discutida em qualquer reunião dos últimos meses.' },
        ],
        monetization: [
          'Serviço de transcrição e resumo de reuniões (R$100-300 por reunião)',
          'Setup de Otter para empresas (R$1.000-3.000)',
        ],
      },
      {
        key: 'clickup', name: 'ClickUp', url: 'https://clickup.com', urlLabel: 'clickup.com', badge: 'Gestão IA',
        desc: 'Plataforma de gestão de projetos com IA integrada para automação de tarefas e geração de conteúdo.',
        ...ebookDefaults('ClickUp', 'ClickUp é uma plataforma de gestão de projetos all-in-one com IA integrada. Combina tasks, docs, goals, time tracking, e dashboards em um só lugar. A IA do ClickUp gera resumos de projetos, escreve documentos e sugere automações.'),
        stats: [{ num: 'Free', lbl: 'plano grátis' }, { num: 'IA', lbl: 'integrada' }, { num: 'All-in-one', lbl: 'tudo em um' }],
        prompts: [
          { label: '🟢 Iniciante — Projeto novo', text: 'Crie um Space para [projeto] → use template → adicione tasks com IA → defina responsáveis e deadlines.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Automações', text: 'Configure automações: quando task muda de status → notificar responsável → atualizar dashboard → enviar relatório semanal.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — ClickUp + IA', text: 'Use ClickUp AI para: resumir projetos, gerar standups, criar docs de requirements e analisar produtividade da equipe.' },
        ],
        monetization: [
          'Consultoria de implementação de ClickUp (R$3.000-10.000)',
          'Templates de gestão de projetos (R$47-197)',
          'Treinamento de equipes (R$2.000-5.000)',
        ],
      },
      {
        key: 'calendly', name: 'Calendly', url: 'https://calendly.com', urlLabel: 'calendly.com', badge: 'Agendamento',
        desc: 'Automatize agendamentos de reuniões e elimine o vai e vem de e-mails.',
        ...ebookDefaults('Calendly', 'Calendly elimina o vai e vem de e-mails para agendar reuniões. Compartilhe seu link e as pessoas agendam no seu horário disponível. Integra com Google Calendar, Zoom, Stripe e CRMs.'),
        stats: [{ num: '10M+', lbl: 'usuários' }, { num: 'Free', lbl: 'plano básico' }, { num: 'Smart', lbl: 'scheduling' }],
        prompts: [
          { label: '🟢 Iniciante — Link de agendamento', text: 'Configure disponibilidade → personalize link → compartilhe com clientes. Pronto, zero e-mails de agendamento.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Workflows', text: 'Configure: confirmação automática → lembrete 24h antes → lembrete 1h antes → follow-up pós-reunião → pesquisa de satisfação.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Round robin + routing', text: 'Configure round robin para distribuir leads entre vendedores + routing baseado em tipo de reunião e qualificação do lead.' },
        ],
        monetization: [
          'Consultoria de setup de agendamento para equipes (R$1.000-3.000)',
          'Integração Calendly + CRM para empresas (R$2.000-5.000)',
        ],
      },
    ],
  },
  {
    key: 'dados',
    label: 'Dados & Pesquisa',
    accent: '#BA7517',
    accentLight: '#FAEEDA',
    accentDark: '#854F0B',
    introTitle: 'Dados & Pesquisa com IA',
    introText: 'Transforme dados em insights de negócio e pesquise com IA de forma mais eficiente.',
    whenTags: ['Pesquisa de mercado', 'Análise de dados', 'Business intelligence'],
    stats: [{ num: '6', lbl: 'ferramentas' }, { num: '10×', lbl: 'mais rápido' }],
    tools: [
      {
        key: 'perplexity', name: 'Perplexity AI', url: 'https://perplexity.ai', urlLabel: 'perplexity.ai', badge: 'Pesquisa IA',
        desc: 'Motor de pesquisa com IA que cita fontes. O "Google do futuro".',
        fullDesc: 'Perplexity AI é um motor de pesquisa com IA que fornece respostas completas com citação de fontes. Diferente do Google (que mostra links), o Perplexity lê os sites e sintetiza a informação em respostas diretas e verificáveis. Ideal para pesquisa de mercado, análise de concorrência e tomada de decisão.',
        whenToUse: ['Pesquisa de mercado e concorrência', 'Verificar dados e estatísticas com fontes', 'Pesquisa rápida para criação de conteúdo', 'Análise de tendências de mercado'],
        steps: [
          { title: 'Acesse perplexity.ai', text: 'Use sem criar conta ou crie conta gratuita para histórico de pesquisas.' },
          { title: 'Faça perguntas específicas', text: 'Em vez de keywords, faça perguntas completas como se estivesse conversando com um pesquisador.' },
          { title: 'Verifique as fontes', text: 'Cada resposta vem com fontes citadas. Clique nos números para verificar a informação original.' },
          { title: 'Use Focus modes', text: 'Escolha entre All, Academic, Writing, Math, etc. para respostas otimizadas para cada tipo de pesquisa.' },
        ],
        tip: 'Use Perplexity para pesquisa inicial rápida e depois aprofunde no ChatGPT ou Claude para análise e criação de conteúdo.',
        prompts: [
          { label: '🟢 Iniciante — Pesquisa rápida', text: 'Quais são as principais tendências de [nicho] no Brasil em 2024? Cite dados e fontes.' },
          { label: '🟢 Iniciante — Análise de concorrente', text: 'Faça uma análise do [concorrente]: modelo de negócio, pricing, diferenciais, pontos fracos e público-alvo.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Pesquisa de mercado', text: 'Qual o tamanho do mercado de [nicho] no Brasil? Cite dados de market research, crescimento anual e principais players.' },
          { label: '🟡 Intermediário — Benchmarking', text: 'Compare as 5 principais empresas de [setor]: preços, features, avaliações de clientes e posicionamento.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Análise completa', text: 'Crie um relatório de inteligência competitiva sobre [mercado] incluindo: SWOT analysis, Porter\'s 5 Forces, mapa de posicionamento, tendências e oportunidades. Cite todas as fontes.' },
        ],
        useCases: [
          { title: 'Consultor de negócios', text: 'Usa Perplexity para criar análises de mercado em 30 minutos que antes levavam dias de pesquisa.', result: 'Cobra R$3.000 por relatório que leva 1 hora para produzir' },
        ],
        commonErrors: [
          { erro: 'Usar como Google (pesquisa por keywords)', fix: 'Perplexity funciona melhor com perguntas completas e contextuais.' },
          { erro: 'Não verificar fontes', fix: 'Sempre clique nos números das citações para confirmar a informação na fonte original.' },
        ],
        stats: [{ num: 'Free', lbl: 'ilimitado' }, { num: 'Fontes', lbl: 'citadas' }, { num: 'Real-time', lbl: 'dados atuais' }],
        monetization: [
          'Serviço de pesquisa de mercado (R$1.500-5.000 por relatório)',
          'Análise de concorrência sob demanda (R$500-2.000)',
          'Newsletter curada com insights de mercado (R$29-97/mês)',
          'Consultoria de inteligência competitiva (R$300-600/hora)',
        ],
        automations: [
          'Perplexity + Notion: Organize pesquisas em base de conhecimento',
          'Perplexity + Google Docs: Crie relatórios estruturados automaticamente',
          'Perplexity + ChatGPT: Pesquise dados no Perplexity e analise no ChatGPT',
        ],
        checklist: ['Acessar perplexity.ai', 'Testar pesquisa com pergunta completa', 'Verificar fontes citadas', 'Testar Focus modes', 'Criar primeira análise de concorrência', 'Salvar pesquisas na biblioteca'],
        imageDescriptions: [
          { title: 'Interface do Perplexity', desc: 'Print da interface mostrando uma pesquisa com resposta detalhada e fontes citadas numeradas.' },
          { title: 'Focus modes', desc: 'Print mostrando as opções de Focus: All, Academic, Writing, Math, Video.' },
        ],
      },
      {
        key: 'julius', name: 'Julius AI', url: 'https://julius.ai', urlLabel: 'julius.ai', badge: 'Dados',
        desc: 'Analise planilhas e dados com linguagem natural. Cole CSV e faça perguntas.',
        ...ebookDefaults('Julius AI', 'Julius AI permite analisar dados e planilhas usando linguagem natural. Faça upload de CSV, Excel ou conecte banco de dados e faça perguntas como: "Qual produto vendeu mais em março?" ou "Crie um gráfico de vendas por região". Sem fórmulas, sem código.'),
        stats: [{ num: 'CSV', lbl: 'upload direto' }, { num: 'NL', lbl: 'linguagem natural' }, { num: 'Charts', lbl: 'gráficos auto' }],
        prompts: [
          { label: '🟢 Iniciante — Análise simples', text: 'Faça upload de planilha de vendas → pergunte: "Qual foi o faturamento total por mês? Crie um gráfico de barras."' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Insights', text: 'Analise esta planilha e identifique: top 5 produtos, tendência de crescimento, sazonalidade e anomalias.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Previsão', text: 'Com base nos dados históricos de 12 meses, crie uma previsão de vendas para os próximos 3 meses usando regressão.' },
        ],
        monetization: [
          'Serviço de análise de dados para PMEs (R$500-2.000 por análise)',
          'Dashboards e relatórios automatizados (R$1.500-5.000)',
          'Curso de análise de dados com IA (R$197-497)',
        ],
      },
      {
        key: 'consensus', name: 'Consensus', url: 'https://consensus.app', urlLabel: 'consensus.app', badge: 'Acadêmico',
        desc: 'Pesquisa científica com IA. Busca em 200M+ de artigos acadêmicos.',
        ...ebookDefaults('Consensus', 'Consensus é um motor de pesquisa acadêmica com IA que busca em 200M+ artigos científicos e sintetiza o consenso da comunidade científica sobre qualquer tema. Ideal para quem precisa de evidências científicas para fundamentar decisões, conteúdos ou produtos.'),
        stats: [{ num: '200M+', lbl: 'artigos' }, { num: 'Free', lbl: 'pesquisa básica' }, { num: 'Sci', lbl: 'papers completos' }],
        prompts: [
          { label: '🟢 Iniciante — Pesquisa científica', text: 'Pesquise: "Does [intervenção] improve [resultado]?" Consensus mostra o consenso dos estudos.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Revisão de literatura', text: 'Busque os 10 principais estudos sobre [tema] dos últimos 5 anos e crie uma síntese dos resultados.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Meta-análise', text: 'Identifique todos os estudos relevantes sobre [tema], compare metodologias e resultados para criar uma mini meta-análise.' },
        ],
        monetization: [
          'Pesquisa fundamentada para produtos de saúde/bem-estar (R$1.000-3.000)',
          'Conteúdo científico para blogs e marketing (R$300-800 por artigo)',
        ],
      },
      {
        key: 'notebooklm', name: 'NotebookLM', url: 'https://notebooklm.google.com', urlLabel: 'notebooklm.google.com', badge: 'Google AI',
        desc: 'IA do Google que analisa documentos, PDFs e vídeos e cria podcasts automáticos.',
        ...ebookDefaults('NotebookLM', 'NotebookLM é a ferramenta gratuita do Google que analisa seus documentos (PDFs, Google Docs, YouTube) e permite conversar com eles. O recurso mais impressionante: gera podcasts em áudio onde dois hosts IA discutem o conteúdo dos seus documentos.'),
        stats: [{ num: 'Free', lbl: 'do Google' }, { num: 'Podcast', lbl: 'automático' }, { num: 'PDF', lbl: 'análise' }],
        prompts: [
          { label: '🟢 Iniciante — Análise de PDF', text: 'Faça upload de PDF → pergunte: "Quais são os 5 pontos mais importantes deste documento?"' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Podcast automático', text: 'Faça upload de 3-5 documentos sobre [tema] → clique em "Generate Audio Overview" → ouça podcast IA de 10 min.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Base de conhecimento', text: 'Crie um notebook com todos os documentos da empresa (manuais, processos, FAQs) e use como base de conhecimento consultável.' },
        ],
        monetization: [
          'Crie podcasts automáticos para empresas (R$500-2.000)',
          'Serviço de análise de documentos técnicos (R$300-1.000)',
          'Treinamento de NotebookLM para equipes (R$1.000-3.000)',
        ],
      },
      {
        key: 'tableau', name: 'Tableau', url: 'https://tableau.com', urlLabel: 'tableau.com', badge: 'BI & Dados',
        desc: 'Plataforma de visualização de dados com IA para descobrir insights automaticamente.',
        ...ebookDefaults('Tableau', 'Tableau é a plataforma #1 de Business Intelligence e visualização de dados. Com "Ask Data", você faz perguntas em linguagem natural e recebe gráficos e dashboards automaticamente. Integra com qualquer fonte de dados e cria visualizações interativas impressionantes.'),
        stats: [{ num: '#1', lbl: 'em BI' }, { num: 'IA', lbl: 'Ask Data' }, { num: 'Pro', lbl: 'enterprise' }],
        prompts: [
          { label: '🟢 Iniciante — Ask Data', text: 'Conecte dados → pergunte: "Mostre vendas por região nos últimos 6 meses em um mapa de calor".' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Dashboard', text: 'Crie dashboard interativo com: faturamento total, vendas por produto, tendência mensal e top clientes.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Predictive analytics', text: 'Use Tableau com modelos preditivos para forecast de vendas, detecção de churn e otimização de pricing.' },
        ],
        monetization: [
          'Consultoria de BI com Tableau (R$5.000-20.000 por projeto)',
          'Dashboards sob demanda (R$2.000-8.000)',
          'Treinamento de equipes (R$3.000-10.000)',
        ],
      },
      {
        key: 'chatpdf', name: 'ChatPDF', url: 'https://chatpdf.com', urlLabel: 'chatpdf.com', badge: 'PDF IA',
        desc: 'Converse com qualquer PDF. Faça perguntas e extraia informações instantaneamente.',
        ...ebookDefaults('ChatPDF', 'ChatPDF permite conversar com qualquer documento PDF. Faça upload do arquivo e faça perguntas em linguagem natural. A IA lê o documento completo e responde com base no conteúdo, citando as páginas. Ideal para contratos, manuais, relatórios e artigos.'),
        stats: [{ num: 'Free', lbl: '3 PDFs/dia' }, { num: '120pg', lbl: 'por arquivo' }, { num: 'Fast', lbl: 'respostas instantâneas' }],
        prompts: [
          { label: '🟢 Iniciante — Perguntas ao PDF', text: 'Faça upload de PDF → pergunte: "Resuma este documento em 5 pontos" ou "Quais são as cláusulas mais importantes?"' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Análise comparativa', text: 'Faça upload de 2 contratos → pergunte: "Compare as condições de pagamento e multas entre os dois documentos".' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Extração de dados', text: 'Faça upload de relatório financeiro → extraia: receita, custos, margem, crescimento YoY e crie tabela comparativa.' },
        ],
        monetization: [
          'Serviço de análise de contratos (R$200-500 por documento)',
          'Resumos executivos de relatórios (R$100-300)',
        ],
      },
    ],
  },
  {
    key: 'trafego',
    label: 'Tráfego & SEO',
    accent: '#378ADD',
    accentLight: '#E6F1FB',
    accentDark: '#185FA5',
    introTitle: 'Tráfego & SEO com IA',
    introText: 'Aumente o tráfego orgânico e pago do seu site com ferramentas de IA para SEO e marketing.',
    whenTags: ['SEO on-page', 'Pesquisa de keywords', 'Link building'],
    stats: [{ num: '6', lbl: 'ferramentas' }],
    tools: [
      {
        key: 'surfer', name: 'Surfer SEO', url: 'https://surferseo.com', urlLabel: 'surferseo.com', badge: 'SEO',
        desc: 'Otimiza conteúdo para SEO em tempo real com score e sugestões de IA.',
        ...ebookDefaults('Surfer SEO', 'Surfer SEO é a ferramenta líder em otimização de conteúdo para SEO. Analisa os top 10 resultados do Google para sua keyword e dá um score em tempo real enquanto você escreve, sugerindo: palavras a incluir, quantidade ideal de headings, tamanho do artigo e mais.'),
        stats: [{ num: 'Score', lbl: 'SEO em tempo real' }, { num: 'NLP', lbl: 'análise semântica' }, { num: 'AI', lbl: 'Content Editor' }],
        prompts: [
          { label: '🟢 Iniciante — Análise de keyword', text: 'Crie Content Editor para [keyword] → Surfer analisa top 10 → mostra score e sugestões enquanto você escreve.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Audit de conteúdo', text: 'Use Content Audit para analisar artigo existente e receber sugestões de melhoria para subir no ranking.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Estratégia de cluster', text: 'Use Surfer para mapear cluster de keywords, criar pillar page + 10 artigos de suporte interligados.' },
        ],
        monetization: [
          'Serviço de otimização de artigos para SEO (R$200-500 por artigo)',
          'Auditoria de conteúdo SEO (R$1.500-5.000 por site)',
          'Agência de conteúdo SEO (R$3.000-15.000/mês)',
        ],
      },
      {
        key: 'semrush', name: 'Semrush', url: 'https://semrush.com', urlLabel: 'semrush.com', badge: 'SEO Pro',
        desc: 'Suíte completa de SEO e marketing digital com IA integrada.',
        ...ebookDefaults('Semrush', 'Semrush é a suíte mais completa de SEO e marketing digital. Oferece pesquisa de keywords, análise de concorrência, auditoria técnica, tracking de posições, análise de backlinks e ferramentas de conteúdo — tudo em uma plataforma.'),
        stats: [{ num: '25B+', lbl: 'keywords' }, { num: '#1', lbl: 'suíte SEO' }, { num: 'All-in-one', lbl: 'marketing' }],
        prompts: [
          { label: '🟢 Iniciante — Pesquisa de keyword', text: 'Use Keyword Magic Tool → digite [tema] → filtre por volume, dificuldade e intenção de busca.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Análise de concorrência', text: 'Use Domain Overview para [concorrente] → veja: tráfego, keywords, backlinks, anúncios ativos e estratégia de conteúdo.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Gap analysis', text: 'Use Keyword Gap para comparar seu domínio vs 3 concorrentes e encontrar keywords que eles rankeiam e você não.' },
        ],
        monetization: [
          'Consultoria de SEO usando Semrush (R$3.000-15.000/mês)',
          'Relatórios de SEO automatizados (R$500-2.000/mês)',
          'Curso de SEO completo com Semrush (R$497-1.997)',
        ],
      },
      {
        key: 'ahrefs', name: 'Ahrefs', url: 'https://ahrefs.com', urlLabel: 'ahrefs.com', badge: 'Backlinks',
        desc: 'Ferramenta premium de análise de backlinks e pesquisa de concorrentes.',
        ...ebookDefaults('Ahrefs', 'Ahrefs é a ferramenta mais respeitada para análise de backlinks e SEO. Possui o maior índice de backlinks do mercado (35 trilhões+), tornando-a indispensável para estratégias de link building, análise de concorrência e auditoria de sites.'),
        stats: [{ num: '35T', lbl: 'backlinks indexados' }, { num: '#1', lbl: 'backlink analysis' }, { num: 'Pro', lbl: 'SEO tool' }],
        prompts: [
          { label: '🟢 Iniciante — Análise de backlinks', text: 'Use Site Explorer → digite [seu site] → veja: DR, backlinks, referring domains e páginas mais linkadas.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Link building', text: 'Use Content Explorer para encontrar sites que linkam para concorrentes mas não para você. Crie lista de prospects para outreach.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Link gap', text: 'Compare backlinks de 3 concorrentes → identifique sites que linkam para 2+ concorrentes mas não para você → priorize outreach.' },
        ],
        monetization: [
          'Serviço de link building (R$2.000-10.000/mês)',
          'Auditoria de backlinks e SEO (R$1.500-5.000)',
          'Consultoria de SEO técnico (R$200-500/hora)',
        ],
      },
      {
        key: 'ubersuggest', name: 'Ubersuggest', url: 'https://neilpatel.com/ubersuggest', urlLabel: 'neilpatel.com/ubersuggest', badge: 'Keywords',
        desc: 'Ferramenta de Neil Patel para pesquisa de palavras-chave e análise de concorrência SEO.',
        ...ebookDefaults('Ubersuggest', 'Ubersuggest é a ferramenta de SEO criada por Neil Patel, oferecendo pesquisa de keywords, análise de concorrência e sugestões de conteúdo com um plano gratuito generoso. Ideal para quem está começando com SEO e não quer investir em ferramentas caras.'),
        stats: [{ num: 'Free', lbl: '3 buscas/dia' }, { num: 'Neil Patel', lbl: 'criador' }, { num: 'Budget', lbl: 'SEO acessível' }],
        prompts: [
          { label: '🟢 Iniciante — Pesquisa de keyword', text: 'Digite [tema] no Ubersuggest → veja: volume, dificuldade, CPC e sugestões de keywords relacionadas.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Content ideas', text: 'Use "Content Ideas" para ver quais artigos sobre [tema] têm mais tráfego e compartilhamentos.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Competitor analysis', text: 'Analise domínio do concorrente para ver: keywords que rankeia, tráfego estimado, páginas top e gaps de conteúdo.' },
        ],
        monetization: [
          'Serviço de pesquisa de keywords para PMEs (R$300-1.000)',
          'Estratégia de conteúdo SEO (R$1.500-5.000)',
        ],
      },
      {
        key: 'answerthepublic', name: 'AnswerThePublic', url: 'https://answerthepublic.com', urlLabel: 'answerthepublic.com', badge: 'Perguntas',
        desc: 'Descubra todas as perguntas que as pessoas fazem sobre qualquer tema no Google.',
        ...ebookDefaults('AnswerThePublic', 'AnswerThePublic mostra visualmente todas as perguntas, preposições e comparações que as pessoas fazem sobre qualquer tema no Google. Ideal para encontrar ideias de conteúdo baseadas em demanda real do público.'),
        stats: [{ num: 'Free', lbl: '3 buscas/dia' }, { num: 'Visual', lbl: 'mapa de perguntas' }, { num: 'Ideas', lbl: 'conteúdo' }],
        prompts: [
          { label: '🟢 Iniciante — Mapa de perguntas', text: 'Digite [tema] → veja: todas as perguntas (quem, o que, como, por que, quando, onde) que as pessoas fazem no Google.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Calendário editorial', text: 'Use as perguntas encontradas para criar um calendário editorial de 30 dias com 1 conteúdo por pergunta.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — FAQ strategy', text: 'Mapeie todas as perguntas do nicho → crie FAQ page otimizada para featured snippets → capture tráfego de perguntas.' },
        ],
        monetization: [
          'Pesquisa de conteúdo para blogs (R$200-500)',
          'Estratégia de FAQ e featured snippets (R$1.000-3.000)',
        ],
      },
      {
        key: 'screamingfrog', name: 'Screaming Frog', url: 'https://screamingfrog.co.uk', urlLabel: 'screamingfrog.co.uk', badge: 'Auditoria',
        desc: 'Crawler de SEO que audita sites inteiros e encontra problemas técnicos automaticamente.',
        ...ebookDefaults('Screaming Frog', 'Screaming Frog é o crawler de SEO mais usado por profissionais. Rastreia seu site inteiro e identifica: links quebrados, redirects, meta tags duplicadas, páginas sem indexação, problemas de velocidade e mais. A versão gratuita analisa até 500 URLs.'),
        stats: [{ num: '500', lbl: 'URLs grátis' }, { num: 'Pro', lbl: 'crawler' }, { num: 'Tech', lbl: 'SEO técnico' }],
        prompts: [
          { label: '🟢 Iniciante — Audit básico', text: 'Baixe o Screaming Frog → digite URL do site → clique Start → analise: erros 404, meta tags faltantes, redirects.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Audit completo', text: 'Exporte todos os dados → crie planilha de prioridades: erros críticos (404, 500) → melhorias (meta tags) → otimizações (velocidade).' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Automação de audit', text: 'Configure crawl agendado + exportação automática + comparação com crawl anterior para monitorar saúde do site continuamente.' },
        ],
        monetization: [
          'Auditoria técnica de SEO (R$1.500-5.000 por site)',
          'Monitoramento contínuo de SEO técnico (R$1.000-3.000/mês)',
          'Relatório de saúde do site (R$500-1.500)',
        ],
      },
    ],
  },
  {
    key: 'social',
    label: 'Social Media',
    accent: '#7C3AED',
    accentLight: '#EEEDFE',
    accentDark: '#3C3489',
    introTitle: 'Social Media com IA',
    introText: 'Gerencie redes sociais de forma mais inteligente com ferramentas de IA para criação e agendamento.',
    whenTags: ['Agendamento de posts', 'Análise de engajamento', 'Criação de conteúdo'],
    stats: [{ num: '6', lbl: 'ferramentas' }],
    tools: [
      {
        key: 'hootsuite', name: 'Hootsuite', url: 'https://hootsuite.com', urlLabel: 'hootsuite.com', badge: 'Social',
        desc: 'Plataforma de gestão de redes sociais com IA para melhor horário de postagem.',
        ...ebookDefaults('Hootsuite', 'Hootsuite é a plataforma de gestão de redes sociais mais completa, suportando 35+ redes. Com IA integrada (OwlyWriter AI), sugere melhores horários para postar, gera legendas e analisa performance de conteúdo.'),
        stats: [{ num: '35+', lbl: 'redes suportadas' }, { num: 'OwlyWriter', lbl: 'IA nativa' }, { num: 'Pro', lbl: 'analytics' }],
        prompts: [{ label: '🟢 Iniciante — Agendamento', text: 'Conecte suas redes → crie post → use "Best time to publish" → agende. A IA escolhe o melhor horário.' }],
        extraPrompts: [{ label: '🟡 Intermediário — OwlyWriter', text: 'Use OwlyWriter AI para gerar legendas otimizadas para cada rede a partir de um briefing.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Social listening', text: 'Configure monitoramento de menções e sentiment analysis para sua marca e concorrentes.' }],
        monetization: ['Gestão de redes sociais para empresas (R$1.500-5.000/mês)', 'Social media analytics e relatórios (R$500-1.500/mês)'],
      },
      {
        key: 'buffer', name: 'Buffer', url: 'https://buffer.com', urlLabel: 'buffer.com', badge: 'Social',
        desc: 'Agendamento simples e eficaz para redes sociais com analytics.',
        ...ebookDefaults('Buffer', 'Buffer é a ferramenta de agendamento de redes sociais mais simples e intuitiva. Ideal para empreendedores solo e pequenas equipes que precisam agendar posts sem complexidade. Inclui AI Assistant para gerar ideias e legendas.'),
        stats: [{ num: 'Free', lbl: '3 canais grátis' }, { num: 'Simple', lbl: 'interface limpa' }, { num: 'AI', lbl: 'assistant' }],
        prompts: [{ label: '🟢 Iniciante — Primeiro post', text: 'Conecte 3 redes grátis → escreva post → use AI Assistant para sugerir melhorias → agende.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Batch scheduling', text: 'Crie 30 posts de uma vez usando AI Assistant → agende para o mês inteiro com melhor horário automático.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Analytics + iteração', text: 'Analise quais posts performam melhor → use AI para criar variações dos top performers → escale o que funciona.' }],
        monetization: ['Gestão de redes sociais para MEIs (R$500-1.500/mês)', 'Pacote de agendamento e criação de conteúdo (R$800-2.500/mês)'],
      },
      {
        key: 'taplio', name: 'Taplio', url: 'https://taplio.com', urlLabel: 'taplio.com', badge: 'LinkedIn',
        desc: 'Ferramenta de IA especializada em crescimento no LinkedIn.',
        ...ebookDefaults('Taplio', 'Taplio é a ferramenta de IA #1 para crescimento no LinkedIn. Gera posts virais, analisa melhor horário, gerencia carrossel, e oferece banco de posts de alta performance para inspiração. Ideal para personal branding e social selling.'),
        stats: [{ num: 'LinkedIn', lbl: 'especialista' }, { num: 'AI', lbl: 'posts virais' }, { num: 'Growth', lbl: 'crescimento' }],
        prompts: [{ label: '🟢 Iniciante — Post LinkedIn', text: 'Use o gerador de posts do Taplio → escolha formato (lista, história, opinião) → forneça tema → gere e agende.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Carrossel', text: 'Crie carrossel de 10 slides sobre [tema] → Taplio formata automaticamente → agende no melhor horário.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Lead generation', text: 'Use Taplio para identificar prospects que interagem com posts do seu nicho → engaje → converta em leads.' }],
        monetization: ['Serviço de ghostwriting para LinkedIn (R$1.500-5.000/mês)', 'Gestão de perfil LinkedIn para executivos (R$2.000-8.000/mês)'],
      },
      {
        key: 'later', name: 'Later', url: 'https://later.com', urlLabel: 'later.com', badge: 'Instagram',
        desc: 'Plataforma de agendamento focada em Instagram com IA para melhor horário de postagem.',
        ...ebookDefaults('Later', 'Later é a plataforma de agendamento #1 para Instagram, com planejamento visual de feed, Linkin.bio (link na bio com múltiplos links) e IA para melhor horário de postagem. Suporta também TikTok, Twitter, Facebook e Pinterest.'),
        stats: [{ num: '#1', lbl: 'para Instagram' }, { num: 'Linkin.bio', lbl: 'link na bio' }, { num: 'Visual', lbl: 'planejamento de feed' }],
        prompts: [{ label: '🟢 Iniciante — Visual planner', text: 'Faça upload de 9 fotos → arraste para organizar o grid do Instagram → agende todas de uma vez.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Linkin.bio', text: 'Configure Linkin.bio para criar uma landing page na sua bio do Instagram com links para produtos, conteúdos e redes.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Analytics de hashtag', text: 'Use analytics de hashtag do Later para descobrir quais tags geram mais alcance e engajamento no seu nicho.' }],
        monetization: ['Gestão de Instagram para marcas (R$1.000-4.000/mês)', 'Setup de Linkin.bio otimizado (R$300-800)'],
      },
      {
        key: 'predis', name: 'Predis.ai', url: 'https://predis.ai', urlLabel: 'predis.ai', badge: 'Conteúdo IA',
        desc: 'Gera posts completos para redes sociais com texto, imagem e hashtags usando IA.',
        ...ebookDefaults('Predis.ai', 'Predis.ai gera posts completos para redes sociais com IA: texto + imagem + hashtags, tudo de uma vez. Você descreve o que quer e a IA cria o post pronto para publicar. Ideal para quem não tem tempo ou habilidade de design.'),
        stats: [{ num: 'IA', lbl: 'post completo' }, { num: 'Free', lbl: '15 posts/mês' }, { num: 'All', lbl: 'texto + imagem + #' }],
        prompts: [{ label: '🟢 Iniciante — Post completo', text: 'Descreva: "Post de Instagram sobre [tema] para [público]" → Predis gera texto, imagem e hashtags prontos.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Série de posts', text: 'Gere série de 10 posts sobre [tema] com identidade visual consistente → agende para 2 semanas.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Competidor analysis', text: 'Analise os posts dos concorrentes → identifique formatos de maior engajamento → crie posts similares otimizados.' }],
        monetization: ['Pacote de posts prontos para nichos (R$500-1.500/mês)', 'Serviço de social media express (R$300-800/semana)'],
      },
      {
        key: 'metricool', name: 'Metricool', url: 'https://metricool.com', urlLabel: 'metricool.com', badge: 'Analytics',
        desc: 'Plataforma de analytics e agendamento para todas as redes sociais em um só lugar.',
        ...ebookDefaults('Metricool', 'Metricool é uma plataforma all-in-one de analytics e agendamento para redes sociais, Google Ads e TikTok Ads. Oferece relatórios visuais, melhor horário para postar e comparação com concorrentes. Plano gratuito muito generoso.'),
        stats: [{ num: 'All-in-one', lbl: 'analytics' }, { num: 'Free', lbl: 'plano básico' }, { num: 'Ads', lbl: 'Google + Meta' }],
        prompts: [{ label: '🟢 Iniciante — Analytics', text: 'Conecte suas redes → veja dashboard unificado com métricas de todas as plataformas em um lugar.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Relatórios', text: 'Gere relatórios profissionais em PDF para enviar aos clientes com métricas de todas as redes.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Competitor tracking', text: 'Adicione 5 concorrentes → acompanhe crescimento, engajamento e estratégia de conteúdo deles automaticamente.' }],
        monetization: ['Relatórios de redes sociais para agências (R$300-800/mês por cliente)', 'Gestão de redes sociais all-in-one (R$1.500-4.000/mês)'],
      },
    ],
  },
  {
    key: 'ads',
    label: 'Ads & Performance',
    accent: '#D85A30',
    accentLight: '#FAECE7',
    accentDark: '#993C1D',
    introTitle: 'Ads & Performance com IA',
    introText: 'Otimize suas campanhas de anúncios pagos com IA para melhorar conversão e reduzir custos.',
    whenTags: ['Meta Ads', 'Google Ads', 'Otimização de conversão'],
    stats: [{ num: '6', lbl: 'ferramentas' }],
    tools: [
      {
        key: 'adcreative', name: 'AdCreative.ai', url: 'https://adcreative.ai', urlLabel: 'adcreative.ai', badge: 'Ads IA',
        desc: 'Gera criativos de anúncios otimizados para conversão com IA.',
        fullDesc: 'AdCreative.ai gera criativos de anúncios (imagem + copy) otimizados para conversão usando IA treinada em milhões de anúncios de alto desempenho. Dá um score de conversão preditivo para cada criativo, permitindo testar apenas os mais promissores.',
        whenToUse: ['Gerar criativos de anúncios rapidamente', 'Teste A/B de imagens de anúncio', 'Criar variações de criativos em escala', 'Otimizar taxa de conversão de anúncios'],
        steps: [
          { title: 'Crie conta', text: 'Acesse adcreative.ai e ative o trial de 7 dias.' },
          { title: 'Configure sua marca', text: 'Faça upload do logo, defina cores e estilo visual da marca.' },
          { title: 'Descreva o anúncio', text: 'Informe: produto, público, plataforma de destino (Meta, Google, etc.).' },
          { title: 'Gere e selecione', text: 'A IA gera 10+ criativos com score de conversão. Use os de maior score.' },
        ],
        tip: 'Sempre teste os criativos com score > 80. A IA do AdCreative acerta a previsão de conversão em 70%+ dos casos.',
        prompts: [
          { label: '🟢 Iniciante — Criativo básico', text: 'Configure marca → selecione "Ad Creative" → escolha formato (feed, stories, etc.) → descreva oferta → gere 10 variações.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Teste A/B', text: 'Gere 20 criativos → separe os top 5 por score → teste no Meta Ads → itere com base nos resultados.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Pipeline de criativos', text: 'Automatize: AdCreative gera 50 variações/semana → top 10 por score → teste em campanha → winners escalam → losers substituídos.' },
        ],
        useCases: [
          { title: 'Gestor de tráfego', text: 'Gera 100 criativos por semana para 5 clientes, testando apenas os de maior score preditivo.', result: 'CPA médio reduziu 35% em 2 meses' },
        ],
        commonErrors: [
          { erro: 'Ignorar o score de conversão', fix: 'O score é baseado em dados de milhões de ads. Priorize criativos com score > 80.' },
        ],
        stats: [{ num: '14×', lbl: 'mais conversão' }, { num: 'Score', lbl: 'preditivo' }, { num: 'AI', lbl: 'treinada em ads' }],
        monetization: [
          'Serviço de criativos de anúncio com IA (R$500-2.000/mês)',
          'Pacote de criativos para e-commerce (R$300-1.000 por 20 criativos)',
          'Gestão de performance + criativos (R$3.000-10.000/mês)',
        ],
        automations: ['AdCreative + Meta Ads: Suba criativos diretamente para campanhas', 'AdCreative + Google Ads: Gere responsive display ads otimizados', 'AdCreative + Zapier: Automatize o pipeline de criativos'],
        checklist: ['Criar conta e ativar trial', 'Configurar marca (logo, cores)', 'Gerar primeiros 10 criativos', 'Analisar scores de conversão', 'Testar top criativos em campanha real', 'Comparar resultados com criativos manuais'],
        imageDescriptions: [
          { title: 'Dashboard AdCreative', desc: 'Print mostrando criativos gerados com score de conversão ao lado de cada um.' },
          { title: 'Criativo gerado', desc: 'Print de um anúncio gerado pela IA com imagem, headline, copy e score.' },
        ],
      },
      {
        key: 'madgicx', name: 'Madgicx', url: 'https://madgicx.com', urlLabel: 'madgicx.com', badge: 'Meta Ads',
        desc: 'Plataforma de otimização de Meta Ads com IA para audiências e criativos.',
        ...ebookDefaults('Madgicx', 'Madgicx é uma plataforma de otimização de Meta Ads com IA. Oferece: audiências IA (cria públicos otimizados automaticamente), copy IA, automação de orçamento e relatórios avançados. Ideal para gestores de tráfego que querem escalar campanhas no Facebook e Instagram.'),
        stats: [{ num: 'Meta', lbl: 'especialista' }, { num: 'AI', lbl: 'audiências' }, { num: 'Auto', lbl: 'budget' }],
        prompts: [{ label: '🟢 Iniciante — Audiência IA', text: 'Conecte conta do Meta → Madgicx analisa dados → sugere audiências otimizadas baseadas em IA.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Budget automation', text: 'Configure regras de automação: se CPA > [meta] → reduzir budget. Se ROAS > [meta] → aumentar budget.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Full-funnel', text: 'Configure full-funnel automatizado: prospecção com lookalike IA → retargeting por engajamento → conversão com oferta → upsell.' }],
        monetization: ['Gestão de Meta Ads otimizada (R$2.000-10.000/mês)', 'Consultoria de performance Facebook/Instagram (R$300-600/hora)'],
      },
      {
        key: 'smartly', name: 'Smartly.io', url: 'https://smartly.io', urlLabel: 'smartly.io', badge: 'Enterprise',
        desc: 'Plataforma enterprise de automação de anúncios em múltiplas redes.',
        ...ebookDefaults('Smartly.io', 'Smartly.io é uma plataforma enterprise de automação de anúncios multi-plataforma (Meta, Google, TikTok, Pinterest, Snapchat). Ideal para grandes operações de mídia paga que precisam de automação em escala.'),
        stats: [{ num: 'Multi', lbl: 'plataformas' }, { num: 'Enterprise', lbl: 'nível' }, { num: 'Auto', lbl: 'otimização' }],
        prompts: [{ label: '🟢 Iniciante — Multi-platform', text: 'Configure campanha → Smartly distribui automaticamente orçamento entre Meta, Google e TikTok.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Dynamic creative', text: 'Configure criativos dinâmicos que mudam texto, imagem e CTA baseado no segmento do público.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Automated media buying', text: 'Configure regras de compra de mídia automatizada com otimização cross-platform baseada em IA.' }],
        monetization: ['Consultoria de mídia paga enterprise (R$10.000-50.000/mês)', 'Implementação de Smartly para empresas (R$20.000-50.000)'],
      },
      {
        key: 'unbounce', name: 'Unbounce', url: 'https://unbounce.com', urlLabel: 'unbounce.com', badge: 'Landing Pages',
        desc: 'Cria landing pages otimizadas para conversão com IA que testa variações automaticamente.',
        ...ebookDefaults('Unbounce', 'Unbounce cria landing pages otimizadas para conversão com Smart Traffic IA que direciona automaticamente cada visitante para a variação de página com maior probabilidade de conversão para aquele perfil. Sem testes A/B manuais.'),
        stats: [{ num: 'Smart', lbl: 'Traffic IA' }, { num: '30%+', lbl: 'mais conversão' }, { num: 'No-code', lbl: 'drag & drop' }],
        prompts: [{ label: '🟢 Iniciante — Landing page', text: 'Escolha template → personalize com suas informações → publique. Sem código necessário.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Smart Traffic', text: 'Crie 3-5 variações da landing page → ative Smart Traffic → a IA direciona cada visitante para a melhor versão.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Smart Copy + Traffic', text: 'Use Smart Copy para gerar variações de headline e CTA → combine com Smart Traffic → otimização 100% automatizada.' }],
        monetization: ['Serviço de criação de landing pages (R$1.500-5.000 por página)', 'Otimização de conversão contínua (R$2.000-5.000/mês)'],
      },
      {
        key: 'hotjar', name: 'Hotjar', url: 'https://hotjar.com', urlLabel: 'hotjar.com', badge: 'Heatmaps',
        desc: 'Mapas de calor e gravações de sessão para entender o comportamento dos visitantes.',
        ...ebookDefaults('Hotjar', 'Hotjar mostra exatamente como os visitantes interagem com seu site: onde clicam, até onde fazem scroll, onde param, e grava sessões completas. Essencial para otimização de conversão e UX.'),
        stats: [{ num: 'Free', lbl: '35 sessões/dia' }, { num: 'Heatmap', lbl: 'visual' }, { num: 'Record', lbl: 'gravação de sessão' }],
        prompts: [{ label: '🟢 Iniciante — Heatmap', text: 'Instale pixel do Hotjar → espere 100+ visitas → analise: onde clicam, até onde scrollam, o que ignoram.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Recordings', text: 'Assista 20 gravações de sessão → identifique: onde visitantes ficam confusos, abandonam e voltam.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Feedback loops', text: 'Configure surveys contextuais: popup na exit intent → pergunta no abandono de carrinho → NPS pós-compra.' }],
        monetization: ['Auditoria de UX com Hotjar (R$2.000-8.000)', 'Otimização de conversão baseada em dados (R$3.000-10.000/mês)'],
      },
      {
        key: 'vwo', name: 'VWO', url: 'https://vwo.com', urlLabel: 'vwo.com', badge: 'Testes A/B',
        desc: 'Plataforma de testes A/B e otimização de conversão com IA preditiva.',
        ...ebookDefaults('VWO', 'VWO (Visual Website Optimizer) é a plataforma mais completa de testes A/B e otimização de conversão. Com editor visual, você cria variações de página sem código e a IA preditiva identifica o winner mais rápido que testes estatísticos tradicionais.'),
        stats: [{ num: 'A/B', lbl: 'testes IA' }, { num: 'Free', lbl: 'plano starter' }, { num: 'No-code', lbl: 'editor visual' }],
        prompts: [{ label: '🟢 Iniciante — Primeiro teste', text: 'Instale VWO → selecione página → crie variação (mude headline ou CTA) → defina meta (cliques, conversões) → inicie teste.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Multivariate', text: 'Teste múltiplas variáveis simultaneamente: headline × imagem × CTA → descubra a combinação vencedora.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Personalization', text: 'Configure personalização: mostre diferentes versões da página baseado em: fonte de tráfego, dispositivo, localização e comportamento.' }],
        monetization: ['Serviço de CRO (Conversion Rate Optimization) (R$3.000-15.000/mês)', 'Consultoria de testes A/B (R$200-500/hora)'],
      },
    ],
  },
  {
    key: 'llms',
    label: 'LLMs & Open Source',
    accent: '#1D9E75',
    accentLight: '#E1F5EE',
    accentDark: '#0F6E56',
    introTitle: 'LLMs & Open Source',
    introText: 'Modelos de linguagem open source que você pode rodar localmente, com total controle e privacidade dos dados.',
    whenTags: ['Privacidade de dados', 'Custo reduzido', 'Customização completa'],
    stats: [{ num: '6', lbl: 'modelos' }, { num: 'R$0', lbl: 'custo possível' }],
    tools: [
      {
        key: 'llama', name: 'Llama 3.1 (Meta)', url: 'https://llama.meta.com', urlLabel: 'llama.meta.com', badge: 'Open Source',
        desc: 'O modelo open source mais poderoso. Rode localmente com total privacidade.',
        ...ebookDefaults('Llama 3.1', 'Llama 3.1 da Meta é o modelo open source mais poderoso disponível. Versões de 8B, 70B e 405B parâmetros, competindo diretamente com GPT-4o. Rode localmente com total privacidade de dados ou use via API com custo 10x menor que GPT-4o.'),
        stats: [{ num: '405B', lbl: 'maior versão' }, { num: 'Grátis', lbl: 'open source' }, { num: 'Local', lbl: 'privacidade total' }],
        prompts: [{ label: '🟢 Iniciante — Via Ollama', text: 'Instale Ollama → terminal: "ollama run llama3.1" → comece a conversar localmente.' }],
        extraPrompts: [{ label: '🟡 Intermediário — API local', text: 'Use Ollama como API local: chame via HTTP na porta 11434 para integrar com seus aplicativos.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Fine-tuning', text: 'Fine-tune Llama 3.1 com dados do seu negócio para criar um modelo especializado no seu domínio.' }],
        monetization: ['Ofereça IA privada para empresas com dados sensíveis (R$5.000-20.000/projeto)', 'Crie chatbots especializados com fine-tuning (R$3.000-15.000)', 'Consultoria de IA open source (R$300-600/hora)'],
      },
      {
        key: 'deepseek', name: 'DeepSeek R1', url: 'https://chat.deepseek.com', urlLabel: 'chat.deepseek.com', badge: 'Raciocínio',
        desc: 'IA chinesa que rivaliza com GPT-o1 em raciocínio — e é gratuita.',
        ...ebookDefaults('DeepSeek R1', 'DeepSeek R1 é o modelo de IA chinês que surpreendeu o mercado ao rivalizar com GPT-o1 em tarefas de raciocínio complexo — e é completamente gratuito. Custo de API é 95% menor que GPT-4o, tornando-o ideal para uso em produção com orçamento limitado.'),
        stats: [{ num: 'Grátis', lbl: 'sem limite' }, { num: '-95%', lbl: 'custo vs GPT-4o' }, { num: 'R1', lbl: 'raciocínio avançado' }],
        prompts: [{ label: '🟢 Iniciante — Chat gratuito', text: 'Acesse chat.deepseek.com → use gratuitamente sem limite. Teste raciocínio complexo e problemas lógicos.' }],
        extraPrompts: [{ label: '🟡 Intermediário — API barata', text: 'Use a API do DeepSeek para substituir GPT-4o em produção com 95% de economia.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Chain of thought', text: 'Use DeepSeek R1 para problemas que exigem raciocínio passo a passo: análise financeira, lógica, matemática, código.' }],
        monetization: ['Use como backend de chatbots com custo quase zero', 'Ofereça soluções de IA para PMEs usando DeepSeek (margem alta)'],
      },
      {
        key: 'qwen', name: 'Qwen 2.5 (Alibaba)', url: 'https://chat.qwen.ai', urlLabel: 'chat.qwen.ai', badge: 'Multilingual',
        desc: 'Suporte excepcional a múltiplos idiomas e contexto longo de 128K tokens.',
        ...ebookDefaults('Qwen 2.5', 'Qwen 2.5 da Alibaba é um modelo open source com suporte excepcional a múltiplos idiomas (especialmente português), contexto de 128K tokens e versões de até 72B parâmetros. Excelente para aplicações multilíngues e processamento de documentos longos.'),
        stats: [{ num: '128K', lbl: 'contexto' }, { num: 'Open Source', lbl: '72B grátis' }, { num: 'Multi', lbl: 'idiomas' }],
        prompts: [{ label: '🟢 Iniciante — Chat multilíngue', text: 'Acesse chat.qwen.ai → teste em português, inglês e espanhol. Compare qualidade de resposta entre idiomas.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Documentos longos', text: 'Use o contexto de 128K tokens para processar documentos muito longos sem perder informação.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Deploy local', text: 'Deploy via Ollama ou vLLM para ter um modelo multilíngue local com privacidade total.' }],
        monetization: ['Soluções de IA multilíngue para empresas internacionais', 'Processamento de documentos longos com privacidade'],
      },
      {
        key: 'gemini', name: 'Google Gemini', url: 'https://gemini.google.com', urlLabel: 'gemini.google.com', badge: 'Google AI',
        desc: 'A IA do Google com acesso à internet em tempo real e integração com Google Workspace.',
        ...ebookDefaults('Google Gemini', 'Google Gemini é a IA do Google com acesso à internet em tempo real, contexto de 2M tokens (o maior do mercado) e integração nativa com Google Workspace. Pode analisar vídeos do YouTube, pesquisar na web e interagir com Gmail, Docs e Drive.'),
        stats: [{ num: '2M', lbl: 'tokens contexto' }, { num: 'Free', lbl: 'plano grátis' }, { num: 'Google', lbl: 'Workspace integrado' }],
        prompts: [{ label: '🟢 Iniciante — Pesquisa + IA', text: 'Pergunte ao Gemini sobre qualquer tema atual — ele busca na internet em tempo real e sintetiza a resposta.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Google Workspace', text: 'Use Gemini no Gmail para resumir e-mails, no Docs para escrever e no Sheets para analisar dados.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Análise de vídeo', text: 'Envie um vídeo do YouTube ao Gemini → peça análise do conteúdo, transcrição, resumo e action items.' }],
        monetization: ['Consultoria de Gemini para empresas Google Workspace (R$2.000-8.000)', 'Automações com Google Workspace + Gemini (R$1.500-5.000)'],
      },
      {
        key: 'mistral', name: 'Mistral AI', url: 'https://chat.mistral.ai', urlLabel: 'chat.mistral.ai', badge: 'Open Source',
        desc: 'IA francesa open source com modelos eficientes e rápidos, alternativa europeia ao GPT.',
        ...ebookDefaults('Mistral AI', 'Mistral AI é a empresa francesa de IA que cria modelos open source eficientes e rápidos. Seus modelos são menores mas surpreendentemente poderosos, com compliance GDPR nativo — ideal para empresas europeias ou que precisam de compliance de dados.'),
        stats: [{ num: 'Free', lbl: 'Le Chat' }, { num: 'EU', lbl: 'compliance GDPR' }, { num: 'Fast', lbl: 'modelos eficientes' }],
        prompts: [{ label: '🟢 Iniciante — Le Chat', text: 'Acesse chat.mistral.ai → use gratuitamente. Teste para tarefas rápidas e compare com ChatGPT.' }],
        extraPrompts: [{ label: '🟡 Intermediário — API eficiente', text: 'Use a API do Mistral para aplicações que precisam de respostas rápidas com custo baixo.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Mixtral local', text: 'Rode Mixtral 8x7B localmente via Ollama para ter um modelo poderoso com custo zero de API.' }],
        monetization: ['Soluções de IA com compliance GDPR para empresas (R$5.000-20.000)', 'API services com modelos Mistral (margem sobre custo)'],
      },
      {
        key: 'ollama', name: 'Ollama', url: 'https://ollama.com', urlLabel: 'ollama.com', badge: 'Local',
        desc: 'Rode qualquer LLM localmente no seu computador com um único comando. Total privacidade.',
        ...ebookDefaults('Ollama', 'Ollama permite rodar qualquer modelo de linguagem localmente no seu computador com um único comando. Suporta 100+ modelos (Llama, Mistral, Qwen, Gemma, etc.), roda offline e garante 100% de privacidade dos dados.'),
        stats: [{ num: '100+', lbl: 'modelos' }, { num: 'Local', lbl: '100% privado' }, { num: '1 cmd', lbl: 'para instalar' }],
        prompts: [{ label: '🟢 Iniciante — Primeiro modelo', text: 'Terminal: "curl -fsSL https://ollama.com/install.sh | sh" depois "ollama run llama3.1". Pronto, IA local!' }],
        extraPrompts: [{ label: '🟡 Intermediário — API local', text: 'Use Ollama como API: "curl http://localhost:11434/api/generate -d \'{"model":"llama3.1","prompt":"Hello"}\'" para integrar com apps.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Custom models', text: 'Crie Modelfile personalizado com system prompt do seu negócio: "FROM llama3.1\\nSYSTEM You are a [especialista]..."' }],
        monetization: ['Instale e configure IA local para empresas (R$3.000-10.000)', 'Crie chatbots privados com Ollama (R$2.000-8.000)', 'Workshop de IA local para developers (R$497-997)'],
      },
    ],
  },
  {
    key: 'codigo',
    label: 'Código & Dev',
    accent: '#378ADD',
    accentLight: '#E6F1FB',
    accentDark: '#185FA5',
    introTitle: 'Código & Desenvolvimento com IA',
    introText: 'IAs de código estão transformando o desenvolvimento de software. Mesmo não-programadores conseguem criar aplicações funcionais.',
    whenTags: ['Geração de código', 'Debug', 'Criação de sites', 'Automação'],
    stats: [{ num: '6', lbl: 'ferramentas' }],
    tools: [
      {
        key: 'github-copilot', name: 'GitHub Copilot', url: 'https://github.com/features/copilot', urlLabel: 'github.com/copilot', badge: 'Código IA',
        desc: 'Assistente de código da GitHub/Microsoft que gera código em tempo real no VS Code.',
        ...ebookDefaults('GitHub Copilot', 'GitHub Copilot é o assistente de código IA #1 do mercado, desenvolvido pela GitHub/Microsoft. Integrado ao VS Code, gera código em tempo real enquanto você digita, sugere funções completas e resolve bugs. Baseado no GPT-4o, entende contexto do projeto inteiro.'),
        stats: [{ num: '#1', lbl: 'assistente de código' }, { num: 'VS Code', lbl: 'integrado' }, { num: 'GPT-4o', lbl: 'motor' }],
        prompts: [{ label: '🟢 Iniciante — Autocompletar', text: 'Instale extensão no VS Code → comece a digitar → Copilot sugere código → Tab para aceitar.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Chat', text: 'Use Copilot Chat: descreva o que precisa em linguagem natural e o Copilot gera o código.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Workspace agent', text: 'Use @workspace para o Copilot entender todo o projeto e fazer refatorações inteligentes cross-file.' }],
        monetization: ['Aumente produtividade de dev 2-3x (valor: economia de R$5.000-10.000/mês)', 'Ofereça desenvolvimento mais rápido e barato para clientes'],
      },
      {
        key: 'cursor', name: 'Cursor', url: 'https://cursor.sh', urlLabel: 'cursor.sh', badge: 'IDE IA',
        desc: 'Editor de código com IA integrada que entende o contexto do projeto inteiro.',
        ...ebookDefaults('Cursor', 'Cursor é um editor de código (fork do VS Code) com IA integrada nativamente. Entende o contexto do projeto inteiro, faz edições multi-arquivo, e tem um chat que pode modificar código diretamente. Considerado por muitos o melhor IDE com IA do mercado.'),
        stats: [{ num: 'Full', lbl: 'contexto do projeto' }, { num: 'Multi-file', lbl: 'edição' }, { num: 'VS Code', lbl: 'baseado' }],
        prompts: [{ label: '🟢 Iniciante — Cmd+K', text: 'Selecione código → Cmd+K → descreva a mudança → Cursor modifica diretamente.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Chat mode', text: 'Abra chat → descreva feature → Cursor cria/modifica arquivos automaticamente → revise e aceite.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Agent mode', text: 'Use Agent mode para o Cursor executar tarefas complexas: criar features, refatorar código, corrigir bugs em múltiplos arquivos.' }],
        monetization: ['Acelere projetos de desenvolvimento (entregue em 1/3 do tempo)', 'Consultoria de setup de Cursor para equipes (R$2.000-5.000)'],
      },
      {
        key: 'replit', name: 'Replit', url: 'https://replit.com', urlLabel: 'replit.com', badge: 'IDE Online',
        desc: 'IDE online com IA que programa, hospeda e deploya aplicações.',
        ...ebookDefaults('Replit', 'Replit é uma IDE completa no browser com IA integrada (Replit Agent) que programa, hospeda e deploya aplicações. Descreva o que quer e o Replit cria o aplicativo inteiro. Ideal para protótipos rápidos e quem não quer configurar ambiente de desenvolvimento.'),
        stats: [{ num: 'Free', lbl: 'IDE completa' }, { num: 'Agent', lbl: 'IA programa' }, { num: 'Deploy', lbl: 'hosting incluso' }],
        prompts: [{ label: '🟢 Iniciante — App simples', text: 'Descreva: "Crie um [tipo de app] que [funcionalidade]" → Replit Agent programa tudo → teste no preview.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Full-stack', text: 'Peça: "Crie um app com login, banco de dados e dashboard" → Replit cria front + back + DB.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Deploy e escala', text: 'Configure Replit Deployments para hospedar app em produção com domínio customizado e scaling automático.' }],
        monetization: ['Crie MVPs para clientes sem programar (R$2.000-10.000)', 'Prototipagem rápida para startups (R$1.500-5.000)'],
      },
      {
        key: 'v0', name: 'v0.dev (Vercel)', url: 'https://v0.dev', urlLabel: 'v0.dev', badge: 'UI → Código',
        desc: 'Gera interfaces React/Next.js a partir de descrições em texto.',
        ...ebookDefaults('v0.dev', 'v0.dev da Vercel gera componentes React/Next.js com shadcn/ui a partir de descrições em texto ou imagens. Descreva uma interface e o v0 gera código limpo e responsivo pronto para usar no seu projeto. Ideal para criar UIs rapidamente.'),
        stats: [{ num: 'React', lbl: 'componentes' }, { num: 'shadcn', lbl: 'UI library' }, { num: 'Code', lbl: 'pronto para usar' }],
        prompts: [{ label: '🟢 Iniciante — Componente UI', text: 'No v0.dev, descreva: "Crie um [componente] com [funcionalidades]. Estilo: [moderno/minimalista]."' }],
        extraPrompts: [{ label: '🟡 Intermediário — Página completa', text: 'Descreva: "Landing page para [produto] com hero, features, pricing e footer. Dark theme."' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Design system', text: 'Gere múltiplos componentes que seguem o mesmo design system → integre no projeto Next.js → customize themes.' }],
        monetization: ['Crie interfaces para clientes rapidamente (R$500-3.000)', 'Venda templates de UI (R$47-197)'],
      },
      {
        key: 'bolt', name: 'Bolt.new', url: 'https://bolt.new', urlLabel: 'bolt.new', badge: 'Full-Stack IA',
        desc: 'Cria aplicações web completas a partir de prompts. Gera front e back-end instantaneamente.',
        ...ebookDefaults('Bolt.new', 'Bolt.new cria aplicações web completas a partir de prompts em linguagem natural. Gera frontend, backend e deploy instantaneamente. Ideal para não-programadores que querem criar SaaS, MVPs e ferramentas web funcionais.'),
        stats: [{ num: 'Full', lbl: 'stack completo' }, { num: 'Deploy', lbl: 'instantâneo' }, { num: 'No-code', lbl: 'sem programar' }],
        prompts: [{ label: '🟢 Iniciante — App simples', text: 'Descreva: "Crie um [app] que [funcionalidade]. Precisa ter: [features]. Design: [estilo]."' }],
        extraPrompts: [{ label: '🟡 Intermediário — SaaS MVP', text: 'Descreva: "Crie um SaaS para [nicho] com: auth, dashboard, CRUD de [dados], stripe integration."' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Iteração', text: 'Peça modificações iterativas: "Adicione [feature]" → "Mude o design de [seção]" → "Corrija [bug]".' }],
        monetization: ['Crie MVPs para startups (R$3.000-15.000)', 'Lance micro-SaaS sem saber programar (receita recorrente)'],
      },
      {
        key: 'lovable', name: 'Lovable', url: 'https://lovable.dev', urlLabel: 'lovable.dev', badge: 'App Builder',
        desc: 'Construa aplicações completas com IA conversacional. De ideia a produto em minutos.',
        ...ebookDefaults('Lovable', 'Lovable é a plataforma mais avançada de construção de aplicações com IA. Usando conversação natural, você cria aplicações completas com frontend React, backend Supabase, autenticação, banco de dados e deploy — tudo sem escrever código.'),
        stats: [{ num: 'Full', lbl: 'app completo' }, { num: 'Cloud', lbl: 'backend incluso' }, { num: 'Deploy', lbl: 'em 1 clique' }],
        prompts: [{ label: '🟢 Iniciante — Primeiro app', text: 'Descreva: "Crie um [app] para [finalidade]. Precisa ter: [lista de features]. Público: [perfil]."' }],
        extraPrompts: [{ label: '🟡 Intermediário — App com banco', text: 'Descreva: "Adicione autenticação, banco de dados para [dados] e dashboard com gráficos."' }],
        promptsAdvanced: [{ label: '🔴 Avançado — SaaS completo', text: 'Itere: adicione pagamentos Stripe, painel admin, notificações por e-mail, API pública e multi-tenancy.' }],
        monetization: ['Crie e lance micro-SaaS (R$29-299/mês recorrente)', 'Desenvolva apps para clientes sem programar (R$5.000-30.000)', 'Monte agência de desenvolvimento low-code (R$10.000-50.000/mês)'],
      },
    ],
  },
  {
    key: 'audio',
    label: 'Áudio & Voz',
    accent: '#BA7517',
    accentLight: '#FAEEDA',
    accentDark: '#854F0B',
    introTitle: 'Áudio & Voz com IA',
    introText: 'Crie narrações, podcasts e conteúdo de áudio profissional com vozes geradas por IA.',
    whenTags: ['Narração', 'Podcasts', 'Audiobooks', 'Clonagem de voz'],
    stats: [{ num: '6', lbl: 'ferramentas' }],
    tools: [
      {
        key: 'elevenlabs', name: 'ElevenLabs', url: 'https://elevenlabs.io', urlLabel: 'elevenlabs.io', badge: 'Voz IA',
        desc: 'A melhor IA de voz do mercado. Clona vozes e gera narração ultrarrealista.',
        fullDesc: 'ElevenLabs é a plataforma de IA de voz mais avançada do mercado. Gera narrações ultrarrealistas em 29 idiomas (incluindo PT-BR), clona vozes com amostras de poucos minutos e oferece controle fino sobre emoção, tom e velocidade. Indistinguível de vozes humanas na maioria dos casos.',
        whenToUse: ['Narração para vídeos e cursos', 'Audiobooks e podcasts', 'Dubbing e localização de conteúdo', 'Assistentes virtuais com voz natural', 'Conteúdo de áudio em escala'],
        steps: [
          { title: 'Crie conta gratuita', text: 'Acesse elevenlabs.io. O plano gratuito oferece 10.000 caracteres/mês.' },
          { title: 'Escolha ou clone voz', text: 'Use uma das 100+ vozes prontas ou clone sua própria voz com 1 minuto de áudio.' },
          { title: 'Digite ou cole o texto', text: 'Cole o texto que quer narrar. Ajuste velocidade, estabilidade e clareza.' },
          { title: 'Gere e baixe', text: 'Clique em "Generate". Ouça o preview e baixe o áudio em MP3.' },
        ],
        tip: 'Para português brasileiro, use a voz "Antoni" ou clone sua própria voz para máxima naturalidade.',
        prompts: [
          { label: '🟢 Iniciante — Narração simples', text: 'Cole texto do seu vídeo → escolha voz brasileira → ajuste velocidade para 1.0 → gere narração.' },
          { label: '🟢 Iniciante — Teste de vozes', text: 'Cole o mesmo texto em 5 vozes diferentes → compare qual soa mais natural e adequada ao seu conteúdo.' },
        ],
        extraPrompts: [
          { label: '🟡 Intermediário — Clone de voz', text: 'Grave 1-3 minutos de áudio da sua voz → faça upload no Voice Lab → clone → use para gerar áudio com sua voz.' },
          { label: '🟡 Intermediário — Dubbing', text: 'Use Projects para dublar vídeo inteiro: faça upload → ElevenLabs transcreve, traduz e dubla mantendo a emoção original.' },
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — API em produção', text: 'Integre API do ElevenLabs para text-to-speech em tempo real no seu app, chatbot ou plataforma de cursos.' },
          { label: '🔴 Avançado — Podcast automatizado', text: 'Crie pipeline: ChatGPT escreve script → ElevenLabs narra com 2 vozes alternadas → edite no Descript → publique.' },
        ],
        useCases: [
          { title: 'Produtor de cursos online', text: 'Gera narrações para 50 aulas de curso em 1 dia usando voz clonada, sem precisar gravar.', result: 'Produz curso completo em 1 semana vs 2 meses' },
          { title: 'Agência de marketing', text: 'Cria narrações em 5 idiomas para comerciais de clientes internacionais.', result: 'Economia de R$50.000 em locutores por ano' },
        ],
        commonErrors: [
          { erro: 'Estabilidade muito alta', fix: 'Reduzir estabilidade para 50-60% dá mais naturalidade e emoção à voz.' },
          { erro: 'Texto sem pontuação adequada', fix: 'Use vírgulas, pontos e quebras de parágrafo para controlar pausas e ritmo da narração.' },
        ],
        stats: [{ num: '29', lbl: 'idiomas' }, { num: 'Clone', lbl: 'sua voz' }, { num: 'Pro', lbl: 'qualidade' }],
        monetization: [
          'Serviço de narração IA para vídeos (R$50-200 por minuto de áudio)',
          'Produção de audiobooks (R$2.000-5.000 por livro)',
          'Dubbing de conteúdo para outros idiomas (R$500-2.000 por vídeo)',
          'Podcast com vozes IA (monetize com ads e patrocínios)',
          'Vozes para assistentes virtuais (R$3.000-10.000 por projeto)',
        ],
        automations: [
          'ElevenLabs + ChatGPT: Gere script e narração automaticamente',
          'ElevenLabs + Descript: Narre e edite podcast sem gravar',
          'ElevenLabs + Pictory: Crie vídeo completo com narração IA',
          'ElevenLabs + Make: Automatize produção de áudio em escala',
        ],
        checklist: ['Criar conta no ElevenLabs', 'Testar 3 vozes diferentes com mesmo texto', 'Clonar sua própria voz', 'Gerar primeira narração completa', 'Testar em vídeo real', 'Explorar API para automação'],
        imageDescriptions: [
          { title: 'Interface do ElevenLabs', desc: 'Print da interface mostrando o editor de texto, seletor de voz e controles de ajuste (estabilidade, clareza).' },
          { title: 'Voice Lab', desc: 'Print do Voice Lab mostrando o processo de clonagem de voz: upload de áudio → processamento → voz clonada.' },
          { title: 'Fluxo de produção', desc: 'Diagrama: Script → ElevenLabs narra → Descript edita → Pictory adiciona visual → Publicação.' },
        ],
      },
      {
        key: 'murf', name: 'Murf AI', url: 'https://murf.ai', urlLabel: 'murf.ai', badge: 'Text-to-Speech',
        desc: 'Plataforma de text-to-speech com vozes naturais para vídeos e apresentações.',
        ...ebookDefaults('Murf AI', 'Murf AI é uma plataforma de text-to-speech com 120+ vozes em 20+ idiomas. Diferencial: editor de vídeo integrado onde você sincroniza narração com slides/vídeos diretamente na plataforma. Ideal para apresentações corporativas e treinamentos.'),
        stats: [{ num: '120+', lbl: 'vozes' }, { num: '20+', lbl: 'idiomas' }, { num: 'Studio', lbl: 'editor integrado' }],
        prompts: [{ label: '🟢 Iniciante — Narração', text: 'Cole texto → escolha voz → ajuste tom (casual, formal, alegre) → gere e sincronize com slides.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Vídeo narrado', text: 'Faça upload de apresentação → adicione narração por slide → exporte como vídeo completo.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Enterprise voiceover', text: 'Configure vozes padrão da empresa → crie templates de narração → treine equipe para produzir vídeos consistentes.' }],
        monetization: ['Narração para vídeos corporativos (R$200-800 por vídeo)', 'Produção de treinamentos com áudio (R$3.000-10.000)'],
      },
      {
        key: 'suno', name: 'Suno AI', url: 'https://suno.ai', urlLabel: 'suno.ai', badge: 'Música IA',
        desc: 'Cria músicas completas com vocal, instrumentação e letras a partir de texto.',
        ...ebookDefaults('Suno AI', 'Suno AI é a ferramenta mais impressionante de criação de música com IA. Gera músicas completas — vocal, instrumentos, letra, mixagem — a partir de uma descrição em texto. Resultados profissionais em qualquer gênero: pop, rock, sertanejo, funk, eletrônica, etc.'),
        stats: [{ num: 'Full', lbl: 'música completa' }, { num: 'Free', lbl: '10 músicas/dia' }, { num: 'All', lbl: 'gêneros' }],
        prompts: [{ label: '🟢 Iniciante — Música simples', text: 'Descreva: "Crie uma música pop brasileira animada sobre [tema]. Tom alegre, ritmo dançante, vocal feminino."' }],
        extraPrompts: [{ label: '🟡 Intermediário — Com letra', text: 'Escreva a letra primeiro → cole no Suno → selecione gênero e estilo → a IA musica sua letra.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Jingle comercial', text: 'Crie jingle para [marca]: 30 segundos, pegajoso, com nome da marca no refrão. Gênero: [estilo]. Mood: [energia].' }],
        monetization: ['Crie jingles para pequenas empresas (R$500-3.000)', 'Produza trilhas para vídeos e podcasts (R$200-1.000)', 'Venda músicas de fundo em plataformas de stock (renda passiva)'],
      },
      {
        key: 'descript-audio', name: 'Descript', url: 'https://descript.com', urlLabel: 'descript.com', badge: 'Podcast IA',
        desc: 'Edite podcasts como se fosse um documento de texto. Remove "ãh", silêncios e erros automaticamente.',
        ...ebookDefaults('Descript (Áudio)', 'Descript para podcasts permite editar áudio como um documento de texto. Transcreve automaticamente, depois você edita a transcrição e o áudio muda junto. Remove "ãhs", silêncios longos e erros de gravação com um clique.'),
        stats: [{ num: 'Text', lbl: 'edição por texto' }, { num: 'Free', lbl: 'plano grátis' }, { num: 'Auto', lbl: 'remove fillers' }],
        prompts: [{ label: '🟢 Iniciante — Edição por texto', text: 'Importe áudio → espere transcrição → delete trechos indesejados na transcrição → exporte áudio limpo.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Studio Sound', text: 'Ative Studio Sound para melhorar qualidade de áudio automaticamente: remove ruído, equaliza e normaliza.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Multi-track', text: 'Edite podcast com múltiplos participantes: ajuste cada faixa individualmente, remova overlaps e balanceie volumes.' }],
        monetization: ['Edição de podcast como serviço (R$200-500 por episódio)', 'Pacote mensal de produção de podcast (R$1.500-4.000/mês)'],
      },
      {
        key: 'lalalai', name: 'LALAL.AI', url: 'https://lalal.ai', urlLabel: 'lalal.ai', badge: 'Separação IA',
        desc: 'Separa vocais de instrumentos em qualquer áudio com IA. Perfeito para remixes e karaokê.',
        ...ebookDefaults('LALAL.AI', 'LALAL.AI separa vocais, instrumentos, bateria, baixo e outros elementos de qualquer áudio usando IA avançada. Qualidade profissional de separação. Ideal para DJs, produtores musicais, criadores de conteúdo que precisam de stems.'),
        stats: [{ num: '10min', lbl: 'grátis' }, { num: 'Stems', lbl: 'separação' }, { num: 'Pro', lbl: 'qualidade' }],
        prompts: [{ label: '🟢 Iniciante — Separar vocal', text: 'Faça upload de música → selecione "Vocal and Instrumental" → processe → baixe vocal isolado e instrumental.' }],
        extraPrompts: [{ label: '🟡 Intermediário — Multi-stem', text: 'Separe em 4+ stems: vocal, bateria, baixo, outros instrumentos. Ideal para remixes e mashups.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Batch processing', text: 'Use a API para processar múltiplas faixas automaticamente para projetos de grande escala.' }],
        monetization: ['Serviço de separação de áudio para DJs (R$20-50 por faixa)', 'Produção de karaokê personalizado (R$50-200 por música)'],
      },
      {
        key: 'speechify', name: 'Speechify', url: 'https://speechify.com', urlLabel: 'speechify.com', badge: 'Leitura IA',
        desc: 'Converte texto em áudio natural. Leia artigos, PDFs e e-books ouvindo com vozes realistas.',
        ...ebookDefaults('Speechify', 'Speechify converte qualquer texto em áudio com vozes naturais. Leia artigos, PDFs, e-books e documentos ouvindo com vozes realistas em 30+ idiomas. Extensão do Chrome que lê qualquer página web. Ideal para produtividade e acessibilidade.'),
        stats: [{ num: '30+', lbl: 'idiomas' }, { num: 'Chrome', lbl: 'extensão' }, { num: 'PDF', lbl: 'leitura' }],
        prompts: [{ label: '🟢 Iniciante — Leitura web', text: 'Instale extensão do Chrome → abra qualquer artigo → clique no botão Speechify → ouça o artigo sendo lido.' }],
        extraPrompts: [{ label: '🟡 Intermediário — PDF to audio', text: 'Faça upload de PDF → Speechify converte em audiobook → ouça durante commute ou exercício.' }],
        promptsAdvanced: [{ label: '🔴 Avançado — Workflow de aprendizado', text: 'Configure pipeline: salve artigos no Pocket → Speechify converte em áudio → ouça na fila de podcasts.' }],
        monetization: ['Crie audiobooks para autores independentes (R$1.000-3.000)', 'Serviço de acessibilidade para empresas (R$2.000-5.000)'],
      },
    ],
  },
];

export const USERS_DB = [
  { id: 1, nome: 'Ana', sobre: 'Souza', email: 'ana@email.com', plano: 'Pro', acesso: 'Hoje' },
  { id: 2, nome: 'Carlos', sobre: 'Mendes', email: 'carlos@email.com', plano: 'Grátis', acesso: 'Ontem' },
  { id: 3, nome: 'Beatriz', sobre: 'Lima', email: 'beatriz@email.com', plano: 'Pro', acesso: 'Hoje' },
  { id: 4, nome: 'Rafael', sobre: 'Costa', email: 'rafael@email.com', plano: 'Pro', acesso: '2 dias atrás' },
  { id: 5, nome: 'Mariana', sobre: 'Ferreira', email: 'mariana@email.com', plano: 'Cancelado', acesso: '15 dias atrás' },
  { id: 6, nome: 'João', sobre: 'Oliveira', email: 'joao@email.com', plano: 'Grátis', acesso: 'Hoje' },
  { id: 7, nome: 'Fernanda', sobre: 'Dias', email: 'fernanda@email.com', plano: 'Pro', acesso: 'Ontem' },
  { id: 8, nome: 'Lucas', sobre: 'Rocha', email: 'lucas@email.com', plano: 'Grátis', acesso: '3 dias atrás' },
];
