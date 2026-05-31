import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CashCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Navbar onNavigate={(p) => navigate(p === 'home' ? '/' : `/${p}`)} />

      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="max-w-md w-full glass-smooth p-12 rounded-[3rem] border border-white/5 text-center animate-fade-in">
          <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto mb-8 flex items-center justify-center text-brand-red">
            <XCircle size={40} />
          </div>

          <h1 className="text-4xl font-serif-display text-white mb-4">Pagamento Cancelado</h1>
          <p className="text-white/40 font-light mb-10">
            Sua transação não foi concluída. Nenhum valor foi cobrado e sua carteira permanece igual.
          </p>

          <Button 
            onClick={() => navigate('/comprar-cash')}
            className="w-full h-14 rounded-xl bg-white/5 text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/10 border border-white/10 transition-all"
          >
            <ArrowLeft size={14} className="mr-2" /> Tentar novamente
          </Button>
        </div>
      </main>
    </div>
  );
}