import { Sparkles, Coins } from 'lucide-react';

interface VideoMiningBannerProps {
  products: any[];
  onSelectProduct: (product: any) => void;
}

export default function VideoMiningBanner({ products, onSelectProduct }: VideoMiningBannerProps) {
  const videoProduct = products.find(p => p.slug === 'video-mineracao-europa');

  return (
    <div className="mb-16">
      <div className="relative overflow-hidden rounded-[2.5rem] glass-smooth px-8 py-10 border border-white/5 shadow-2xl bg-gradient-to-br from-brand-amber/5 to-transparent">
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-amber/10 text-brand-amber text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <Sparkles size={12} />
              <span>Conteúdo Exclusivo</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif-display text-white mb-4 italic">Mineração de Infoprodutos na Europa</h2>
            <p className="text-white/40 text-base font-light leading-relaxed max-w-xl">
              Aprenda como minerar produtos digitais no mercado europeu e saia na frente da concorrência brasileira. Estratégias inéditas reveladas em vídeo.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4 bg-white/5 p-8 rounded-[2rem] border border-white/5 min-w-[240px]">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Acesso Imediato</span>
              <div className="flex items-center gap-2 text-brand-amber">
                <Coins className="w-6 h-6" />
                <span className="text-4xl font-serif-display">10</span>
                <span className="text-xs font-bold uppercase tracking-widest mt-2">Cash</span>
              </div>
            </div>
            
            <button 
              onClick={() => onSelectProduct(videoProduct)}
              className="w-full py-4 px-8 rounded-full bg-brand-amber text-black text-sm font-bold hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(251,191,36,0.2)]"
            >
              Liberar Vídeo Agora
            </button>
            <p className="text-[10px] text-white/20 font-medium">Assista onde e quando quiser</p>
          </div>
        </div>
      </div>
    </div>
  );
}
