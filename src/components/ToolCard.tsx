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
      className={`glass-smooth border transition-all duration-500 hover:bg-white/10 group relative rounded-[2rem] flex flex-col h-full ${isFree ? 'border-white/20' : 'border-white/5'}`}
    >
      {isFree && (
        <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 text-[9px] font-bold px-3 py-1 rounded-full bg-white text-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Free
        </div>
      )}
      
      <div className="p-8 flex-1">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-serif-display text-white tracking-tight">{tool.name}</h3>
          {!isFree && (
            <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 uppercase tracking-widest">{tool.badge}</span>
          )}
        </div>

        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-white/30 hover:text-white transition-colors group/link">
          <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" /> {tool.urlLabel}
        </a>

        <p className="text-sm text-white/40 font-light leading-relaxed mb-8">{tool.desc}</p>

        {tool.stats && (
          <div className="grid grid-cols-3 gap-4 mt-auto">
            {tool.stats.slice(0, 3).map((s, i) => (
              <div key={i} className="text-left border-l border-white/10 pl-3">
                <div className="text-base font-serif-display text-white/80">{s.num}</div>
                <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">{s.lbl}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 pt-0 flex gap-3">
        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center bg-white/5 border border-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]">
          Link Oficial
        </a>
        <button onClick={onOpenEbook} className="flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center bg-white text-black hover:bg-white/90 transition-all shadow-lg active:scale-[0.98]">
          Guia & E-book
        </button>
      </div>
    </div>

  );
}
