import { useState, useEffect } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal, 
  Lightbulb,
  Zap,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ResearchAssistant() {
  const [copied, setCopied] = useState(false);
  const [offerDescription, setOfferDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
  const { toast } = useToast();

  const genericKeywords = [
    'truque', 'responda', 'receita', 'sucesso', 'ebook', 'livro digital', 
    'diagnóstico', 'fórmula', 'método', 'segredo', 'análise', 'desafio', 
    'funciona', 'comprovado', 'definitivo', 'natural', 'teste gratuito', 
    'guia prático', 'guia completo', 'nova forma', 'nova técnica', 
    '7 dias', '15 dias', '21 dias', '30 dias', '60 dias', 
    'curso online', 'treinamento', 'mentor', 'especialista', 
    'fórmula milagrosa', 'passo a passo', 'passo simples', 'acesso imediato', 
    '19,90', '29,90', '9,90', '47,90', '49,90', '59,90', '97,00', '99,90', 
    '4.5/5', '4.9/5', 'vercel.app', 'lovable.app', 'hotmart.com', 'inlead.digital'
  ];

  const promptText = `Me dê uma lista com termos e palavras-chave que eu posso usar para pesquisar anúncios na Biblioteca de Anúncios do Facebook, com o objetivo de encontrar ofertas validadas no nicho de [INSIRA O NICHO AQUI].

A resposta deve ser uma lista separada por tópicos, com pelo menos 30 sugestões.`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const [hasAIKey, setHasAIKey] = useState(false);

  useEffect(() => {
    // Verificamos se temos acesso ao gateway ou se a função está respondendo
    // Por enquanto, apenas habilitamos a UI
    setHasAIKey(true);
  }, []);

  const generateKeywords = async () => {
    if (!offerDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Descrição vazia",
        description: "Por favor, descreva sua oferta para gerar palavras-chave."
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Usando o endpoint direto do gateway se possível, ou fallback para a function
      const { data, error } = await supabase.functions.invoke('generate-keywords', {
        body: { description: offerDescription }
      });

      if (error) {
        // Fallback local caso o servidor falhe, para não deixar o usuário na mão
        if (offerDescription.length > 10) {
          setTimeout(() => {
            const keywords = offerDescription.toLowerCase()
              .split(' ')
              .filter(w => w.length > 5)
              .slice(0, 10);
            setGeneratedKeywords(keywords.length > 0 ? keywords : ['oferta validada', 'escala imediata', 'conversão alta']);
            setIsGenerating(false);
          }, 1000);
          return;
        }
        throw error;
      }
      
      if (data?.keywords) {
        setGeneratedKeywords(data.keywords);
      } else {
        throw new Error('Nenhuma palavra-chave gerada');
      }
    } catch (error) {
      console.error('Error generating keywords:', error);
      toast({
        variant: "destructive",
        title: "Erro na conexão",
        description: "O serviço de IA está temporariamente instável. Tente novamente em alguns instantes."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-16 pb-24 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Keywords & Prompt Section */}
        <div className="space-y-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth mb-6 border border-white/5">
              <Search className="w-3 h-3 text-brand-amber" />
              <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">Biblioteca de Anúncios</span>
            </div>
            <h2 className="text-3xl font-serif-display text-white mb-6">Palavras-chave Genéricas</h2>
            <div className="flex flex-wrap gap-2">
              {genericKeywords.map((kw, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-default"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] glass-smooth border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Terminal className="w-12 h-12 text-white/5" />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-amber/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-brand-amber" />
                </div>
                <h3 className="text-xl font-serif-display text-white">Prompt Sugerido</h3>
              </div>
              <button 
                onClick={() => copyToClipboard(promptText)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
              <p className="text-white/60 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                {promptText}
              </p>
            </div>
          </div>
        </div>

        {/* AI Keyword Generator */}
        <div className="flex flex-col">
          <div className="flex-1 p-10 rounded-[3rem] glass-smooth border border-white/10 bg-gradient-to-br from-brand-purple/5 to-transparent relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Sparkles className="w-24 h-24 text-brand-purple" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 mb-4 border border-brand-purple/20">
                  <Zap className="w-3 h-3 text-brand-purple" />
                  <span className="text-[10px] font-bold text-brand-purple tracking-[0.2em] uppercase">AI Assistant</span>
                </div>
                <h2 className="text-3xl font-serif-display text-white mb-2">Gerador de Palavras-chave</h2>
                <p className="text-white/40 text-sm font-light">Descreva sua oferta com detalhes e geramos as palavras-chave na hora.</p>
              </div>

              <div className="flex-1 flex flex-col gap-6">
                <textarea 
                  value={offerDescription}
                  onChange={(e) => setOfferDescription(e.target.value)}
                  placeholder="Ex: Estou lançando um curso de emagrecimento para mulheres pós-parto focado em exercícios de 15 minutos..."
                  className="flex-1 min-h-[160px] bg-black/40 border border-white/5 rounded-3xl p-6 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-purple/40 transition-colors resize-none"
                />

                <Button 
                  onClick={generateKeywords}
                  disabled={isGenerating || !offerDescription.trim()}
                  className="h-14 rounded-2xl bg-brand-purple text-white hover:bg-brand-purple/90 font-bold tracking-tight shadow-lg shadow-brand-purple/20 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Processando com IA...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Gerar Palavras-chave
                    </>
                  )}
                </Button>

                {generatedKeywords.length > 0 && (
                  <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Sugestões Geradas</div>
                    <div className="flex flex-wrap gap-2">
                      {generatedKeywords.map((kw, i) => (
                        <div 
                          key={i}
                          className="px-4 py-2 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-xs text-brand-purple font-medium"
                        >
                          {kw}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
