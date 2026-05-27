import { Hammer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnderConstructionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  onBack?: () => void;
}

export default function UnderConstruction({ 
  children, 
  title = "Página em Construção", 
  description = "Estamos trabalhando duro para trazer as melhores ferramentas para você em breve.",
  onBack
}: UnderConstructionProps) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/menu'));

  return (
    <div className="relative w-full h-full min-h-screen">
      {/* Blurred content background */}
      <div className="filter blur-[6px] pointer-events-none select-none opacity-40">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-50 p-6 bg-black/40 backdrop-blur-[4px]">
        <div className="max-w-md w-full glass-smooth p-8 sm:p-12 rounded-[2.5rem] border border-white/10 text-center shadow-2xl animate-in fade-in zoom-in duration-500 bg-black/60 relative">
          <button 
            onClick={handleBack}
            className="absolute top-6 left-6 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="w-20 h-20 bg-brand-amber/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-amber/20">
            <Hammer size={40} className="text-brand-amber animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-serif-display text-white mb-4 tracking-tight">
            {title}
          </h2>
          
          <p className="text-white/40 font-light mb-8 leading-relaxed">
            {description}
          </p>
          
          <div className="h-1 w-20 bg-brand-amber/30 mx-auto rounded-full overflow-hidden mb-8">
            <div className="h-full bg-brand-amber animate-progress-indefinite w-1/2 rounded-full" />
          </div>

          <button 
            onClick={handleBack}
            className="w-full py-4 rounded-full bg-white text-black font-bold hover:scale-[1.02] transition-transform text-sm"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    </div>
  );
}

