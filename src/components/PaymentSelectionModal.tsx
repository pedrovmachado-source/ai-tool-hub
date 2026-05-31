import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, QrCode, Percent, ArrowRight, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceId: string;
  productId: string;
  productTitle: string;
}

export default function PaymentSelectionModal({ 
  isOpen, 
  onClose, 
  priceId, 
  productId, 
  productTitle 
}: PaymentSelectionModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      (async () => {
        const { data } = await supabase
          .from('profiles')
          .select('cash_balance')
          .single();
        if (data) setUserBalance(Number(data.cash_balance));
      })();
    }
  }, [isOpen]);

  const handlePayment = async (isPix: boolean) => {
    setLoading(isPix ? 'pix' : 'card');
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId, 
          productId, 
          mode: 'payment',
          isPix 
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Erro ao iniciar o pagamento. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-[#0D0D0F] border border-white/10 text-white rounded-[2.5rem] p-8 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
          <Percent size={120} />
        </div>
        
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-serif-display tracking-tight mb-2">
            Escolha como pagar
          </DialogTitle>
          <DialogDescription className="text-white/40 font-light text-base">
            Selecione o método de pagamento para <span className="text-white font-medium">{productTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <button
            onClick={() => handlePayment(true)}
            disabled={!!loading}
            className="group relative w-full p-6 glass-smooth rounded-[2rem] border border-brand-green/20 hover:border-brand-green/50 hover:bg-brand-green/5 transition-all text-left overflow-hidden active:scale-[0.98]"
          >
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-black transition-all duration-500">
                <QrCode size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">Pix</span>
                  <span className="bg-brand-green/20 text-brand-green text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    -10% OFF
                  </span>
                </div>
                <p className="text-white/40 text-xs font-light">Liberação instantânea com desconto especial</p>
              </div>
              <ArrowRight size={20} className="text-white/10 group-hover:text-brand-green group-hover:translate-x-1 transition-all" />
            </div>
            {loading === 'pix' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>

          <button
            onClick={() => handlePayment(false)}
            disabled={!!loading}
            className="group relative w-full p-6 glass-smooth rounded-[2rem] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left overflow-hidden active:scale-[0.98]"
          >
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-black transition-all duration-500">
                <CreditCard size={28} />
              </div>
              <div className="flex-1">
                <span className="font-bold text-lg block mb-1">Cartão de Crédito</span>
                <p className="text-white/40 text-xs font-light">Em até 12x (valor integral)</p>
              </div>
              <ArrowRight size={20} className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            {loading === 'card' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-[#0D0D0F] px-4 text-white/20">Ou use seu saldo</span>
            </div>
          </div>

          <button
            onClick={() => { onClose(); navigate('/comprar-cash'); }}
            className="group relative w-full p-6 glass-smooth rounded-[2rem] border border-brand-amber/10 hover:border-brand-amber/30 hover:bg-brand-amber/5 transition-all text-left overflow-hidden active:scale-[0.98]"
          >
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 bg-brand-amber/10 rounded-2xl flex items-center justify-center text-brand-amber group-hover:bg-brand-amber group-hover:text-black transition-all duration-500">
                <Coins size={28} />
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-0.5 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">Recarregar Cash</span>
                    <span className="bg-brand-amber/20 text-brand-amber text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-brand-amber/10">
                      CASHBACK DISPONÍVEL
                    </span>
                  </div>
                  {userBalance !== null && (
                    <span className="text-[11px] text-brand-amber/60 font-medium">Seu Saldo Atual: {userBalance.toLocaleString('pt-BR')} Cash</span>
                  )}
                </div>
                <p className="text-white/40 text-xs font-light">Abata o valor ou facilite compras futuras com Cash</p>
              </div>
              <ArrowRight size={20} className="text-white/10 group-hover:text-brand-amber group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        <p className="mt-8 text-[10px] text-center text-white/20 uppercase tracking-[0.2em] font-bold">
          Pagamento 100% Seguro via Stripe
        </p>
      </DialogContent>
    </Dialog>
  );
}