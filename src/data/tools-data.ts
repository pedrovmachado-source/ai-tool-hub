import { type Plano } from '@/lib/plan';

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
  videos?: { title: string; url: string; desc?: string }[];
  prompts?: { label: string; text: string }[];
  extraPrompts?: { label: string; text: string }[];
  promptsAdvanced?: { label: string; text: string }[];
  useCases?: { title: string; text?: string; result?: string; name?: string; description?: string; desc?: string }[];
  commonErrors?: { erro: string; fix: string }[];
  monetization?: string[];
  automations?: string[];
  checklist?: string[];
  pricing?: { name: string; price: string; period: string; features: string[]; destaque?: boolean }[];
  pdfDataUrl?: string;
  stats?: { num: string; lbl: string }[];
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
  tools: Tool[];
  promptsExtra?: { title: string; text: string }[];
}

export const TOOLS_DATA: Category[] = [
  {
    key: 'texto',
    label: 'Escrita & Copy',
    accent: '#000000',
    accentLight: '#F3F4F6',
    accentDark: '#374151',
    introTitle: 'IAs que escrevem como humanos',
    introText: 'Desde e-mails que vendem até roteiros de VSL. Estas ferramentas dominam a arte da persuasão e clareza textual.',
    whenTags: ['Criar copy', 'Posts de blog', 'Scripts de vendas', 'Anúncios'],
    stats: [
      { num: '450+', lbl: 'prompts de copy' },
      { num: '99%', lbl: 'economize tempo' }
    ],
    tools: [
      {
        key: 'chatgpt',
        name: 'ChatGPT',
        url: 'https://chat.openai.com',
        urlLabel: 'Acessar OpenAI',
        badge: 'Free / Paid',
        desc: 'O pioneiro e mais versátil. Ideal para brainstorming, estruturação de ideias e criação de conteúdo em massa com o modelo GPT-4o.',
        stats: [{ num: 'CC', lbl: 'integrado' }, { num: '100%', lbl: 'uso comercial' }, { num: 'Elite', lbl: 'qualidade' }],
        prompts: [
          { label: '🟢 Iniciante — Criar copy de anúncio', text: 'Você é um copywriter expert. Crie 3 variações de anúncio para Facebook para um produto de [NOME DO PRODUTO] que resolve [DOR DO CLIENTE]. Use a estrutura AIDA.' },
          { label: '🟡 Intermediário — Adaptar tom de voz', text: 'Reescreva o texto abaixo usando um tom de voz sarcástico porém amigável, focado na Geração Z: [COLE O TEXTO]' }
        ],
        promptsAdvanced: [
          { label: '🔴 Avançado — Framework StoryBrand', text: 'Analise meu negócio [DESCRIÇÃO] e crie um roteiro de landing page usando o framework StoryBrand de Donald Miller.' }
        ]
      },
      {
        key: 'claude',
        name: 'Claude 3.5 Sonnet',
        url: 'https://claude.ai',
        urlLabel: 'Acessar Anthropic',
        badge: 'Free / Paid',
        desc: 'O favorito dos copywriters pela sua escrita mais natural, humana e menos repetitiva que o GPT. Excelente para lidar com grandes volumes de texto.',
        stats: [{ num: '150', lbl: 'tokens/dia grátis' }, { num: 'Elite', lbl: 'controle avançado' }, { num: 'Train', lbl: 'modelos custom' }],
      }
    ]
  },
  {
    key: 'video',
    label: 'Vídeo & Animação',
    accent: '#000000',
    accentLight: '#F3F4F6',
    accentDark: '#374151',
    introTitle: 'Crie vídeos em segundos',
    introText: 'Transforme texto em vídeos realistas, gere avatares falantes ou edite com inteligência artificial para escala.',
    whenTags: ['Vídeos Curtos', 'VSL', 'Ads Criativos', 'Aulas'],
    stats: [
      { num: '100+', lbl: 'avatares' },
      { num: '4K', lbl: 'resolução' }
    ],
    tools: [
      {
        key: 'runway',
        name: 'Runway Gen-3',
        url: 'https://runwayml.com',
        urlLabel: 'Explorar Runway',
        badge: 'Freemium',
        desc: 'Líder mundial em geração de vídeo por IA. Transforme qualquer imagem ou texto em vídeos cinematográficos ultra-realistas.',
        stats: [{ num: 'Gen-3', lbl: 'modelo avançado' }, { num: 'Elite', lbl: 'qualidade cinema' }, { num: '10s', lbl: 'por geração' }],
      }
    ]
  },
  {
    key: 'data',
    label: 'Dados & Análise',
    accent: '#000000',
    accentLight: '#F3F4F6',
    accentDark: '#374151',
    introTitle: 'Inteligência de Mercado',
    introText: 'Ferramentas para análise de dados, SEO avançado e mineração de informações para decisões estratégicas.',
    whenTags: ['SEO', 'Análise de Tráfego', 'Planilhas IA', 'Dashboards'],
    stats: [
      { num: '10B+', lbl: 'dados analisados' },
      { num: 'BI', lbl: 'integrado' }
    ],
    tools: [
      {
        key: 'tableau',
        name: 'Tableau Pulse',
        url: 'https://www.tableau.com/products/pulse',
        urlLabel: 'Ver Tableau',
        badge: 'Enterprise',
        desc: 'Insights de dados em tempo real entregues via IA diretamente no seu fluxo de trabalho.',
        stats: [{ num: '#1', lbl: 'em BI' }, { num: 'IA', lbl: 'Ask Data' }, { num: 'Elite', lbl: 'enterprise' }],
      },
      {
        key: 'semrush',
        name: 'Semrush Copilot',
        url: 'https://www.semrush.com',
        urlLabel: 'Ver Semrush',
        badge: 'Paid',
        desc: 'A plataforma definitiva de SEO agora com assistente de IA para identificar brechas de mercado e sugerir pautas de conteúdo.',
        stats: [{ num: '35T', lbl: 'backlinks indexados' }, { num: '#1', lbl: 'backlink analysis' }, { num: 'Elite', lbl: 'SEO tool' }],
      },
      {
        key: 'screamingfrog',
        name: 'Screaming Frog',
        url: 'https://www.screamingfrog.co.uk',
        urlLabel: 'Ver Screaming Frog',
        badge: 'Freemium',
        desc: 'Crawler técnico essencial para auditar sites e otimizar a estrutura de SEO on-page.',
        stats: [{ num: '500', lbl: 'URLs grátis' }, { num: 'Elite', lbl: 'crawler' }, { num: 'Tech', lbl: 'SEO técnico' }],
      }
    ]
  },
  {
    key: 'social',
    label: 'Social & Ads',
    accent: '#000000',
    accentLight: '#F3F4F6',
    accentDark: '#374151',
    introTitle: 'Escala em Redes Sociais',
    introText: 'Automatize postagens, responda clientes com IA e gere criativos de anúncios que performam melhor.',
    whenTags: ['Gestão Social', 'Ads', 'Engajamento', 'Viralização'],
    stats: [
      { num: '24/7', lbl: 'automação' },
      { num: '3x+', lbl: 'CTR em anúncios' }
    ],
    tools: [
      {
        key: 'hootsuite',
        name: 'Hootsuite OwlyWriter',
        url: 'https://www.hootsuite.com',
        urlLabel: 'Ver Hootsuite',
        badge: 'Paid',
        desc: 'Gestão completa de redes sociais com IA para gerar ideias de posts e legendas otimizadas.',
        stats: [{ num: '35+', lbl: 'redes suportadas' }, { num: 'OwlyWriter', lbl: 'IA nativa' }, { num: 'Elite', lbl: 'analytics' }],
      }
    ]
  },
  {
    key: 'audio',
    label: 'Áudio & Voz',
    accent: '#000000',
    accentLight: '#F3F4F6',
    accentDark: '#374151',
    introTitle: 'Vozes Sintéticas & Música',
    introText: 'Dublagem automática, clonagem de voz e criação de trilhas sonoras originais sem direitos autorais.',
    whenTags: ['Narração', 'Podcasts', 'Dublagem', 'Música'],
    stats: [
      { num: '150+', lbl: 'vozes HD' },
      { num: '3s', lbl: 'clonagem' }
    ],
    tools: [
      {
        key: 'elevenlabs',
        name: 'ElevenLabs',
        url: 'https://elevenlabs.io',
        urlLabel: 'Acessar ElevenLabs',
        badge: 'Freemium',
        desc: 'A melhor IA de narração do mundo. Clone sua voz ou use vozes ultra-realistas para narrar seus projetos.',
        stats: [{ num: '29', lbl: 'idiomas' }, { num: 'Clone', lbl: 'sua voz' }, { num: 'Elite', lbl: 'qualidade' }],
      },
      {
        key: 'lalalai',
        name: 'Lalal.ai',
        url: 'https://www.lalal.ai',
        urlLabel: 'Acessar Lalal.ai',
        badge: 'Freemium',
        desc: 'Remoção vocal e separação de fontes de áudio de alta precisão baseada em IA.',
        stats: [{ num: '10min', lbl: 'grátis' }, { num: 'Stems', lbl: 'separação' }, { num: 'Elite', lbl: 'qualidade' }],
      }
    ]
  }
];

