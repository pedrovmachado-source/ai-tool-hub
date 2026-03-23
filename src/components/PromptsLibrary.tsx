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
      <div className="bg-card border border-border rounded-xl p-7 mt-7">
        <h3 className="text-base font-medium mb-1">✍️ Prompts prontos para esta categoria</h3>
        <p className="text-[13px] text-muted-foreground mb-5">Copie, adapte e use nos seus projetos</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allPrompts.map((pr, i) => (
            <div key={i} className="bg-secondary rounded-lg p-4" style={{ borderLeft: `3px solid ${category.accent}` }}>
              <div className="text-[10px] font-medium uppercase tracking-wider mb-1.5" style={{ color: category.accent }}>{pr.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">{pr.text}</p>
              <button onClick={() => copyPrompt(pr.text, i)} className="flex items-center gap-1 mt-2 text-[11.5px] font-medium" style={{ color: category.accent }}>
                {copiedIdx === i ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar prompt</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full prompts library page
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif-display text-2xl">Biblioteca de Prompts</h2>
          <p className="text-sm text-muted-foreground mt-1">+200 prompts prontos para copiar e usar</p>
        </div>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${showFavoritesOnly ? 'bg-brand-red text-primary-foreground border-brand-red' : 'border-border text-muted-foreground hover:border-brand-red'}`}
        >
          <Heart size={12} className="inline mr-1" /> Favoritos ({favorites.length})
        </button>
      </div>

      {!showFavoritesOnly && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {PROMPT_CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setActivePromptCat(c.key)} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${activePromptCat === c.key ? 'bg-brand-blue text-primary-foreground border-brand-blue' : 'border-border text-muted-foreground hover:border-brand-blue'}`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((pr, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-brand-blue uppercase tracking-wider">{pr.label}</span>
              <button onClick={() => toggleFavorite(pr.label)}>
                <Heart size={14} className={favorites.includes(pr.label) ? 'fill-brand-red text-brand-red' : 'text-muted-foreground'} />
              </button>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed italic mb-3">{pr.text}</p>
            <button onClick={() => copyPrompt(pr.text, i)} className="flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline">
              {copiedIdx === i ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar prompt</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
