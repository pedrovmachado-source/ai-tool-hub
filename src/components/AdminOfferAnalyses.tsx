import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  ExternalLink, 
  Check, 
  X, 
  Clock, 
  Search,
  MessageSquare,
  Globe,
  Library,
  User as UserIcon,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OfferAnalysis {
  id: string;
  user_id: string;
  ad_library_url: string;
  website_url: string;
  observations: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    nome: string;
    email: string;
  };
}

export default function AdminOfferAnalyses() {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<OfferAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offer_analyses')
        .select('*, profiles(nome, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses((data as any) || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar análises",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    try {
      const { data: analysis, error: fetchError } = await supabase
        .from('offer_analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('offer_analyses')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;

      // Se for aprovado, insere automaticamente na tabela de ofertas validadas
      if (status === 'approved' && analysis) {
        const { error: insertError } = await supabase
          .from('validated_offers')
          .insert({
            title: `Oferta sugerida por ${analysis.profiles?.nome || 'Usuário'}`,
            description: analysis.observations || 'Nenhuma descrição fornecida.',
            link: analysis.website_url,
            category: 'Sugestão',
            price: 'Consultar'
          });

        if (insertError) {
          console.error('Erro ao inserir oferta validada:', insertError);
          toast({
            variant: "destructive",
            title: "Status atualizado, mas houve erro ao criar oferta",
            description: "A análise foi aprovada, mas não conseguimos criar o registro em Ofertas Validadas automaticamente."
          });
        }
      }

      setAnalyses(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast({
        title: "Status atualizado",
        description: `A análise foi marcada como ${status === 'approved' ? 'aprovada e adicionada às ofertas' : 'rejeitada'}.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message
      });
    }
  }

  const filteredAnalyses = analyses.filter(a => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch = 
      a.profiles?.nome?.toLowerCase().includes(search.toLowerCase()) || 
      a.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.observations?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-amber animate-spin mb-4" />
        <p className="text-white/20 text-sm font-medium uppercase tracking-widest">Carregando solicitações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif-display text-white mb-2">Análises de Ofertas</h2>
          <p className="text-white/40 text-sm">Gerencie as solicitações de validação enviadas pelos usuários.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder="Buscar por nome, email..."
              className="h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovadas' : 'Rejeitadas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredAnalyses.length === 0 ? (
        <div className="text-center py-20 glass-smooth rounded-[2rem] border border-white/5">
          <Clock className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/40">Nenhuma análise encontrada com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAnalyses.map((analysis) => (
            <div 
              key={analysis.id}
              className="glass-smooth border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white/20" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{analysis.profiles?.nome || 'Usuário'}</h4>
                        <p className="text-white/30 text-xs">{analysis.profiles?.email}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      analysis.status === 'pending' ? 'bg-brand-amber/10 border-brand-amber/20 text-brand-amber' :
                      analysis.status === 'approved' ? 'bg-brand-green/10 border-brand-green/20 text-brand-green' :
                      'bg-brand-red/10 border-brand-red/20 text-brand-red'
                    }`}>
                      {analysis.status === 'pending' ? 'Pendente' : analysis.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a 
                      href={analysis.ad_library_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group"
                    >
                      <Library className="w-4 h-4 text-brand-amber" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Biblioteca de Anúncios</p>
                        <p className="text-xs text-white truncate">{analysis.ad_library_url}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white transition-colors" />
                    </a>

                    <a 
                      href={analysis.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group"
                    >
                      <Globe className="w-4 h-4 text-brand-amber" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Link do Site</p>
                        <p className="text-xs text-white truncate">{analysis.website_url}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white transition-colors" />
                    </a>
                  </div>

                  {analysis.observations && (
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-3 h-3 text-white/20" />
                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Observações</span>
                      </div>
                      <p className="text-sm text-white/60 font-light leading-relaxed">{analysis.observations}</p>
                    </div>
                  )}
                </div>

                <div className="lg:w-48 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
                  <div className="text-right mb-6 lg:mb-0">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">Enviado em</p>
                    <p className="text-xs text-white/40">
                      {format(new Date(analysis.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                    </p>
                  </div>

                  {analysis.status === 'pending' && (
                    <div className="flex flex-row lg:flex-col gap-3">
                      <Button 
                        onClick={() => updateStatus(analysis.id, 'approved')}
                        className="flex-1 bg-white/5 border border-white/5 text-brand-green hover:bg-brand-green/20 hover:border-brand-green/30 font-bold text-[10px] uppercase tracking-widest h-10 rounded-xl"
                      >
                        <Check className="w-3 h-3 mr-2" /> Aprovar
                      </Button>
                      <Button 
                        onClick={() => updateStatus(analysis.id, 'rejected')}
                        className="flex-1 bg-white/5 border border-white/5 text-brand-red hover:bg-brand-red/20 hover:border-brand-red/30 font-bold text-[10px] uppercase tracking-widest h-10 rounded-xl"
                      >
                        <X className="w-3 h-3 mr-2" /> Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}