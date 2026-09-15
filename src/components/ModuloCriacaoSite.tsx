import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Globe,
  ChevronDown,
  ExternalLink,
  Layout,
  MessageSquare,
} from 'lucide-react';

const PROMPT_ICP = `(link do site) Crie meu ICP`;

const promptLovable = (modo: 'icp' | 'site_exemplo') => {
  const base = modo === 'icp'
    ? 'do meu ICP'
    : 'Site exemplo';
  return `gere um prompt completo para eu colar no lovable com base nessa oferta (link da oferta base) utilizando a estrutura como base e alterando a copy para a ${base}.`;
};

const options = [
  { value: 'icp' as const, label: 'Do meu ICP' },
  { value: 'site_exemplo' as const, label: 'Site exemplo' },
];

const links = [
  { name: 'Microsoft Clarity', url: 'https://clarity.microsoft.com/' },
  { name: 'Lovable', url: 'https://lovable.dev/' },
  { name: 'Claude', url: 'https://claude.ai/' },
  { name: 'Biblioteca de Ads', url: 'https://www.facebook.com/ads/library/' },
  { name: 'KAST', url: 'https://app.kast.xyz/referral/HFWCR0HJ' },
  { name: 'Stripe', url: 'https://stripe.com' },
];

const siteStructure = [
  {
    title: 'Header',
    detail: 'Mantenha o topo simples, com a identidade do produto e um botão que leve diretamente à oferta. Evite menus e links que tirem a pessoa da página.',
  },
  {
    title: 'Headline',
    detail: 'Apresente a principal transformação prometida pelo produto. Seja específico, fale do resultado desejado e desperte curiosidade sem fazer promessas impossíveis.',
  },
  {
    title: 'Sub-headline',
    detail: 'Complete a promessa da headline explicando para quem é a oferta, como ela ajuda e por que essa solução é diferente das demais.',
  },
  {
    title: 'Imagem do produto',
    detail: 'Mostre o produto com clareza logo no início. Não precisa gerar a imagem no Lovable: use uma imagem real, mockup ou composição preparada separadamente.',
  },
  {
    title: 'Texto de apresentação',
    detail: 'Crie uma introdução curta que faça o visitante se reconhecer no problema e entenda que existe um caminho possível para alcançar o resultado.',
  },
  {
    title: 'Dores e soluções — 2 colunas por 3 linhas',
    detail: 'Monte 6 retângulos. Em cada um, apresente uma dor específica e, logo abaixo, como o produto resolve essa dificuldade de forma prática.',
    layout: '2 × 3',
  },
  {
    title: 'Imagens do produto — 3 por 3',
    detail: 'Use uma galeria com 9 imagens para mostrar variedade, qualidade, materiais, módulos ou resultados. Cada imagem deve revelar um aspecto diferente da oferta.',
    layout: '3 × 3',
  },
  {
    title: 'Prova social de expert',
    detail: 'Adicione o depoimento de uma autoridade ou profissional ligado ao tema. Inclua foto, nome, especialidade e uma fala objetiva que reforce a confiança no produto.',
  },
  {
    title: 'Imagens de dentro do produto',
    detail: 'Mostre o que a pessoa realmente receberá: páginas, aulas, materiais, ferramentas, área de membros ou detalhes físicos. Evite deixar a entrega abstrata.',
  },
  {
    title: 'Bater mais nas dores',
    detail: 'Aprofunde as consequências de não resolver o problema. Use situações reais do cotidiano e conecte essas dificuldades ao desejo de mudança, sem exageros.',
  },
  {
    title: 'Prova social de WhatsApp e Instagram',
    detail: 'Apresente capturas reais de conversas e directs com relatos específicos. Preserve a privacidade quando necessário e não use depoimentos inventados.',
  },
  {
    title: 'FAQ',
    detail: 'Responda às objeções que impedem a compra: funcionamento, acesso, entrega, prazo, garantia, pagamento, suporte e para quem o produto é indicado.',
  },
  {
    title: 'CTA detalhada',
    detail: 'Reúna a oferta completa: o que está incluso, benefícios, bônus, preço, formas de pagamento, garantia e o próximo passo. Finalize com um botão direto e específico.',
  },
  {
    title: 'Mais prova social',
    detail: 'Feche com novos resultados e depoimentos variados para reduzir a última insegurança. Priorize relatos com contexto, transformação e evidências visuais.',
  },
];

const SubLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">{children}</p>
);

export default function ModuloCriacaoSite() {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [copiedIcp, setCopiedIcp] = useState(false);
  const [copiedLovable, setCopiedLovable] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'icp' | 'site_exemplo'>('icp');

  const copy = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (!ok) throw new Error('execCommand failed');
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Prompt copiado!' });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full glass-smooth rounded-[1.25rem] border border-white/[0.06] bg-[#0A0A0A] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-8 text-left hover:bg-white/[0.02] transition-colors"
        aria-expanded={open}
      >
        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 text-white/70" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-serif-display text-white">2 - Criação de site</h3>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            ICP, estrutura e ferramentas
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-[250ms] ease-out ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className="grid transition-all duration-[250ms] ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-8 pb-8 space-y-10">
            {/* Introdução */}
            <section className="space-y-4">
              <SubLabel>Como criar a página de oferta</SubLabel>
              <p className="text-sm text-white/[0.75] leading-[1.7]">
                Antes de produzir o criativo, você precisa de uma página que converta. A sequência é: descubra o ICP do site de referência, monte a estrutura da página e gere o site no Lovable com base na oferta validada.
              </p>
            </section>

            {/* Estrutura da página */}
            <section className="space-y-6">
              <div>
                <SubLabel>Estrutura recomendada do site</SubLabel>
                <h4 className="mt-3 text-2xl font-serif-display text-white">Ordem completa da página de oferta</h4>
                <p className="mt-2 max-w-3xl text-sm leading-[1.7] text-white/50">
                  Siga esta sequência para conduzir o visitante da primeira promessa até a decisão de compra. Adapte a linguagem, as imagens e as provas ao seu produto e ao seu público.
                </p>
              </div>

              <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {siteStructure.map((step, index) => (
                  <article key={step.title} className="grid gap-3 py-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-xs font-bold text-white/60">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-base font-semibold text-white/90">{step.title}</h5>
                        {step.layout && (
                          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-bold uppercase text-white/50">
                            Grade {step.layout}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-[1.7] text-white/55">{step.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Prompts */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white/70" />
                </div>
                <h4 className="text-lg font-serif-display text-white">Prompts de texto</h4>
              </div>

              <div className="space-y-4">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div className="relative p-6 rounded-[14px] bg-black border border-white/10">
                    <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Passo 1 — Cole no Claude</p>
                    <p className="text-sm text-white/[0.75] italic leading-[1.7]">{PROMPT_ICP}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(PROMPT_ICP, setCopiedIcp)}
                      className="mt-4 h-8 px-4 rounded-full border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-white/70 hover:bg-white hover:text-black transition-colors"
                    >
                      {copiedIcp ? 'Copiado!' : 'Copiar Prompt'}
                    </Button>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div className="relative p-6 rounded-[14px] bg-black border border-white/10">
                    <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Passo 2 — Cole no Lovable</p>
                    <p className="text-sm text-white/[0.75] italic leading-[1.7]">{promptLovable(selectedMode)}</p>

                    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Select
                        value={selectedMode}
                        onValueChange={(value) => setSelectedMode(value as 'icp' | 'site_exemplo')}
                      >
                        <SelectTrigger className="h-9 w-full sm:w-[180px] rounded-full border-white/10 bg-white/5 text-xs text-white/70 focus:ring-1 focus:ring-white/20 focus:ring-offset-0 px-4">
                          <SelectValue placeholder="Escolha a base da copy" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 bg-[#141414] text-white/90">
                          {options.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs focus:bg-white/10 focus:text-white cursor-pointer"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copy(promptLovable(selectedMode), setCopiedLovable)}
                        className="h-9 px-5 rounded-full border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-white/70 hover:bg-white hover:text-black transition-colors"
                      >
                        {copiedLovable ? 'Copiado!' : 'Copiar Prompt'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Links */}
            <section className="space-y-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Layout className="w-4 h-4 text-white/30" />
                <SubLabel>Links</SubLabel>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {links.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/10 transition-colors group"
                  >
                    <span className="text-xs text-white/50 group-hover:text-white/80">{link.name}</span>
                    <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/50" />
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
