import { AlertTriangle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Blocked() {
  const whatsappUrl = "https://wa.me/5521965248844?text=Fui%20bloqueado%20pelo%20Error%202";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-red-500 rounded-full blur opacity-25"></div>
          <div className="relative bg-black border border-red-500/50 p-6 rounded-full inline-flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
            Error 2 - Abuso de convites
          </h1>
          <p className="text-gray-400 text-lg">
            Detectamos um comportamento irregular relacionado ao uso do sistema de convites. Por questões de segurança, seu acesso foi restringido.
          </p>
        </div>

        <div className="pt-8">
          <Button 
            asChild
            className="w-full bg-white text-black hover:bg-gray-200 h-16 text-lg font-bold rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="w-6 h-6 mr-2" />
              Entre em contato com o suporte
            </a>
          </Button>
          
          <p className="mt-8 text-xs text-gray-600 uppercase tracking-widest">
            ID de Referência: AB-ERROR-2
          </p>
        </div>
      </div>
    </div>
  );
}
