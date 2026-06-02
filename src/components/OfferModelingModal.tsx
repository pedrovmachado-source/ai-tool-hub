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

export default function OfferModelingModal({ isOpen, onClose, offerTitle }: OfferModelingModalProps) {
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
      <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-white/10 text-white max-h-[90vh] overflow-y-auto rounded-[2rem]">
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
              className="h-14 px-10 rounded-full bg-brand-amber text-black hover:bg-brand-amber/90 font-bold text-sm tracking-tight transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            >
              Comprar Agora
            </Button>
          </div>
          <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.2em] font-medium">
            Prazo de entrega: 5 a 7 dias úteis após o briefing
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
