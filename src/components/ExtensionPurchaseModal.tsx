import { X, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExtensionPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtensionPurchaseModal({ isOpen, onClose }: ExtensionPurchaseModalProps) {
  const { toast } = useToast();

  if (!isOpen) return null;

  const handlePurchase = () => {
    toast({
      title: "Redirecionando...",
      description: "Você será levado ao checkout para acesso vitalício.",
    });
    window.open('https://loja.lovable.dev/credits', '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <div 
        className="bg-[#050505] border border-white/10 rounded-[2.5rem] w-full max-w-[500px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300" 
        onClick={e => e.stopPropagation()}
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -ml-32 -mb-32 pointer-events-none" />

        <div className="flex items-center justify-between p-8 pb-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Zap className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400/80 tracking-[0.2em] uppercase">Oferta Especial</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 pt-4 relative z-10 text-center">
          <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CreditCard className="w-10 h-10 text-blue-400" />
          </div>

          <h2 className="text-3xl font-serif-display text-white mb-4">
            Extensão <em className="italic font-normal">Lovable</em>
          </h2>
          
          <div className="space-y-4 mb-10 text-left bg-white/[0.02] p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Produto</span>
              <span className="text-white font-medium text-sm text-right">Extensão Convert Club</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Tipo</span>
              <span className="text-blue-400 font-medium text-sm text-right">Acesso Vitalício</span>
            </div>
            <div className="h-px bg-white/5 w-full" />
            <div className="flex items-center justify-between pt-2">
              <span className="text-white font-bold text-xs uppercase tracking-[0.2em]">Total</span>
              <div className="text-right">
                <span className="text-2xl font-serif-display text-white">1400</span>
                <span className="text-[10px] text-white/40 ml-2 uppercase tracking-widest font-bold">Créditos</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button 
              onClick={handlePurchase}
              className="w-full h-14 bg-blue-600 text-white hover:bg-blue-500 rounded-full font-bold text-sm uppercase tracking-widest gap-3 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              Confirmar Compra
              <Zap className="w-4 h-4 fill-current" />
            </Button>
            
            <button 
              onClick={onClose}
              className="text-[10px] font-bold text-white/20 hover:text-white/40 uppercase tracking-[0.3em] transition-colors py-2"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="p-6 text-center border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-3 h-3 text-green-500/50" />
            <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.4em]">
              Checkout Seguro · Ativação Instantânea
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
