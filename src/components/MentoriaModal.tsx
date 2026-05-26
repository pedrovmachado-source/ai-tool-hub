import { X, ExternalLink, ShieldCheck, Globe, Rocket } from 'lucide-react';
import { Button } from './ui/button';

interface MentoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MentoriaModal({ isOpen, onClose }: MentoriaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <div 
        className="bg-[#050505] border border-white/10 rounded-[2.5rem] w-full max-w-[540px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300" 
        onClick={e => e.stopPropagation()}
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -ml-32 -mb-32 pointer-events-none" />

        <div className="flex items-center justify-between p-8 pb-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">Acesso Restrito</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 pt-4 relative z-10 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
            <Globe className="w-10 h-10 text-white/80" />
          </div>

          <h2 className="text-3xl md:text-4xl font-serif-display text-white mb-6">
            Mentoria <em className="italic font-normal">Europa 1%</em>
          </h2>
          
          <div className="space-y-6 mb-10 text-left bg-white/[0.02] p-6 rounded-3xl border border-white/5">
            <p className="text-white/60 leading-relaxed font-light">
              A Área do Aluno é um portal exclusivo para os membros da minha <span className="text-white font-medium">Mentoria de Infoprodutos para a Europa</span>.
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-1">
                  <Rocket className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Escala Internacional</h4>
                  <p className="text-xs text-white/40 leading-relaxed">Aprenda a vender em Euro e escalar seus produtos em mercados de alta sofisticação.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button 
              onClick={() => window.open('https://kayosa.com.br', '_blank')}
              className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-full font-bold text-sm uppercase tracking-widest gap-3"
            >
              Conhecer a Mentoria
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            <button 
              onClick={onClose}
              className="text-[10px] font-bold text-white/20 hover:text-white/40 uppercase tracking-[0.3em] transition-colors py-2"
            >
              Talvez mais tarde
            </button>
          </div>
        </div>

        <div className="p-6 text-center border-t border-white/5 bg-white/[0.01]">
          <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.4em]">
            Convert Club · Private Elite Access
          </p>
        </div>
      </div>
    </div>
  );
}
