import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  ShieldCheck,
  Zap,
  Sparkles,
  Rocket,
} from 'lucide-react';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TermsModal } from '@/components/TermsModal';
import logoAdai from '@/assets/logo.png';

export default function Auth() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // UI states
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/menu');
    }
  }, [user, authLoading, navigate]);

  const handleGoogleSignIn = async () => {
    if (!acceptedTerms) {
      setError('Você deve aceitar os termos de serviço para continuar.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await lovable.auth.signInWithOAuth('google');
      if (result.error) {
        setError(result.error.message);
        setSubmitting(false);
      }
    } catch (err) {
      setError('Erro ao conectar com Google. Tente novamente.');
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row font-sans selection:bg-white/20">
      {/* Left side - Brand/Marketing (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-white/[0.03] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-white/[0.03] blur-[120px]" />
        </div>
        
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-2xl overflow-hidden glass-smooth border border-white/10 p-1 group-hover:scale-110 transition-transform">
              <img src={logoAdai} alt="AdAI" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif-display text-white tracking-tight">CONVERT CLUB</span>
              <span className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase">Elite Community</span>
            </div>
          </button>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-6xl font-serif-display text-white leading-[1.1] mb-8 tracking-tighter">
            Onde a <em className="italic font-normal">Escala</em> se torna inevitável.
          </h2>
          <div className="space-y-6">
            {[
              { icon: Zap, text: "Acesso a ferramentas exclusivas de IA" },
              { icon: Sparkles, text: "Networking com os 1% do mercado" },
              { icon: Rocket, text: "Estratégias validadas de alta conversão" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white/50">
                <div className="w-10 h-10 rounded-xl glass-smooth border border-white/5 flex items-center justify-center shrink-0">
                  <item.icon size={18} />
                </div>
                <span className="font-light">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
          <span>© 2026 Convert Club</span>
          <span>Privacidade</span>
          <span>Termos</span>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="lg:hidden absolute top-8 left-8">
           <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden glass-smooth border border-white/10 p-1">
              <img src={logoAdai} alt="AdAI" className="w-full h-full object-cover rounded-lg" />
            </div>
          </button>
        </div>

        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-serif-display text-white mb-3">
              Acesse o Club
            </h1>
            <p className="text-white/40 font-light">
              Escolha um dos métodos abaixo para entrar na maior comunidade de infoprodutores.
            </p>
          </div>

          <div className="glass-smooth border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 animate-in fade-in zoom-in-95">
                <p className="text-xs text-red-500 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn}
                disabled={submitting}
                variant="outline"
                className="w-full h-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white gap-3 transition-all text-base"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar com Google
              </Button>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 mt-6">
                <Checkbox 
                  id="terms" 
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-1 border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                />
                <label 
                  htmlFor="terms" 
                  className="text-xs text-white/50 leading-relaxed cursor-pointer select-none"
                >
                  <button 
                    onClick={() => setIsTermsModalOpen(true)}
                    className="text-white hover:underline font-medium"
                  >
                    aceitar os Termos de serviço
                  </button>.
                </label>
              </div>
            </div>

            <TermsModal 
              isOpen={isTermsModalOpen} 
              onClose={() => setIsTermsModalOpen(false)} 
            />

            {submitting && (
              <div className="mt-8 flex justify-center">
                <Loader2 className="animate-spin text-white/20" size={24} />
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 text-white/30 mb-4">
                <ShieldCheck size={16} className="shrink-0" />
                <p className="text-[11px] font-light leading-relaxed">
                  Acesso seguro através de autenticação social. Seus dados estão protegidos de acordo com as normas da LGPD.
                </p>
              </div>
            </div>
          </div>
          
          <p className="mt-12 text-center text-[10px] font-bold text-white/10 uppercase tracking-[0.3em]">
            Elite Standard · Secure Access
          </p>
        </div>
      </div>
    </div>
  );
}
