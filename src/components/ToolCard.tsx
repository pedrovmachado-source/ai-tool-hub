import { ExternalLink } from 'lucide-react';
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
    <div
      className={`bg-card border rounded-xl overflow-hidden transition-all hover:shadow-brand-sm group relative ${isFree ? 'border-border ring-1 ring-border' : 'border-border'}`}
    >
      {isFree && (
        <div className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground text-background shadow-brand-sm">
          🆓 100% Grátis
        </div>
      )}
      <div className="p-4 pb-3.5">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[15px] font-medium">{tool.name}</span>
          {!isFree && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tool.badge}</span>
          )}
        </div>
        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium mb-2 hover:underline text-foreground">
          <ExternalLink size={11} /> {tool.urlLabel}
        </a>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{tool.desc}</p>
        {tool.stats && (
          <div className="flex gap-3 mt-3">
            {tool.stats.slice(0, 3).map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-sm font-medium text-foreground">{s.num}</div>
                <div className="text-[10px] text-muted-foreground">{s.lbl}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 px-4 py-3 bg-secondary/50 border-t border-border">
        <a 
          href={tool.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label={`Acessar ${tool.name}`}
          className="flex-1 py-2 rounded-lg text-xs font-medium text-center bg-card border border-border hover:border-foreground/40 transition-colors"
        >
          Acessar
        </a>
        <button 
          onClick={onOpenEbook} 
          aria-label={`Abrir e-book de ${tool.name}`}
          className="flex-1 py-2 rounded-lg text-xs font-medium text-center text-primary-foreground transition-opacity hover:opacity-90 bg-primary" 
        >
          📘 E-Book
        </button>
      </div>
    </div>
  );
}
