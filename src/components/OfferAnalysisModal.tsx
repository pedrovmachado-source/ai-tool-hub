import { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OfferAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OfferAnalysisModal({ isOpen, onClose }: OfferAnalysisModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ad_library_url: '',
    website_url: '',
    observations: ''
  });

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || loading) return;

    if (!formData.ad_library_url || !formData.website_url) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha o link da biblioteca de anúncios e o link do site."
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('offer_analyses')
        .insert({
          user_id: user.id,
          ad_library_url: formData.ad_library_url,
          website_url: formData.website_url,
          observations: formData.observations,
        });

      if (error) throw error;

      toast({
        title: "Análise enviada!",
        description: "Nossa equipe revisará seu produto em breve."
      });
      onClose();
      setFormData({ ad_library_url: '', website_url: '', observations: '' });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg glass-smooth rounded-[2.5rem] border border-white/10 p-8 md:p-12 overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-amber/10 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-purple/10 blur-3xl -z-10" />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-serif-display text-white mb-2">Submeter Análise</h3>
            <p className="text-white/40 text-sm font-light">Envie sua oferta para nossa curadoria.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">
              Link da Biblioteca de Anúncios
            </label>
            <input
              type="url"
              required
              placeholder="https://www.facebook.com/ads/library/..."
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-amber/50 transition-colors"
              value={formData.ad_library_url}
              onChange={e => setFormData(prev => ({ ...prev, ad_library_url: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">
              Link do Site / Checkout
            </label>
            <input
              type="url"
              required
              placeholder="https://seusite.com/oferta"
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-amber/50 transition-colors"
              value={formData.website_url}
              onChange={e => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">
              Observações (Opcional)
            </label>
            <textarea
              placeholder="Conte-nos mais sobre os resultados ou diferenciais..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-amber/50 transition-colors resize-none"
              value={formData.observations}
              onChange={e => setFormData(prev => ({ ...prev, observations: e.target.value }))}
            />
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 font-bold text-sm tracking-tight glass-smooth transition-all group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Enviar para Análise
                <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}