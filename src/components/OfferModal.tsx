import { X, ExternalLink, ShoppingCart } from 'lucide-react';

export interface OfferData {
  title: string;
  description: string;
  example_url?: string | null;
  buy_url?: string | null;
  image_url?: string | null;
}

export default function OfferModal({ offer, onClose }: { offer: OfferData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div className="bg-[#0D0D0F] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-8 pb-4 border-b border-white/5">
          <h3 className="font-serif-display text-2xl text-white truncate tracking-tight">{offer.title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all"><X size={20} /></button>
        </div>
        {offer.image_url && (
          <img src={offer.image_url} alt={offer.title} className="w-full h-48 sm:h-64 object-cover grayscale hover:grayscale-0 transition-all duration-700" />
        )}
        <div className="p-8">
          {offer.description && (
            <p className="text-sm text-white/40 font-light whitespace-pre-wrap leading-relaxed mb-8">{offer.description}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            {offer.example_url && (
              <a href={offer.example_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all active:scale-[0.98]">
                <ExternalLink size={16} /> Ver exemplo
              </a>
            )}
            {offer.buy_url && (
              <a href={offer.buy_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all flex-1 shadow-lg active:scale-[0.98]">
                <ShoppingCart size={16} /> Comprar agora
              </a>
            )}
          </div>
          {!offer.example_url && !offer.buy_url && (
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] italic text-center">Em breve disponível</p>
          )}
        </div>
      </div>
    </div>

  );
}
