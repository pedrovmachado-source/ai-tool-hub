import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Meta from '@/components/Meta';
import OfferAnalysisModal from '@/components/OfferAnalysisModal';
import OfferModelingModal from '@/components/OfferModelingModal';
import OffersRanking from '@/components/OffersRanking';
import { supabase } from '@/integrations/supabase/client';
import InlineOfferEditor from '@/components/InlineOfferEditor';
import ResearchAssistant from '@/components/ResearchAssistant';

import { 
  Sparkles, 
  ExternalLink, 
  Tag, 
  Package, 
  ArrowRight,
  Loader2,
  Send,
  Pencil,
  Trophy,
  Camera,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ValidatedOffer {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  link: string;
  image_url: string | null;
  category: string | null;
}

export default function OfertasValidadas() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<ValidatedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ValidatedOffer | null>(null);
  const [modelingOffer, setModelingOffer] = useState<ValidatedOffer | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('validated_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar ofertas",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white/20 font-sans overflow-x-hidden">
      <Meta title="Ofertas Validadas | Convert Club" description="Produtos minerados com alto potencial de escala e conversão imediata para assinantes Elite." />
      <Navbar 
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
          else if (page === 'profile') navigate('/perfil');
          else if (page === 'pro' || page === 'elite') navigate('/pro');
          else if (page === 'alunos' || page === 'lessons') navigate('/alunos');
          else if (page === 'mentorias') navigate('/mentorias');
          else if (page === 'menu') navigate('/menu');
          else if (page === 'ofertas' || page === 'offers') navigate('/ofertas');
          else {
            sessionStorage.setItem('adai:initialPage', page);
            navigate('/ferramentas');
          }
        }}
      />

      <main className="flex-1 relative pt-32 pb-24 px-6">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-amber/5 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-purple/5 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth mb-6 border border-white/5">
              <Tag className="w-3 h-3 text-brand-amber" />
              <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">Curadoria Elite</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif-display tracking-tight text-white mb-6">
              Ofertas <em className="italic font-normal">Validadas</em>.
            </h1>
            <p className="text-white/40 text-lg max-w-2xl font-light leading-relaxed">
              Produtos e infoprodutos minerados pela nossa equipe com alto potencial de escala e conversão imediata.
            </p>
            </header>


            {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-amber animate-spin mb-4" />
              <p className="text-white/20 text-sm font-medium uppercase tracking-widest">Minerando ofertas...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-20 glass-smooth rounded-[3rem] border border-white/5">
              <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40">Nenhuma oferta validada disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer) => (
                <div 
                  key={offer.id}
                  className="group relative flex flex-col glass-smooth hover:bg-white/5 transition-all duration-500 rounded-[2.5rem] border border-white/5 overflow-hidden"
                >
                  <div className="aspect-[16/10] overflow-hidden relative group/img">
                    {offer.image_url ? (
                      <img 
                        src={offer.image_url} 
                        alt={offer.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <Package className="w-12 h-12 text-white/10" />
                      </div>
                    )}
                    
                    {isAdmin && (
                      <button 
                        onClick={() => setEditingOffer(offer)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2"
                      >
                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                          <Camera className="w-4 h-4" />
                        </div>
                      </button>
                    )}

                    <div className="absolute top-6 right-6">
                      <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-brand-amber uppercase tracking-widest">
                        {offer.category || 'Premium'}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-serif-display text-white mb-4 group-hover:text-brand-amber transition-colors">
                      {offer.title}
                    </h3>
                    <p className="text-white/30 text-sm font-light leading-relaxed mb-6 flex-1 line-clamp-3">
                      {offer.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1">Investimento</span>
                        <span className="text-xl font-serif-display text-white">{offer.price || 'Consultar'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setModelingOffer(offer)}
                          className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-brand-purple hover:text-white transition-all duration-300 group/model"
                          title="Modelagem Profissional"
                        >
                          <Rocket className="w-5 h-5 group-hover/model:scale-110 transition-transform text-brand-amber" />
                        </button>

                        <a 
                          href={offer.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-brand-amber hover:text-black transition-all duration-300 group/link"
                          title="Abrir Link"
                        >
                          <ExternalLink className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                        </a>
                        
                        {isAdmin && (
                          <button 
                            onClick={() => setEditingOffer(offer)}
                            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-brand-blue hover:text-white transition-all duration-300 group/edit"
                            title="Editar Oferta"
                          >
                            <Pencil className="w-5 h-5 group-hover/edit:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scale Notice */}
          <section className="mt-32">
            <div className="p-12 glass-smooth rounded-[3rem] border border-white/10 bg-gradient-to-br from-brand-amber/10 to-transparent relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-xl text-center md:text-left">
                  <h2 className="text-3xl font-serif-display text-white mb-4">Tem um produto campeão? - Receba brindes por nos ajudar!</h2>
                  <p className="text-white/40 text-sm font-light leading-relaxed">
                    Nossa equipe está sempre em busca de novas ofertas para validar e escalar. Se você tem um produto com métricas sólidas, entre em contato para análise.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsAnalysisModalOpen(true)}
                  className="h-14 px-10 rounded-full bg-white text-black hover:bg-white/90 font-bold text-sm tracking-tight glass-smooth"
                >
                  Submeter para Análise
                </Button>
              </div>
            </div>
          </section>

          <OfferAnalysisModal 
            isOpen={isAnalysisModalOpen} 
            onClose={() => setIsAnalysisModalOpen(false)} 
          />

          {editingOffer && (
            <InlineOfferEditor 
              offer={editingOffer}
              isOpen={!!editingOffer}
              onClose={() => setEditingOffer(null)}
              onSave={fetchOffers}
            />
          )}

          <OfferModelingModal 
            isOpen={!!modelingOffer}
            onClose={() => setModelingOffer(null)}
            offerTitle={modelingOffer?.title || ''}
            offerId={modelingOffer?.id}
          />
        </div>
      </main>

      <OffersRanking />
      <ResearchAssistant />

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="text-[9px] text-white/10 font-bold uppercase tracking-[0.5em]">
          &copy; 2026 CONVERT CLUB · BUILT FOR THE 1%
        </div>
      </footer>
    </div>


  );
}
