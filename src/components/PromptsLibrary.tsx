import { useState } from 'react';
import { Copy, Check, Heart } from 'lucide-react';
import type { Category } from '@/data/tools-data';

const PROMPT_CATEGORIES = [
  { key: 'marketing', label: 'Marketing', icon: '📣' },
  { key: 'vendas', label: 'Vendas', icon: '💰' },
  { key: 'design', label: 'Design', icon: '🎨' },
  { key: 'produtividade', label: 'Produtividade', icon: '⚡' },
  { key: 'seo', label: 'SEO', icon: '🔍' },
  { key: 'social', label: 'Social Media', icon: '📱' },
];

const PROMPTS_DB = [
  { category: 'marketing', label: 'Persona do cliente', text: 'Crie uma persona detalhada para quem compra [produto]. Inclua: nome, idade, profissão, rotina, 5 dores, desejos, objeções de compra e o que a faz clicar em um anúncio.' },
  { category: 'marketing', label: 'Copy para Meta Ads', text: 'Aja como copywriter de Meta Ads. Crie 3 variações de copy para [produto] com objetivo [objetivo], público [público]. Formato: Headline (40 car.) / Texto principal (125 car.) / CTA (20 car.).' },
  { category: 'marketing', label: 'Assuntos de e-mail', text: 'Crie 10 assuntos de e-mail para campanha de [objetivo] sobre [produto]. Varie entre: curiosidade, urgência, benefício direto, pergunta e prova social.' },
  { category: 'vendas', label: 'E-mail de vendas AIDA', text: 'Escreva um e-mail de vendas usando AIDA para [produto]. Cliente: [perfil]. Problema que resolve: [dor]. Máximo 200 palavras.' },
  { category: 'vendas', label: 'Proposta comercial', text: 'Crie uma proposta comercial completa para [cliente] contratando [serviço]. Inclua: contexto do cliente, problema identificado, solução proposta, investimento e próximos passos.' },
  { category: 'vendas', label: 'Script de vendas', text: 'Crie um script de vendas consultivas para [produto/serviço]. Estrutura: abertura (rapport), diagnóstico (perguntas), apresentação (benefícios), objeções comuns e fechamento.' },
  { category: 'design', label: 'Foto de produto', text: 'Professional product photo of [produto], pure white background, soft studio lighting, ultra realistic, 8k, commercial photography --ar 1:1 --v 6.1 --style raw' },
  { category: 'design', label: 'Post Instagram', text: 'Design a modern Instagram post for [marca], minimalist style, [cor] color palette, bold typography, professional aesthetic, 1:1 ratio.' },
  { category: 'produtividade', label: 'Ata de reunião', text: 'Transforme estas notas de reunião em uma ata formal com: participantes, pontos discutidos, decisões tomadas, próximos passos e responsáveis com prazo.' },
  { category: 'produtividade', label: 'Plano de projeto', text: 'Crie um plano de projeto completo para [projeto] com: objetivo, escopo, milestones, riscos identificados, recursos necessários e cronograma em 90 dias.' },
  { category: 'seo', label: 'Artigo SEO completo', text: 'Escreva um artigo SEO de 2000 palavras sobre [tema] para a keyword "[keyword]". Inclua: meta description de 160 caracteres, H2s otimizados, dados e estatísticas, conclusão com CTA.' },
  { category: 'seo', label: 'Plano de conteúdo', text: 'Crie um plano de conteúdo SEO de 12 artigos sobre [tema/nicho]. Para cada: título SEO, keyword principal, intenção de busca e CTA.' },
  { category: 'social', label: 'Thread para LinkedIn', text: 'Crie uma thread de 8 posts para LinkedIn sobre [tema]. Cada post: máximo 200 caracteres, começa com número e emoji, termina provocando curiosidade.' },
  { category: 'social', label: 'Script para Reels', text: 'Escreva um script de Reels de 30 segundos sobre [tema] para [público]. Estrutura: Hook (3s) + Conteúdo principal (22s) + CTA (5s). Tom: conversacional e direto.' },
];

export default function PromptsLibrary({ category }: { category?: Category }) {
  const [activePromptCat, setActivePromptCat] = useState('marketing');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('adai_fav_prompts');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const toggleFavorite = (label: string) => {
    const updated = favorites.includes(label) ? favorites.filter(f => f !== label) : [...favorites, label];
    setFavorites(updated);
    localStorage.setItem('adai_fav_prompts', JSON.stringify(updated));
  };

  const copyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const filtered = showFavoritesOnly
    ? PROMPTS_DB.filter(p => favorites.includes(p.label))
    : PROMPTS_DB.filter(p => p.category === activePromptCat);

  // If used inline within a category page, show category-specific prompts
  if (category) {
    const catPrompts = category.promptsExtra || [];
    const toolPrompts = category.tools.flatMap(t => (t.prompts || []).slice(0, 1));
    const allPrompts = [...catPrompts, ...toolPrompts].slice(0, 4);
    if (allPrompts.length === 0) return null;

    return (
      <div className="glass-smooth border border-white/5 rounded-[3rem] p-8 sm:p-12 mt-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        
        <div className="relative z-10 mb-10">
          <h3 className="text-3xl font-serif-display text-white mb-2 tracking-tight">Arsenal de Prompts</h3>
          <p className="text-sm text-white/30 font-light uppercase tracking-widest">Modelos prontos para acelerar seu fluxo</p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPrompts.map((pr, i) => (
            <div key={i} className="glass-smooth border border-white/5 rounded-2xl p-6 group/prompt hover:bg-white/[0.02] transition-colors">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3">{pr.label}</div>
              <p className="text-sm text-white/60 font-light leading-relaxed italic mb-6">"{pr.text}"</p>
              <button onClick={() => copyPrompt(pr.text, i)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-all">
                {copiedIdx === i ? <><Check size={14} className="text-green-500" /> Copiado!</> : <><Copy size={14} /> Copiar prompt</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full prompts library page
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div>
          <h2 className="text-5xl font-serif-display text-white mb-4">Biblioteca Global</h2>
          <p className="text-sm text-white/40 font-light uppercase tracking-[0.2em]">+200 prompts exclusivos para membros</p>
        </div>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${showFavoritesOnly ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30 hover:text-white'}`}
        >
          <Heart size={14} className={`inline mr-2 ${showFavoritesOnly ? 'fill-black' : ''}`} /> Favoritos ({favorites.length})
        </button>
      </div>

      {!showFavoritesOnly && (
        <div className="flex gap-3 mb-12 overflow-x-auto no-scrollbar pb-2">
          {PROMPT_CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setActivePromptCat(c.key)} className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap transition-all ${activePromptCat === c.key ? 'bg-white text-black border-white shadow-md' : 'bg-white/5 text-white/30 border-white/5 hover:border-white/20 hover:text-white'}`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((pr, i) => (
          <div key={i} className="glass-smooth border border-white/5 rounded-[2rem] p-8 group hover:bg-white/[0.02] transition-colors relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{pr.label}</span>
              <button onClick={() => toggleFavorite(pr.label)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                <Heart size={16} className={favorites.includes(pr.label) ? 'fill-red-500 text-red-500' : 'text-white/10'} />
              </button>
            </div>
            <p className="text-base text-white/50 font-light leading-relaxed italic mb-8">"{pr.text}"</p>
            <button onClick={() => copyPrompt(pr.text, i)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-all">
              {copiedIdx === i ? <><Check size={16} className="text-green-500" /> Copiado!</> : <><Copy size={16} /> Copiar prompt</>}
            </button>
          </div>
        ))}
      </div>
    </div>

  );
}
