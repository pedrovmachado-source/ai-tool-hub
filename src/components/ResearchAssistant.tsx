import { useState } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Terminal, 
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export default function ResearchAssistant({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) throw new Error('execCommand failed');
      }
      setCopied(true);
      toast.success("Copiado!", {
        description: "Conteúdo copiado para a área de transferência."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Erro ao copiar", {
        description: "Não foi possível copiar o conteúdo. Tente selecionar e copiar manualmente."
      });
    }
  };

  return (
    <div className="mt-16 pb-24 max-w-7xl mx-auto px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {children}
        
        {/* Keywords Section */}
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

        {/* Prompt Section */}
        <div className="p-8 rounded-[2.5rem] glass-smooth border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
              className={`p-2 rounded-lg transition-all duration-300 ${
                copied 
                  ? 'bg-green-500/20 text-green-400 scale-110' 
                  : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white'
              }`}
              title={copied ? "Copiado!" : "Copiar prompt"}
              type="button"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
            <p className="text-white/60 text-sm font-mono leading-relaxed whitespace-pre-wrap">
              {promptText}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
