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
    <div className="fixed inset-0 z-[400] bg-black/70 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-serif-display text-lg truncate">{offer.title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary"><X size={18} /></button>
        </div>
        {offer.image_url && (
          <img src={offer.image_url} alt={offer.title} className="w-full h-40 sm:h-52 object-cover" />
        )}
        <div className="p-5">
          {offer.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-6 mb-5">{offer.description}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            {offer.example_url && (
              <a href={offer.example_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-secondary transition-colors">
                <ExternalLink size={14} /> Ver exemplo
              </a>
            )}
            {offer.buy_url && (
              <a href={offer.buy_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-amber text-white text-sm font-medium hover:opacity-90 transition-opacity flex-1">
                <ShoppingCart size={14} /> Comprar agora
              </a>
            )}
          </div>
          {!offer.example_url && !offer.buy_url && (
            <p className="text-xs text-muted-foreground/60 italic">Em breve mais informações.</p>
          )}
        </div>
      </div>
    </div>
  );
}
