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
  useCases?: { title: string; text: string; result?: string }[];
  commonErrors?: { erro: string; fix: string }[];
  stats?: { num: string; lbl: string }[];
  pricing?: { name: string; price: string; period: string; destaque?: boolean; features: string[] }[];
  comparison?: { cols: string[]; rows: { label: string; vals: string[] }[] };
  image?: string;
  gallery?: { url: string; caption: string }[];
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
        fullDesc: 'O ChatGPT é o assistente de IA mais utilizado no mundo, desenvolvido pela OpenAI. Ele é capaz de escrever qualquer tipo de texto, desde uma simples resposta de e-mail até roteiros completos de vídeo, artigos de blog, copies de anúncios e muito mais.',
        whenToUse: ['Escrever copies para anúncios no Meta Ads, Google Ads e TikTok Ads', 'Criar posts e legendas para redes sociais', 'Redigir e-mails de vendas e sequências de nutrição', 'Produzir artigos de blog otimizados para SEO'],
        steps: [
          { title: 'Crie sua conta gratuita', text: 'Clique em "Sign up" e crie conta com e-mail ou Google. O plano gratuito dá acesso ao GPT-4o mini.' },
          { title: 'Defina o papel da IA', text: 'Sempre comece dizendo quem a IA deve ser: "Aja como um copywriter especialista em Meta Ads..."' },
          { title: 'Forneça todos os detalhes', text: 'Informe: produto, público-alvo, plataforma, objetivo da campanha, diferencial do produto e tom desejado.' },
          { title: 'Itere e peça variações', text: 'Nunca aceite a primeira versão. Peça "crie mais 3 variações com ângulos diferentes".' },
        ],
        tip: 'Use o GPT-4o para textos criativos e o GPT-4o mini para tarefas rápidas.',
        prompts: [
          { label: 'Copy para Meta Ads', text: 'Aja como copywriter de Meta Ads. Crie 3 variações de copy para [produto] com objetivo [objetivo], público [público]. Formato: Headline (40 car.) / Texto principal (125 car.) / CTA (20 car.).' },
          { label: 'E-mail de vendas AIDA', text: 'Escreva um e-mail de vendas usando AIDA para [produto]. Cliente: [perfil]. Problema que resolve: [dor]. Máximo 200 palavras.' },
        ],
        useCases: [
          { title: 'Agência de marketing', text: 'Uma agência usa o ChatGPT para gerar 10 variações de copy para anúncios em menos de 5 minutos.' },
          { title: 'Consultora autônoma', text: 'Uma consultora gera propostas comerciais completas em 3 minutos.' },
        ],
        stats: [{ num: '200M+', lbl: 'usuários ativos' }, { num: 'GPT-4o', lbl: 'modelo gratuito' }, { num: '3×', lbl: 'mais velocidade' }],
        pricing: [
          { name: 'Free', price: 'R$0', period: 'para sempre', features: ['GPT-4o mini', '40 msgs/dia GPT-4o', 'Plugins básicos'] },
          { name: 'Plus', price: 'US$20', period: 'por mês', destaque: true, features: ['GPT-4o ilimitado', 'GPT-4o com imagens', 'Acesso prioritário'] },
        ],
        commonErrors: [
          { erro: 'Prompt vago demais', fix: 'Em vez de "escreva um texto sobre meu produto", diga: "Aja como copywriter de e-commerce. Escreva uma descrição de produto de 120 palavras..."' },
          { erro: 'Aceitar o primeiro resultado', fix: 'O ChatGPT raramente acerta na primeira tentativa. Sempre peça variações.' },
        ],
      },
      {
        key: 'claude', name: 'Claude (Anthropic)', url: 'https://claude.ai', urlLabel: 'claude.ai', badge: 'IA Geral',
        desc: 'IA da Anthropic focada em textos longos, análise profunda e respostas mais precisas.',
        fullDesc: 'Claude é a IA da Anthropic, reconhecida pela capacidade excepcional de lidar com textos muito longos, análises complexas e raciocínio estruturado.',
        whenToUse: ['Analisar documentos longos e contratos', 'Criar relatórios detalhados', 'Escrever e-books e conteúdos extensos', 'Revisar e melhorar textos existentes'],
        steps: [
          { title: 'Acesse claude.ai', text: 'O plano gratuito do Claude oferece acesso ao Claude Sonnet.' },
          { title: 'Aproveite o contexto estendido', text: 'O Claude consegue processar documentos inteiros. Cole PDFs diretamente no chat.' },
          { title: 'Use para revisão de textos', text: 'Cole qualquer texto e peça ao Claude para revisar clareza, coerência e persuasão.' },
        ],
        tip: 'O Claude é superior ao ChatGPT para textos longos e análises. Para documentos acima de 5 páginas, prefira sempre o Claude.',
        prompts: [
          { label: 'Análise de documento', text: 'Analise este documento e crie um resumo executivo de 3 parágrafos. [cole o documento aqui]' },
          { label: 'E-book completo', text: 'Crie um e-book completo sobre [tema] para [público]. Estrutura: Introdução, 5 capítulos, conclusão com CTA.' },
        ],
        stats: [{ num: '200K', lbl: 'tokens de contexto' }, { num: '3×', lbl: 'mais preciso' }, { num: 'Sonnet', lbl: 'modelo grátis' }],
      },
      {
        key: 'copyai', name: 'Copy.ai', url: 'https://copy.ai', urlLabel: 'copy.ai', badge: 'Copywriting',
        desc: 'Especialista em copies de marketing: anúncios, e-mails e posts com templates prontos.',
        prompts: [
          { label: 'Sequência de e-mail', text: 'Crie uma sequência de 5 e-mails para nutrir leads que baixaram [lead magnet].' },
        ],
        stats: [{ num: '2000+', lbl: 'palavras grátis/mês' }, { num: '100+', lbl: 'templates' }],
      },
      {
        key: 'jasper', name: 'Jasper AI', url: 'https://jasper.ai', urlLabel: 'jasper.ai', badge: 'Marketing',
        desc: 'Plataforma de IA voltada para equipes de marketing com brand voice e integrações.',
        stats: [{ num: 'Brand Voice', lbl: 'consistência' }, { num: '50+', lbl: 'idiomas' }],
      },
      {
        key: 'writesonic', name: 'Writesonic', url: 'https://writesonic.com', urlLabel: 'writesonic.com', badge: 'SEO + Copy',
        desc: 'IA focada em SEO e conteúdo de blog com geração de artigos longos e otimizados.',
        stats: [{ num: 'SEO', lbl: 'otimização' }, { num: 'PT-BR', lbl: 'nativo' }],
      },
      {
        key: 'notionai', name: 'Notion AI', url: 'https://notion.so', urlLabel: 'notion.so', badge: 'Produtividade',
        desc: 'IA integrada ao Notion para criar, resumir e organizar documentos diretamente no workspace.',
        stats: [{ num: 'US$8', lbl: 'por mês' }, { num: 'Nativo', lbl: 'no workspace' }],
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
        stats: [{ num: '15M+', lbl: 'usuários' }, { num: 'v6.1', lbl: 'mais recente' }, { num: '60s', lbl: 'por 4 imagens' }],
        prompts: [
          { label: 'Foto de produto', text: 'Professional product photo of [produto], pure white background, soft studio lighting, ultra realistic, 8k --ar 1:1 --v 6.1 --style raw' },
        ],
      },
      {
        key: 'dalle', name: 'DALL-E 3', url: 'https://chatgpt.com', urlLabel: 'chatgpt.com', badge: 'Imagens IA',
        desc: 'Gerador de imagens integrado ao ChatGPT. Excelente para quem já usa o ChatGPT.',
        stats: [{ num: 'ChatGPT', lbl: 'integrado' }, { num: 'PT-BR', lbl: 'aceita' }],
      },
      {
        key: 'canva', name: 'Canva', url: 'https://canva.com', urlLabel: 'canva.com', badge: 'Design',
        desc: 'Plataforma de design mais popular do mundo, agora com IA integrada para criar e editar.',
        stats: [{ num: '150M+', lbl: 'usuários' }, { num: 'Free', lbl: 'plano grátis' }],
      },
      {
        key: 'adobe-firefly', name: 'Adobe Firefly', url: 'https://firefly.adobe.com', urlLabel: 'firefly.adobe.com', badge: 'Design Pro',
        desc: 'IA generativa da Adobe, segura para uso comercial e integrada ao Photoshop.',
        stats: [{ num: 'CC', lbl: 'integrado' }, { num: '100%', lbl: 'comercial' }],
      },
      {
        key: 'leonardo', name: 'Leonardo.ai', url: 'https://leonardo.ai', urlLabel: 'leonardo.ai', badge: 'Imagens IA',
        desc: 'Gerador de imagens com controle avançado, ideal para game design e ilustrações.',
        stats: [{ num: '150', lbl: 'tokens/dia grátis' }, { num: 'Pro', lbl: 'controle avançado' }],
      },
      {
        key: 'remove-bg', name: 'Remove.bg', url: 'https://remove.bg', urlLabel: 'remove.bg', badge: 'Utilidade',
        desc: 'Remove fundos de imagens automaticamente em 5 segundos com resultado perfeito.',
        stats: [{ num: '5s', lbl: 'por imagem' }, { num: 'Free', lbl: 'resolução baixa' }],
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
      { key: 'gamma', name: 'Gamma', url: 'https://gamma.app', urlLabel: 'gamma.app', badge: 'Apresentações IA', desc: 'Gera apresentações completas a partir de texto. O "PowerPoint do futuro".', stats: [{ num: 'Free', lbl: 'plano grátis' }] },
      { key: 'descript', name: 'Descript', url: 'https://descript.com', urlLabel: 'descript.com', badge: 'Editor IA', desc: 'Editor de vídeo e podcast que funciona como um Google Docs — edite vídeo editando texto.', stats: [{ num: 'Text', lbl: 'edição por texto' }] },
      { key: 'pictory', name: 'Pictory', url: 'https://pictory.ai', urlLabel: 'pictory.ai', badge: 'Artigo → Vídeo', desc: 'Transforma artigos em vídeos prontos com narração IA e imagens de stock.', stats: [{ num: 'Auto', lbl: 'artigo → vídeo' }] },
      { key: 'heygen', name: 'HeyGen', url: 'https://heygen.com', urlLabel: 'heygen.com', badge: 'Avatar IA', desc: 'Cria vídeos com avatares humanos realistas que falam qualquer script.', stats: [{ num: '100+', lbl: 'avatares' }] },
      { key: 'runway', name: 'Runway', url: 'https://runwayml.com', urlLabel: 'runwayml.com', badge: 'Vídeo Gerado', desc: 'Plataforma profissional de geração e edição de vídeo com IA.', stats: [{ num: 'Gen-3', lbl: 'modelo avançado' }] },
      { key: 'beautifulai', name: 'Beautiful.ai', url: 'https://beautiful.ai', urlLabel: 'beautiful.ai', badge: 'Apresentações', desc: 'Apresentações que se formatam automaticamente. Design sempre perfeito.', stats: [{ num: 'Smart', lbl: 'slides' }] },
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
      { key: 'make', name: 'Make (Integromat)', url: 'https://make.com', urlLabel: 'make.com', badge: 'Automação', desc: 'Plataforma visual de automação: conecte apps e crie fluxos sem programar.', stats: [{ num: '1000+', lbl: 'integrações' }] },
      { key: 'zapier', name: 'Zapier', url: 'https://zapier.com', urlLabel: 'zapier.com', badge: 'Automação', desc: 'A plataforma de automação mais popular, com milhares de integrações.', stats: [{ num: '7000+', lbl: 'apps' }] },
      { key: 'reclaim', name: 'Reclaim.ai', url: 'https://reclaim.ai', urlLabel: 'reclaim.ai', badge: 'Calendário IA', desc: 'IA que organiza seu calendário automaticamente com base em prioridades.', stats: [{ num: 'Free', lbl: 'plano básico' }] },
      { key: 'otter', name: 'Otter.ai', url: 'https://otter.ai', urlLabel: 'otter.ai', badge: 'Transcrição', desc: 'Transcreve reuniões em tempo real e gera resumos automaticamente.', stats: [{ num: 'Real-time', lbl: 'transcrição' }] },
      { key: 'clickup', name: 'ClickUp', url: 'https://clickup.com', urlLabel: 'clickup.com', badge: 'Gestão IA', desc: 'Plataforma de gestão de projetos com IA integrada para automação de tarefas e geração de conteúdo.', stats: [{ num: 'Free', lbl: 'plano grátis' }, { num: 'IA', lbl: 'integrada' }] },
      { key: 'calendly', name: 'Calendly', url: 'https://calendly.com', urlLabel: 'calendly.com', badge: 'Agendamento', desc: 'Automatize agendamentos de reuniões e elimine o vai e vem de e-mails.', stats: [{ num: '10M+', lbl: 'usuários' }, { num: 'Free', lbl: 'plano básico' }] },
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
      { key: 'perplexity', name: 'Perplexity AI', url: 'https://perplexity.ai', urlLabel: 'perplexity.ai', badge: 'Pesquisa IA', desc: 'Motor de pesquisa com IA que cita fontes. O "Google do futuro".', stats: [{ num: 'Free', lbl: 'ilimitado' }, { num: 'Fontes', lbl: 'citadas' }] },
      { key: 'julius', name: 'Julius AI', url: 'https://julius.ai', urlLabel: 'julius.ai', badge: 'Dados', desc: 'Analise planilhas e dados com linguagem natural. Cole CSV e faça perguntas.', stats: [{ num: 'CSV', lbl: 'upload direto' }] },
      { key: 'consensus', name: 'Consensus', url: 'https://consensus.app', urlLabel: 'consensus.app', badge: 'Acadêmico', desc: 'Pesquisa científica com IA. Busca em 200M+ de artigos acadêmicos.', stats: [{ num: '200M+', lbl: 'artigos' }] },
      { key: 'notebooklm', name: 'NotebookLM', url: 'https://notebooklm.google.com', urlLabel: 'notebooklm.google.com', badge: 'Google AI', desc: 'IA do Google que analisa documentos, PDFs e vídeos e cria podcasts automáticos.', stats: [{ num: 'Free', lbl: 'do Google' }, { num: 'Podcast', lbl: 'automático' }] },
      { key: 'tableau', name: 'Tableau', url: 'https://tableau.com', urlLabel: 'tableau.com', badge: 'BI & Dados', desc: 'Plataforma de visualização de dados com IA para descobrir insights automaticamente.', stats: [{ num: '#1', lbl: 'em BI' }, { num: 'IA', lbl: 'Ask Data' }] },
      { key: 'chatpdf', name: 'ChatPDF', url: 'https://chatpdf.com', urlLabel: 'chatpdf.com', badge: 'PDF IA', desc: 'Converse com qualquer PDF. Faça perguntas e extraia informações instantaneamente.', stats: [{ num: 'Free', lbl: '3 PDFs/dia' }, { num: '120pg', lbl: 'por arquivo' }] },
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
      { key: 'surfer', name: 'Surfer SEO', url: 'https://surferseo.com', urlLabel: 'surferseo.com', badge: 'SEO', desc: 'Otimiza conteúdo para SEO em tempo real com score e sugestões de IA.', stats: [{ num: 'Score', lbl: 'SEO em tempo real' }] },
      { key: 'semrush', name: 'Semrush', url: 'https://semrush.com', urlLabel: 'semrush.com', badge: 'SEO Pro', desc: 'Suíte completa de SEO e marketing digital com IA integrada.', stats: [{ num: '25B+', lbl: 'keywords' }] },
      { key: 'ahrefs', name: 'Ahrefs', url: 'https://ahrefs.com', urlLabel: 'ahrefs.com', badge: 'Backlinks', desc: 'Ferramenta premium de análise de backlinks e pesquisa de concorrentes.', stats: [{ num: '35T', lbl: 'backlinks indexados' }] },
      { key: 'ubersuggest', name: 'Ubersuggest', url: 'https://neilpatel.com/ubersuggest', urlLabel: 'neilpatel.com/ubersuggest', badge: 'Keywords', desc: 'Ferramenta de Neil Patel para pesquisa de palavras-chave e análise de concorrência SEO.', stats: [{ num: 'Free', lbl: '3 buscas/dia' }, { num: 'Neil Patel', lbl: 'criador' }] },
      { key: 'answerthepublic', name: 'AnswerThePublic', url: 'https://answerthepublic.com', urlLabel: 'answerthepublic.com', badge: 'Perguntas', desc: 'Descubra todas as perguntas que as pessoas fazem sobre qualquer tema no Google.', stats: [{ num: 'Free', lbl: '3 buscas/dia' }, { num: 'Visual', lbl: 'mapa de perguntas' }] },
      { key: 'screamingfrog', name: 'Screaming Frog', url: 'https://screamingfrog.co.uk', urlLabel: 'screamingfrog.co.uk', badge: 'Auditoria', desc: 'Crawler de SEO que audita sites inteiros e encontra problemas técnicos automaticamente.', stats: [{ num: '500', lbl: 'URLs grátis' }, { num: 'Pro', lbl: 'crawler' }] },
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
      { key: 'hootsuite', name: 'Hootsuite', url: 'https://hootsuite.com', urlLabel: 'hootsuite.com', badge: 'Social', desc: 'Plataforma de gestão de redes sociais com IA para melhor horário de postagem.', stats: [{ num: '35+', lbl: 'redes suportadas' }] },
      { key: 'buffer', name: 'Buffer', url: 'https://buffer.com', urlLabel: 'buffer.com', badge: 'Social', desc: 'Agendamento simples e eficaz para redes sociais com analytics.', stats: [{ num: 'Free', lbl: '3 canais grátis' }] },
      { key: 'taplio', name: 'Taplio', url: 'https://taplio.com', urlLabel: 'taplio.com', badge: 'LinkedIn', desc: 'Ferramenta de IA especializada em crescimento no LinkedIn.', stats: [{ num: 'LinkedIn', lbl: 'especialista' }] },
      { key: 'later', name: 'Later', url: 'https://later.com', urlLabel: 'later.com', badge: 'Instagram', desc: 'Plataforma de agendamento focada em Instagram com IA para melhor horário de postagem.', stats: [{ num: '#1', lbl: 'para Instagram' }, { num: 'Linkin.bio', lbl: 'link na bio' }] },
      { key: 'predis', name: 'Predis.ai', url: 'https://predis.ai', urlLabel: 'predis.ai', badge: 'Conteúdo IA', desc: 'Gera posts completos para redes sociais com texto, imagem e hashtags usando IA.', stats: [{ num: 'IA', lbl: 'post completo' }, { num: 'Free', lbl: '15 posts/mês' }] },
      { key: 'metricool', name: 'Metricool', url: 'https://metricool.com', urlLabel: 'metricool.com', badge: 'Analytics', desc: 'Plataforma de analytics e agendamento para todas as redes sociais em um só lugar.', stats: [{ num: 'All-in-one', lbl: 'analytics' }, { num: 'Free', lbl: 'plano básico' }] },
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
      { key: 'adcreative', name: 'AdCreative.ai', url: 'https://adcreative.ai', urlLabel: 'adcreative.ai', badge: 'Ads IA', desc: 'Gera criativos de anúncios otimizados para conversão com IA.', stats: [{ num: '14×', lbl: 'mais conversão' }] },
      { key: 'madgicx', name: 'Madgicx', url: 'https://madgicx.com', urlLabel: 'madgicx.com', badge: 'Meta Ads', desc: 'Plataforma de otimização de Meta Ads com IA para audiências e criativos.', stats: [{ num: 'Meta', lbl: 'especialista' }] },
      { key: 'smartly', name: 'Smartly.io', url: 'https://smartly.io', urlLabel: 'smartly.io', badge: 'Enterprise', desc: 'Plataforma enterprise de automação de anúncios em múltiplas redes.', stats: [{ num: 'Multi', lbl: 'plataformas' }] },
      { key: 'unbounce', name: 'Unbounce', url: 'https://unbounce.com', urlLabel: 'unbounce.com', badge: 'Landing Pages', desc: 'Cria landing pages otimizadas para conversão com IA que testa variações automaticamente.', stats: [{ num: 'Smart', lbl: 'Traffic IA' }, { num: '30%+', lbl: 'mais conversão' }] },
      { key: 'hotjar', name: 'Hotjar', url: 'https://hotjar.com', urlLabel: 'hotjar.com', badge: 'Heatmaps', desc: 'Mapas de calor e gravações de sessão para entender o comportamento dos visitantes.', stats: [{ num: 'Free', lbl: '35 sessões/dia' }, { num: 'Heatmap', lbl: 'visual' }] },
      { key: 'vwo', name: 'VWO', url: 'https://vwo.com', urlLabel: 'vwo.com', badge: 'Testes A/B', desc: 'Plataforma de testes A/B e otimização de conversão com IA preditiva.', stats: [{ num: 'A/B', lbl: 'testes IA' }, { num: 'Free', lbl: 'plano starter' }] },
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
      { key: 'llama', name: 'Llama 3.1 (Meta)', url: 'https://llama.meta.com', urlLabel: 'llama.meta.com', badge: 'Open Source', desc: 'O modelo open source mais poderoso. Rode localmente com total privacidade.', stats: [{ num: '405B', lbl: 'maior versão' }, { num: 'Grátis', lbl: 'open source' }] },
      { key: 'deepseek', name: 'DeepSeek R1', url: 'https://chat.deepseek.com', urlLabel: 'chat.deepseek.com', badge: 'Raciocínio', desc: 'IA chinesa que rivaliza com GPT-o1 em raciocínio — e é gratuita.', stats: [{ num: 'Grátis', lbl: 'sem limite' }, { num: '-95%', lbl: 'custo vs GPT-4o' }] },
      { key: 'qwen', name: 'Qwen 2.5 (Alibaba)', url: 'https://chat.qwen.ai', urlLabel: 'chat.qwen.ai', badge: 'Multilingual', desc: 'Suporte excepcional a múltiplos idiomas e contexto longo de 128K tokens.', stats: [{ num: '128K', lbl: 'contexto' }, { num: 'Open Source', lbl: '72B grátis' }] },
      { key: 'gemini', name: 'Google Gemini', url: 'https://gemini.google.com', urlLabel: 'gemini.google.com', badge: 'Google AI', desc: 'A IA do Google com acesso à internet em tempo real e integração com Google Workspace.', stats: [{ num: '2M', lbl: 'tokens contexto' }, { num: 'Free', lbl: 'plano grátis' }] },
      { key: 'mistral', name: 'Mistral AI', url: 'https://chat.mistral.ai', urlLabel: 'chat.mistral.ai', badge: 'Open Source', desc: 'IA francesa open source com modelos eficientes e rápidos, alternativa europeia ao GPT.', stats: [{ num: 'Free', lbl: 'Le Chat' }, { num: 'EU', lbl: 'compliance GDPR' }] },
      { key: 'ollama', name: 'Ollama', url: 'https://ollama.com', urlLabel: 'ollama.com', badge: 'Local', desc: 'Rode qualquer LLM localmente no seu computador com um único comando. Total privacidade.', stats: [{ num: '100+', lbl: 'modelos' }, { num: 'Local', lbl: '100% privado' }] },
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
      { key: 'github-copilot', name: 'GitHub Copilot', url: 'https://github.com/features/copilot', urlLabel: 'github.com/copilot', badge: 'Código IA', desc: 'Assistente de código da GitHub/Microsoft que gera código em tempo real no VS Code.', stats: [{ num: '#1', lbl: 'assistente de código' }] },
      { key: 'cursor', name: 'Cursor', url: 'https://cursor.sh', urlLabel: 'cursor.sh', badge: 'IDE IA', desc: 'Editor de código com IA integrada que entende o contexto do projeto inteiro.', stats: [{ num: 'Full', lbl: 'contexto do projeto' }] },
      { key: 'replit', name: 'Replit', url: 'https://replit.com', urlLabel: 'replit.com', badge: 'IDE Online', desc: 'IDE online com IA que programa, hospeda e deploya aplicações.', stats: [{ num: 'Free', lbl: 'IDE completa' }] },
      { key: 'v0', name: 'v0.dev (Vercel)', url: 'https://v0.dev', urlLabel: 'v0.dev', badge: 'UI → Código', desc: 'Gera interfaces React/Next.js a partir de descrições em texto.', stats: [{ num: 'React', lbl: 'componentes' }] },
      { key: 'bolt', name: 'Bolt.new', url: 'https://bolt.new', urlLabel: 'bolt.new', badge: 'Full-Stack IA', desc: 'Cria aplicações web completas a partir de prompts. Gera front e back-end instantaneamente.', stats: [{ num: 'Full', lbl: 'stack completo' }, { num: 'Deploy', lbl: 'instantâneo' }] },
      { key: 'lovable', name: 'Lovable', url: 'https://lovable.dev', urlLabel: 'lovable.dev', badge: 'App Builder', desc: 'Construa aplicações completas com IA conversacional. De ideia a produto em minutos.', stats: [{ num: 'Full', lbl: 'app completo' }, { num: 'Cloud', lbl: 'backend incluso' }] },
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
      { key: 'elevenlabs', name: 'ElevenLabs', url: 'https://elevenlabs.io', urlLabel: 'elevenlabs.io', badge: 'Voz IA', desc: 'A melhor IA de voz do mercado. Clona vozes e gera narração ultrarrealista.', stats: [{ num: '29', lbl: 'idiomas' }, { num: 'Clone', lbl: 'sua voz' }] },
      { key: 'murf', name: 'Murf AI', url: 'https://murf.ai', urlLabel: 'murf.ai', badge: 'Text-to-Speech', desc: 'Plataforma de text-to-speech com vozes naturais para vídeos e apresentações.', stats: [{ num: '120+', lbl: 'vozes' }] },
      { key: 'suno', name: 'Suno AI', url: 'https://suno.ai', urlLabel: 'suno.ai', badge: 'Música IA', desc: 'Cria músicas completas com vocal, instrumentação e letras a partir de texto.', stats: [{ num: 'Full', lbl: 'música completa' }] },
      { key: 'descript-audio', name: 'Descript', url: 'https://descript.com', urlLabel: 'descript.com', badge: 'Podcast IA', desc: 'Edite podcasts como se fosse um documento de texto. Remove "ãh", silêncios e erros automaticamente.', stats: [{ num: 'Text', lbl: 'edição por texto' }, { num: 'Free', lbl: 'plano grátis' }] },
      { key: 'lalalai', name: 'LALAL.AI', url: 'https://lalal.ai', urlLabel: 'lalal.ai', badge: 'Separação IA', desc: 'Separa vocais de instrumentos em qualquer áudio com IA. Perfeito para remixes e karaokê.', stats: [{ num: '10min', lbl: 'grátis' }, { num: 'Stems', lbl: 'separação' }] },
      { key: 'speechify', name: 'Speechify', url: 'https://speechify.com', urlLabel: 'speechify.com', badge: 'Leitura IA', desc: 'Converte texto em áudio natural. Leia artigos, PDFs e e-books ouvindo com vozes realistas.', stats: [{ num: '30+', lbl: 'idiomas' }, { num: 'Chrome', lbl: 'extensão' }] },
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
