import { ExternalLink, Sparkles, BookOpen } from 'lucide-react';
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
      className={`group relative flex flex-col glass-morphism transition-all duration-500 rounded-[2.5rem] border border-white/5 overflow-hidden hover:scale-[1.02] hover:shadow-2xl hover:bg-white/5`}
    >
      {isFree && (
        <div className="absolute top-6 right-6 z-10 inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full bg-brand-emerald text-black shadow-lg uppercase tracking-wider animate-pulse">
          <Sparkles size={10} /> Free
        </div>
      )}
      
      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.accent }} />
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{category.label}</span>
          </div>
          <h3 className="text-2xl font-serif-display text-white group-hover:text-brand-violet transition-colors duration-300">
            {tool.name}
          </h3>
        </div>

        <p className="text-white/30 text-sm font-light leading-relaxed mb-8 flex-1 line-clamp-3">
          {tool.desc}
        </p>

        {tool.stats && tool.stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-white/5">
            {tool.stats.slice(0, 2).map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-lg font-serif-display text-white">{s.num}</span>
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{s.lbl}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-auto">
          <a 
            href={tool.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-center glass-morphism border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Acessar <ExternalLink size={12} />
          </a>
          <button 
            onClick={onOpenEbook} 
            className="flex-1 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-center bg-white text-black hover:bg-white/90 transition-all flex items-center justify-center gap-2 hover-glow"
          >
            <BookOpen size={12} /> E-Book
          </button>
        </div>
      </div>
    </div>
  );
}
