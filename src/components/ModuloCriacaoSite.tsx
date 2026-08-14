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
];

const SubLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">{children}</p>
);

export default function ModuloCriacaoSite() {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [copiedIcp, setCopiedIcp] = useState(false);
  const [copiedLovable, setCopiedLovable] = useState(false);

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
                    <p className="text-sm text-white/[0.75] italic leading-[1.7]">{PROMPT_LOVABLE}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(PROMPT_LOVABLE, setCopiedLovable)}
                      className="mt-4 h-8 px-4 rounded-full border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-white/70 hover:bg-white hover:text-black transition-colors"
                    >
                      {copiedLovable ? 'Copiado!' : 'Copiar Prompt'}
                    </Button>
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