export const CATEGORIES = TOOLS_DATA;

export interface DbUser {
  id: string;
  user_id: string;
  nome: string;
  sobre: string;
  email: string;
  plano: string;
  created_at: string;
}

export const MOCK_USERS: any[] = [
  { id: 1, nome: 'Ana', sobre: 'Souza', email: 'ana@email.com', plano: 'Elite', acesso: 'Hoje' },
  { id: 2, nome: 'Bruno', sobre: 'Lopes', email: 'bruno@email.com', plano: 'Free', acesso: 'Ontem' },
  { id: 3, nome: 'Beatriz', sobre: 'Lima', email: 'beatriz@email.com', plano: 'Elite', acesso: 'Hoje' },
  { id: 4, nome: 'Rafael', sobre: 'Costa', email: 'rafael@email.com', plano: 'Elite', acesso: '2 dias atrás' },
  { id: 5, nome: 'Carla', sobre: 'Mendes', email: 'carla@email.com', plano: 'Elite Plus', acesso: 'Ontem' },
  { id: 6, nome: 'João', sobre: 'Silva', email: 'joao@email.com', plano: 'Free', acesso: '3 dias atrás' },
  { id: 7, nome: 'Fernanda', sobre: 'Dias', email: 'fernanda@email.com', plano: 'Elite', acesso: 'Ontem' },
];
