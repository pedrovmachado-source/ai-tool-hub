import { ExternalLink, ArrowUpRight, BookOpen } from 'lucide-react';
import type { Tool, Category } from '@/data/tools-data';

interface ToolCardProps {
  tool: Tool;
  category: Category;
  onOpenEbook: () => void;
}

export default function ToolCard({ tool, category, onOpenEbook }: ToolCardProps) {
  const badgeLower = (tool.badge || '').toLowerCase();
  const isFree = badgeLower.includes('grát') || badgeLower.includes('grat') || badgeLower === 'free' || badgeLower.includes('100%') || badgeLower.includes('gratuit');

  return (
    <div className="group relative glass-smooth border border-white/5 rounded-[2rem] p-7 flex flex-col h-full transition-all duration-500 hover:bg-white/10">
      <div className="flex items-start justify-between gap-3 mb-5">
        <span
          className={`inline-block px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] border ${
            isFree
              ? 'bg-white text-black border-white'
              : 'bg-white/5 border-white/5 text-white/40'
          }`}
        >
          {isFree ? '100% Grátis' : tool.badge}
        </span>
      </div>

      <h3 className="font-serif-display text-2xl text-white mb-2">{tool.name}</h3>

      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors mb-4 w-fit"
      >
        <ExternalLink size={11} /> {tool.urlLabel}
      </a>

      <p className="text-sm text-white/30 leading-relaxed font-light flex-1">{tool.desc}</p>

      {tool.stats && (
        <div className="flex gap-3 mt-6">
          {tool.stats.slice(0, 3).map((s, i) => (
            <div key={i} className="flex-1 bg-white/5 border border-white/5 rounded-xl px-2 py-2.5 text-center">
              <div className="text-base font-serif-display text-white">{s.num}</div>
              <div className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-bold mt-0.5">{s.lbl}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-7">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Acessar ${tool.name}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] bg-white/5 border border-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-500"
        >
          Acessar <ArrowUpRight className="w-3 h-3" />
        </a>
        <button
          onClick={onOpenEbook}
          aria-label={`Abrir e-book de ${tool.name}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black hover:opacity-90 transition-opacity"
        >
          <BookOpen className="w-3 h-3" /> E-Book
        </button>
      </div>
    </div>
  );
}
