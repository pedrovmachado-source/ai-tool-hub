import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Clapperboard,
  ChevronDown,
  ExternalLink,
  Layout,
  MessageSquare,
  Music2,
  Instagram,
  Video,
  Layers,
  Wrench,
} from 'lucide-react';

const PROMPT = `"Analise a transcrição do criativo abaixo e quebre ela em quatro partes: hook, body, CTA e tom de áudio. Depois, me gere 3 variações de hook novas para o mesmo body, mirando as seguintes dores: [INSIRA AS 3 DORES AQUI]. O produto é [INSIRA O NOME DO PRODUTO] e o público é [INSIRA O PÚBLICO]. Mantenha a linguagem nativa do idioma, frases curtas e o nome do produto citado no body."`;

const anatomia = [
  {
    n: '01',
    title: 'HOOK (Gancho inicial)',
    text: 'Os primeiros 3 segundos. É o que interrompe o scroll e decide se o vídeo vai ser assistido ou não. O hook precisa nomear a dor ou o desejo do público logo na primeira frase, sem enrolação e sem apresentação. Fale diretamente com quem sente aquele problema específico. Aqui é onde 80% dos criativos morrem.',
  },
  {
    n: '02',
    title: 'BODY (Problema → Solução → Produto)',
    text: 'O miolo do vídeo. Primeiro agite o problema para o público se identificar, depois mostre que existe uma solução possível e só então apresente o produto como o caminho para chegar nela. Regra inegociável: sempre citar o nome do produto no body, em voz alta e/ou na legenda. Criativo que não nomeia o produto gera curiosidade mas não gera venda.',
  },
  {
    n: '03',
    title: 'CTA (Chamada para ação)',
    text: 'Feche com uma ação única e simples. Nunca peça duas coisas ao mesmo tempo. Exemplos: "Saiba mais no link", "Clique no link abaixo", ou o CTA de comentário — "Comente X que eu te mando o link". O CTA de comentário serve tanto para gerar engajamento quanto para alimentar automação de DM.',
  },
];

const dores = [
  { name: 'Colérico', desc: 'a pessoa que sofre com o problema de forma aguda e quer alívio imediato' },
  { name: 'Diabético', desc: 'o público com restrição/condição específica que precisa de uma solução adaptada' },
  { name: 'Saudável', desc: 'quem não tem o problema ainda e compra por prevenção ou performance' },
];

const matriz = [
  { estrutura: '10 criativos — 3 CVs', significa: '10 criativos gerados a partir de 3 vídeos-base, cobrindo 3 dores diferentes' },
  { estrutura: '10 CVs', significa: '10 vídeos-base distintos, distribuídos entre 3 ou 4 dores diferentes' },
];

const campanhas = [
  {
    notacao: '1 - 1 - 10',
    label: 'CBO ou ABO — $20/dia',
    text: '1 campanha, 1 conjunto de anúncios, 10 criativos dentro. Estrutura mais simples, deixa o algoritmo escolher sozinho o melhor criativo. Ideal para validação inicial de uma oferta nova.',
  },
  {
    notacao: '1 - 5 - 10',
    label: 'ABO — $20/dia',
    text: '1 campanha, 5 conjuntos (um para cada dor), 10 criativos. Aqui você força o orçamento a testar cada dor separadamente, sem o algoritmo concentrar tudo em um único ângulo. Use quando já validou a oferta e quer descobrir qual dor escala melhor.',
  },
];

const mineracao = [
  {
    icon: Music2,
    name: 'TikTok',
    text: 'Baixar os vídeos que já estão performando no nicho. É a melhor fonte de linguagem nativa, hooks agressivos e ritmo de edição atual.',
  },
  {
    icon: Instagram,
    name: 'Instagram',
    text: 'Baixar vídeos e, principalmente, procurar ofertas que estão vendendo direto pelos Reels. Muita oferta validada roda em Reels antes de aparecer em qualquer outro lugar.',
  },
];

