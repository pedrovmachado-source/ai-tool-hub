import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  CheckCircle2, 
  Globe, 
  Settings, 
  LineChart, 
  Layout, 
  FileText, 
  CreditCard,
  Video,
  MessageCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Coins
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OfferModelingModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerTitle: string;
  offerId?: string;
}

export default function OfferModelingModal({ isOpen, onClose, offerTitle, offerId }: OfferModelingModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'info' | 'confirm' | 'success' | 'error'>('info');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [missingCash, setMissingCash] = useState(0);

  const priceCash = 9000;
  const phoneNumber = "5521965248844";

  useEffect(() => {
    if (!isOpen) {
      setStep('info');
      setLoading(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleWhatsApp = (message: string) => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePurchase = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Usamos um UUID fixo para o produto de modelagem ou o ID da oferta
      // Se não houver offerId, passamos null (o RPC trata)
      const { data, error } = await supabase.rpc('spend_cash', {
        p_user: user.id,
        p_amount: priceCash,
        p_product: offerId || '00000000-0000-0000-0000-000000000000'
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; missing?: number };

      if (result.success) {
        setStep('success');
        toast.success("Modelagem profissional adquirida!");
      } else {
        setStep('error');
        setErrorMessage(result.error || "Erro desconhecido");
        if (result.missing) setMissingCash(result.missing);
      }
    } catch (err: any) {
      console.error(err);
      setStep('error');
      setErrorMessage(err.message || "Erro ao processar compra");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Layout, text: "Página de vendas com copywriting totalmente refeita" },
    { icon: CreditCard, text: "Checkout pronto para ativar" },
    { icon: FileText, text: "5 criativos com copy feita à mão por editor da equipe" },
    { icon: Globe, text: "País ideal para você rodar os ads" },
    { icon: Settings, text: "Conta de anúncios totalmente configurada" },
    { icon: LineChart, text: "Tranqueamento de dados avançado via GTM e Stape (API)" },
    { icon: Rocket, text: "Primeiro modelo de campanha já configurado" },
    { icon: Video, text: "3 aulas sobre otimização de oferta, funil e campanhas" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-white/10 text-white max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl">
        <div className="relative p-8 md:p-12">
          {step === 'info' && (
            <>
              <DialogHeader className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-amber/10 flex items-center justify-center mb-4">
                  <Rocket className="w-8 h-8 text-brand-amber" />
                </div>
                <DialogTitle className="text-3xl font-serif-display leading-tight">
                  Modelagem Completa de Oferta: <span className="text-brand-amber italic font-normal">{offerTitle}</span>
                </DialogTitle>
                <DialogDescription className="text-white/50 text-base leading-relaxed">
                  Deixe nossa equipe de especialistas transformar essa oferta em uma máquina de escala. 
                  Nós cuidamos de toda a parte técnica e estratégica para você.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="mt-1">
                      <feature.icon className="w-4 h-4 text-brand-amber" />
                    </div>
                    <span className="text-xs text-white/70 leading-relaxed font-light">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Investimento Elite</span>
                    <span className="text-2xl font-serif-display text-white">9.000 Créditos</span>
                  </div>
                  <Button 
                    onClick={() => setStep('confirm')}
                    className="h-14 px-10 rounded-full bg-brand-amber text-black hover:bg-brand-amber/90 font-bold text-sm tracking-tight transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                  >
                    Comprar Agora
                  </Button>
                </div>
                <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.2em] font-medium">
                  Prazo de entrega: 5 a 7 dias úteis após o briefing
                </p>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-brand-amber/10 rounded-3xl mx-auto mb-8 flex items-center justify-center text-brand-amber">
                <Coins className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-serif-display text-white mb-4">Confirmar Pagamento</h3>
              <p className="text-white/40 text-sm font-light mb-10 leading-relaxed max-w-sm mx-auto">
                Você está prestes a investir <span className="text-white font-medium">9.000 Cash</span> para a modelagem profissional da oferta <span className="text-white font-medium">{offerTitle}</span>.
              </p>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-white text-black text-sm font-bold uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar e Debitar 9.000 Cash"}
                </Button>
                
                <Button
                  onClick={() => handleWhatsApp("Fala Kayosa, quero que a equipe modele uma oferta da Club!")}
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white text-sm font-bold uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 text-[#25D366]" /> Falar no WhatsApp
                </Button>

                <button 
                  onClick={() => setStep('info')}
                  className="text-white/20 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em] pt-2"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-500/10 rounded-3xl mx-auto mb-8 flex items-center justify-center text-green-500">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-3xl font-serif-display text-white mb-4">Pagamento Confirmado!</h3>
              <p className="text-white/40 text-sm font-light mb-10 leading-relaxed max-w-sm mx-auto">
                Sua solicitação foi recebida com sucesso. Agora, entre em contato com o Kayosa para iniciar o processo de modelagem.
              </p>
              
              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => handleWhatsApp("Fala Kayosa, já comprei a modelagem de uma oferta da Club!")}
                  className="w-full h-16 rounded-2xl bg-[#25D366] text-white text-sm font-bold uppercase hover:bg-[#1eb956] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(37,211,102,0.2)]"
                >
                  <MessageCircle className="w-6 h-6" /> Falar com Kayosa
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full h-14 rounded-2xl text-white/40 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                >
                  Fechar Janela
                </Button>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-brand-red/10 rounded-3xl mx-auto mb-8 flex items-center justify-center text-red-500">
                <AlertCircle size={40} />
              </div>
              
              <h3 className="text-3xl font-serif-display text-white mb-4">
                {errorMessage === 'Insufficient balance' ? 'Saldo Insuficiente' : 'Erro no Processamento'}
              </h3>
              
              {errorMessage === 'Insufficient balance' ? (
                <>
                  <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5 max-w-sm mx-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Seu Saldo Atual</span>
                      <span className="text-white font-serif-display">{(user?.cashBalance || 0).toLocaleString('pt-BR')} Cash</span>
                    </div>
                    <div className="flex justify-between items-center text-red-400 font-bold">
                      <span className="text-[10px] uppercase tracking-widest">Faltam</span>
                      <span className="font-serif-display">{missingCash.toLocaleString('pt-BR')} Cash</span>
                    </div>
                  </div>
                  
                  <p className="text-white/40 text-sm font-light mb-10 leading-relaxed max-w-sm mx-auto">
                    Você não possui saldo suficiente para esta operação, mas não se preocupe! Você pode me chamar direto no WhatsApp para resolvermos.
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={() => handleWhatsApp(`Fala Kayosa, quero a modelagem da oferta ${offerTitle}, mas estou sem saldo!`)}
                      className="w-full h-16 rounded-2xl bg-[#25D366] text-white text-sm font-bold uppercase hover:bg-[#1eb956] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(37,211,102,0.2)]"
                    >
                      <MessageCircle className="w-6 h-6" /> Chamar no WhatsApp
                    </Button>
                    
                    <button 
                      onClick={() => setStep('info')}
                      className="text-white/20 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em] pt-2"
                    >
                      Voltar para detalhes
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-white/40 text-sm font-light mb-10 leading-relaxed max-w-sm mx-auto">
                    {errorMessage}
                  </p>
                  <Button
                    onClick={() => setStep('info')}
                    className="w-full h-14 rounded-2xl bg-white/10 text-white text-sm font-bold uppercase"
                  >
                    Tentar Novamente
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
