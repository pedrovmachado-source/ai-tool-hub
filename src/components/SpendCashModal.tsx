import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SpendCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  priceCash: number;
}

const CashIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    
    <path d="M11 8c-1.5 0-3 .5-3 2s1.5 2 3 2 3 .5 3 2-1.5 2-3 2" />
    <path d="M12 6v12" />
  </svg>
);

export default function SpendCashModal({ isOpen, onClose, productId, productName, priceCash }: SpendCashModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [missingCash, setMissingCash] = useState(0);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setLoading(true);
    setStatus('idle');
    
    try {
      const { data, error } = await supabase.rpc('spend_cash', {
        p_user: (await supabase.auth.getUser()).data.user?.id,
        p_amount: priceCash,
        p_product: productId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; missing?: number };

      if (result.success) {
        setStatus('success');
        toast.success("Compra realizada com sucesso!");
      } else {
        setStatus('error');
        setErrorMessage(result.error || "Erro desconhecido");
        if (result.missing) setMissingCash(result.missing);
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || "Erro ao processar compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#0D0D0F] border border-white/10 rounded-[3rem] p-10 text-center animate-scale-in">
        {status === 'idle' && (
          <>
            <div className="w-20 h-20 bg-white/5 rounded-2xl mx-auto mb-8 flex items-center justify-center text-brand-amber">
              <CashIcon className="w-10 h-10" />
            </div>
            
            <h3 className="text-3xl font-serif-display text-white mb-2">Confirmar Compra</h3>
            <p className="text-white/40 text-sm font-light mb-8">
              Você está adquirindo <span className="text-white font-medium">{productName}</span> por:
            </p>

            <div className="bg-white/5 rounded-xl p-6 mb-10 flex items-center justify-center gap-3 border border-white/5">
              <CashIcon className="text-brand-amber" />
              <span className="text-4xl font-serif-display text-white">{priceCash.toLocaleString('pt-BR')}</span>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">Cash</span>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full h-14 rounded-xl bg-white text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar e Debitar"}
              </Button>
              <button 
                onClick={onClose}
                className="text-white/20 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em] py-2"
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto mb-8 flex items-center justify-center text-green-500">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-3xl font-serif-display text-white mb-4">Sucesso!</h3>
            <p className="text-white/40 text-sm font-light mb-10 leading-relaxed">
              O item foi adicionado à sua conta. Você já pode acessá-lo agora.
            </p>
            <Button
              onClick={() => { onClose(); navigate('/menu'); }}
              className="w-full h-14 rounded-xl bg-white text-black text-xs font-bold tracking-[0.2em] uppercase"
            >
              Acessar Agora <ArrowRight size={14} className="ml-2" />
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto mb-8 flex items-center justify-center text-brand-red">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-3xl font-serif-display text-white mb-4">
              {errorMessage === 'Insufficient balance' ? 'Cash Insuficiente' : 'Erro na Compra'}
            </h3>
            
            {errorMessage === 'Insufficient balance' ? (
              <>
                <p className="text-white/40 text-sm font-light mb-10">
                  Faltam <span className="text-white font-medium">{missingCash.toLocaleString('pt-BR')} Cash</span> para completar esta compra.
                </p>
                <Button
                  onClick={() => { onClose(); navigate('/comprar-cash'); }}
                  className="w-full h-14 rounded-xl bg-brand-amber text-black text-xs font-bold tracking-[0.2em] uppercase"
                >
                  Recarregar Carteira
                </Button>
              </>
            ) : (
              <>
                <p className="text-white/40 text-sm font-light mb-10">{errorMessage}</p>
                <Button
                  onClick={() => setStatus('idle')}
                  className="w-full h-14 rounded-xl bg-white/10 text-white text-xs font-bold tracking-[0.2em] uppercase"
                >
                  Tentar Novamente
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}