const stack = [
  { name: 'TurboScribe', text: 'transcrever o áudio dos criativos de referência. É assim que você extrai o roteiro completo do concorrente em texto para modelar.' },
  { name: 'ElevenLabs', text: 'gerar a narração em qualquer idioma. Permite testar múltiplas vozes e sotaques sobre o mesmo roteiro, o que já conta como variação de criativo.' },
  { name: 'CapCut', text: 'edição geral, cortes, transições, trilha e montagem final.' },
  { name: 'Editor nativo do TikTok ou Instagram', text: 'gerar as legendas automáticas de graça. Legenda feita dentro do próprio app costuma ter melhor entrega do que legenda queimada de fora.' },
];

const links = [
  { name: 'Biblioteca de anúncios', url: 'https://www.facebook.com/ads/library/' },
  { name: 'TurboScribe', url: 'https://turboscribe.ai/' },
  { name: 'ElevenLabs', url: 'https://elevenlabs.io/' },
  { name: 'CapCut', url: 'https://www.capcut.com/' },
  { name: 'TikTok', url: 'https://www.tiktok.com/' },
  { name: 'Instagram', url: 'https://www.instagram.com/' },
];

const SubLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">{children}</p>
);

export default function ModuloCriativos() {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(PROMPT);
      } else {
        const ta = document.createElement('textarea');
        ta.value = PROMPT;
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
          <Clapperboard className="w-4 h-4 text-white/70" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-serif-display text-white">2 - Criativos que vendem</h3>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Estrutura, produção e escala
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
            {/* A — Anatomia */}
            <section className="space-y-4">
              <SubLabel>Anatomia do criativo</SubLabel>
              <p className="text-sm text-white/[0.75] leading-[1.7]">
                Todo criativo que performa segue a mesma espinha dorsal. Não importa se é UGC, VSL curta ou
                slideshow: se faltar uma dessas três partes, o criativo não converte. Monte sempre nesta sequência.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {anatomia.map((b) => (
                  <div
                    key={b.n}
                    className="relative overflow-hidden p-5 rounded-[14px] bg-white/[0.03] border border-white/[0.06]"
                  >
                    <span className="absolute -top-2 right-3 text-5xl font-serif-display text-white/[0.06] select-none">
                      {b.n}
                    </span>
                    <p className="relative text-[11px] font-bold uppercase tracking-[0.15em] text-white/60 mb-3">
                      {b.n} — {b.title}
                    </p>
                    <p className="relative text-sm text-white/[0.75] leading-[1.7]">{b.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* B — Dores */}
            <section className="space-y-4">
              <SubLabel>Toda oferta precisa de 3 a 5 dores</SubLabel>
              <p className="text-sm text-white/[0.75] leading-[1.7]">
                Um mesmo produto nunca é vendido com um único argumento. Antes de gravar qualquer coisa, liste de 3 a 5
                dores distintas que o seu produto resolve. Cada dor vira um público diferente e um criativo diferente —
                é isso que te dá volume de teste sem precisar de mil produtos.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {dores.map((d) => (
                  <div key={d.name} className="p-5 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] uppercase tracking-wider text-white/60 mb-3">
                      {d.name}
                    </span>
                    <p className="text-sm text-white/[0.75] leading-[1.7]">{d.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/30 leading-relaxed">
                Esse é apenas um exemplo do nicho de saúde. Adapte a lógica das 3 a 5 dores para o seu nicho.
              </p>
            </section>

            {/* C — Matriz */}
            <section className="space-y-4">
              <SubLabel>Quantos criativos produzir</SubLabel>
              <div className="overflow-hidden rounded-[14px] border border-white/[0.06]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      <th className="py-3 px-4 font-bold border-b border-white/[0.06]">Estrutura</th>
                      <th className="py-3 px-4 font-bold border-b border-white/[0.06]">O que significa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matriz.map((m, i) => (
                      <tr key={m.estrutura} className={i > 0 ? 'border-t border-white/[0.06]' : ''}>
                        <td className="py-4 px-4 text-white/80 font-medium whitespace-nowrap">{m.estrutura}</td>
                        <td className="py-4 px-4 text-white/[0.75] leading-[1.7]">{m.significa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-white/[0.75] leading-[1.7]">
                A lógica é sempre a mesma: poucos vídeos-base, muitas variações. Você troca hook, troca legenda, troca
                áudio e o algoritmo entende como criativo novo. Isso multiplica seu volume de teste sem multiplicar seu
                tempo de produção.
              </p>
            </section>

            {/* D — Método 1-2-3-4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-white/30" />
                <SubLabel>Método 1-2-3-4 — variação modular</SubLabel>
              </div>
              <p className="text-sm text-white/[0.75] leading-[1.7]">
                Em vez de gravar um vídeo inteiro do zero para cada teste, quebre o criativo em 4 peças independentes e
                recombine. Cada peça é uma variável isolada.
              </p>
              <div className="flex flex-wrap gap-2">
                {['1 — Hook', '2 — Body', '3 — CTA', '4 — Áudio'].map((c) => (
                  <span
                    key={c}
                    className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] uppercase tracking-wider text-white/60"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-sm text-white/[0.75] leading-[1.7]">
                Trocando apenas uma dessas variáveis por vez, você descobre exatamente o que está segurando o
                resultado. Se o CTR está baixo, o problema é o hook. Se o CTR está bom mas ninguém compra, o problema
                está no body ou no CTA. Nunca troque duas variáveis no mesmo teste — você perde a leitura.
              </p>
              <div className="p-5 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
                <p className="text-sm text-white/[0.75] leading-[1.7]">
                  Use os CVs do concorrente como referência. Baixe os criativos que já estão rodando há semanas na
                  Biblioteca de Anúncios, destrinche hook, body, CTA e áudio de cada um, e monte o seu em cima dessa
                  estrutura validada. Você não copia o vídeo — você modela a estrutura que já provou que funciona.
                </p>
              </div>
            </section>

            {/* E — Campanhas */}
            <section className="space-y-4">
              <SubLabel>Como subir no gerenciador</SubLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {campanhas.map((c) => (
                  <div key={c.notacao} className="p-5 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-2xl font-serif-display text-white">{c.notacao}</p>
                    <p className="mt-1 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      {c.label}
                    </p>
                    <p className="text-sm text-white/[0.75] leading-[1.7]">{c.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* F — Onde minerar */}
            <section className="space-y-4">
              <SubLabel>Onde minerar criativos</SubLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mineracao.map((m) => (
                  <div key={m.name} className="p-5 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                        <m.icon className="w-4 h-4 text-white/70" />
                      </div>
                      <p className="text-base font-serif-display text-white">{m.name}</p>
                    </div>
                    <p className="text-sm text-white/[0.75] leading-[1.7]">{m.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* G — Stack */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Wrench className="w-4 h-4 text-white/30" />
                <SubLabel>Fluxo de produção</SubLabel>
              </div>
              <ol className="space-y-3">
                {stack.map((s, i) => (
                  <li key={s.name} className="flex gap-4 p-4 rounded-[14px] bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[11px] font-mono text-white/30 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-sm text-white/[0.75] leading-[1.7]">
                      <span className="text-white font-medium">{s.name}</span> — {s.text}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {/* H — Prompt */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white/70" />
                </div>
                <h4 className="text-lg font-serif-display text-white">Prompt de texto</h4>
              </div>
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                <div className="relative p-6 rounded-[14px] bg-black border border-white/10">
                  <p className="text-sm text-white/[0.75] italic leading-[1.7]">{PROMPT}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPrompt}
                    className="mt-4 h-8 px-4 rounded-full border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-white/70 hover:bg-white hover:text-black transition-colors"
                  >
                    {copied ? 'Copiado!' : 'Copiar Prompt'}
                  </Button>
                </div>
              </div>
            </section>

            {/* I — Links */}
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
