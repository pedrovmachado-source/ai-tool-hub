import { Sparkles, PlayCircle } from 'lucide-react';
import { useState } from 'react';

export default function VideoMiningBanner() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="mb-16">
      <div className="relative overflow-hidden rounded-[2.5rem] glass-smooth px-8 py-10 border border-white/5 shadow-2xl bg-gradient-to-br from-brand-amber/5 to-transparent">
        <div className="relative flex flex-col items-center gap-8 max-w-5xl mx-auto">
          <div className="w-full text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-amber/10 text-brand-amber text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <Sparkles size={12} />
              <span>Conteúdo Exclusivo</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif-display text-white mb-4 italic text-center">Mineração de Infoprodutos na Europa</h2>
            <p className="text-white/40 text-base font-light leading-relaxed max-w-xl mx-auto mb-10">
              Aprenda como minerar produtos digitais no mercado europeu e saia na frente da concorrência brasileira. Estratégias inéditas reveladas em vídeo.
            </p>
          </div>
          
          <div className="w-full max-w-4xl aspect-video rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 shadow-2xl group">
            {!showVideo ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative cursor-pointer" onClick={() => setShowVideo(true)}>
                <img 
                  src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop" 
                  alt="Mineração na Europa" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-brand-amber flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)] group-hover:scale-110 transition-transform duration-500">
                    <PlayCircle className="w-10 h-10 text-black fill-current" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Clique para assistir</span>
                </div>
              </div>
            ) : (
              <iframe 
                src="https://www.youtube.com/embed/tyyJgnwIuYM?autoplay=1" 
                title="Mineração de Infoprodutos na Europa"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            )}
          </div>
          
          <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest mt-4">Conteúdo gratuito liberado para membros</p>
        </div>
      </div>
    </div>
  );
}
