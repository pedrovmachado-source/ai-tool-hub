import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Search, BookOpen, Rocket, ArrowRight, Zap, Shield, Library, Users, Star, TrendingUp, CheckCircle2, MessageSquare, HelpCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories } = useCategories();

  const openEmbeddedPage = (page: string) => {
    sessionStorage.setItem('adai:initialPage', page);
    navigate('/ferramentas');
  };

  useEffect(() => {
    document.title = 'AdAI — Guia de IAs para empreendedores';
    const desc = document.querySelector('meta[name="description"]');
    const content = 'Curadoria de ferramentas de inteligência artificial com e-books, prompts e passo a passo para empreendedores.';
    if (desc) desc.setAttribute('content', content);
    else {
      const m = document.createElement('meta');
      m.name = 'description'; m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  const featured = useMemo(() => {
    return categories.slice(0, 6).map(c => ({
      key: c.key,
      label: c.label,
      desc: c.introTitle,
      count: c.tools?.length || 0,
    }));
  }, [categories]);

  const goTools = () => navigate('/ferramentas');
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // Reveal-on-scroll
  const Reveal = ({ children, className = '', as: As = 'section' as any, delay = 0, ...rest }: any) => {
    const ref = useRef<HTMLElement | null>(null);
    const [shown, setShown] = useState(false);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
        { threshold: 0.12 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);
    return (
      <As
        ref={ref as any}
        {...rest}
        className={`${className} transition-all duration-700 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: `${delay}ms`, ...(rest.style || {}) }}
      >
        {children}
      </As>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar
        hideAuth
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
          else if (page === 'profile') navigate('/perfil');
          else if (page === 'pro') navigate('/pro');
          else if (page === 'admin' || page === 'lessons') openEmbeddedPage(page);
        }}
        onOpenSavedEbook={(toolKey, categoryKey) => {
          navigate(`/ferramentas?tool=${toolKey}&cat=${categoryKey}`);
        }}
      />

      {/* Hero */}
      <section className="bg-navy relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(800px 400px at 20% 0%, hsl(var(--blue) / 0.25), transparent 60%), radial-gradient(600px 300px at 80% 20%, hsl(var(--teal) / 0.18), transparent 60%)',
          }}
        />
        <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-blue/15 border border-brand-blue/30 text-brand-blue-medium text-[10px] sm:text-xs px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-4 sm:mb-6 max-w-full">
            <span className="truncate">🎯 Feito para infoprodutores, lançadores e gestores de tráfego</span>
          </div>
          <h1 className="font-serif-display text-[26px] sm:text-4xl md:text-6xl leading-[1.12] sm:leading-[1.07] text-primary-foreground tracking-tight mb-4 sm:mb-5">
            A IA que escreve seus <em className="text-brand-blue-medium italic">anúncios</em> e multiplica seu faturamento — no piloto automático.
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground/70 max-w-[680px] mx-auto leading-relaxed mb-6 sm:mb-8">
            Feito para infoprodutores que querem parar de perder tempo com copy ruim e vender mais todos os dias.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              onClick={goTools}
              className="bg-brand-blue hover:bg-brand-blue/90 hover:scale-[1.03] text-primary-foreground gap-2 sm:gap-3 h-12 sm:h-16 px-5 sm:px-10 rounded-2xl text-sm sm:text-base md:text-lg font-semibold shadow-lg shadow-brand-blue/25 transition-all duration-200 w-full sm:w-auto max-w-full whitespace-normal"
            >
              <span className="truncate">Quero escalar meu infoproduto agora</span> <ArrowRight size={18} className="shrink-0" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => scrollTo('o-que-muda')}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-10 sm:h-12 px-5 sm:px-6 rounded-xl text-sm"
            >
              Saiba mais
            </Button>
          </div>
        </div>
      </section>

      {/* O que muda quando você usa o AdAi */}
      <Reveal id="o-que-muda" className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-[11px] sm:text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Resultados reais</p>
          <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl tracking-tight">O que muda quando você usa o AdAi</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[
            { i: '⚡', t: 'Copies em segundos', d: 'Gere anúncios, headlines e VSLs completos em segundos. Sem agência. Sem espera.' },
            { i: '📈', t: 'Escala sem equipe', d: 'A IA trabalha 24h por você. Crie variações, teste criativos e otimize campanhas sozinho.' },
            { i: '🎯', t: 'Anúncios que convertem', d: 'Prompts treinados para infoprodutos. Linguagem que fala direto com quem vai comprar.' },
            { i: '💰', t: 'Mais lucro, menos custo', d: 'Reduza o custo por lead e aumente o ROAS com a copy certa no tráfego.' },
            { i: '🔄', t: 'Lançamentos no automático', d: 'E-mails, stories, scripts e páginas de vendas gerados em minutos.' },
            { i: '🌍', t: 'Venda para qualquer mercado', d: 'Copies adaptadas para Brasil, Portugal, Reino Unido e mercados europeus.' },
          ].map((c) => (
            <Card key={c.t} className="p-5 sm:p-7 border border-border hover:border-brand-blue/40 hover:-translate-y-0.5 transition-all rounded-xl">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3" aria-hidden>{c.i}</div>
              <h3 className="font-serif-display text-lg sm:text-xl mb-1.5">{c.t}</h3>
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">{c.d}</p>
            </Card>
          ))}
        </div>
      </Reveal>

      {/* Faixa de métricas */}
      <Reveal as="section" className="bg-navy border-y border-primary-foreground/5">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 text-center">
            {[
              { n: '10x', l: 'mais variações de anúncios' },
              { n: '-60%', l: 'no custo por criativo' },
              { n: '3min', l: 'para gerar uma VSL' },
              { n: '0', l: 'copywriters necessários' },
            ].map((m) => (
              <div key={m.l}>
                <div className="font-serif-display text-3xl sm:text-4xl md:text-5xl text-brand-blue-medium mb-1 sm:mb-2">{m.n}</div>
                <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground/80 leading-snug">{m.l}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Como funciona */}
      <Reveal id="como-funciona" className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-[11px] sm:text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Como funciona</p>
          <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl tracking-tight">Três passos para começar</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {[
            { n: '01', icon: Search, t: 'Escolha a ferramenta', d: 'Navegue por categorias curadas — texto, imagem, vídeo, automação e muito mais.' },
            { n: '02', icon: BookOpen, t: 'Aprenda com o e-book', d: 'Cada IA vem com guia completo, prompts prontos e passo a passo de uso.' },
            { n: '03', icon: Rocket, t: 'Aplique no negócio', d: 'Aplique imediatamente no seu fluxo de trabalho com confiança.' },
          ].map((s) => (
            <Card key={s.n} className="p-7 border border-border hover:border-brand-blue/40 transition-colors rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                  <s.icon size={18} />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{s.n}</span>
              </div>
              <h3 className="font-serif-display text-xl mb-1.5">{s.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </Card>
          ))}
        </div>
      </Reveal>
      {/* Categorias em destaque */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="flex items-end justify-between mb-6 sm:mb-10 gap-3 sm:gap-4 flex-wrap">
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Catálogo</p>
              <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl tracking-tight">Categorias disponíveis</h2>
            </div>
            <Button variant="outline" onClick={goTools} className="gap-2 rounded-xl text-xs sm:text-sm h-9 sm:h-10">
              Ver todas <ArrowRight size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {featured.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6 rounded-xl animate-pulse h-32 bg-card" />
              ))
            ) : (
              featured.map((c) => (
                <button
                  key={c.key}
                  onClick={() => navigate(`/ferramentas?cat=${c.key}`)}
                  className="text-left group"
                >
                  <Card className="p-6 rounded-xl border border-border group-hover:border-brand-blue/40 group-hover:shadow-md transition-all h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                        <Library size={16} />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground bg-secondary rounded-full px-2.5 py-0.5">
                        {c.count} {c.count === 1 ? 'ferramenta' : 'ferramentas'}
                      </span>
                    </div>
                    <h3 className="font-serif-display text-lg mb-1 group-hover:text-brand-blue transition-colors">{c.label}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.desc}</p>
                  </Card>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: Library, n: '24+', l: 'Ferramentas curadas' },
            { icon: BookOpen, n: '24', l: 'E-books completos' },
            { icon: MessageSquare, n: '200+', l: 'Prompts prontos' },
            { icon: Users, n: '1.500+', l: 'Empreendedores ativos' },
          ].map((s) => (
            <div key={s.l} className="text-center p-5 rounded-xl bg-secondary/40 border border-border">
              <div className="w-10 h-10 mx-auto rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-3">
                <s.icon size={18} />
              </div>
              <div className="font-serif-display text-2xl md:text-3xl mb-1">{s.n}</div>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-[11px] sm:text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Por que AdAI</p>
          <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl tracking-tight">Pensado para quem aplica, não só lê</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            { icon: Zap, t: 'Curadoria atualizada', d: 'Só as IAs que realmente entregam resultado, revisadas mensalmente em 2026.' },
            { icon: BookOpen, t: 'E-books completos', d: 'Guia prático com casos reais e prompts testados, prontos para usar.' },
            { icon: Shield, t: 'Sem ruído', d: 'Sem hype — recomendações honestas e direcionadas ao seu negócio.' },
            { icon: TrendingUp, t: 'Resultados reais', d: 'Fluxos prontos para marketing, vendas, conteúdo e operação.' },
            { icon: CheckCircle2, t: 'Passo a passo', d: 'Cada ferramenta vem com tutorial claro — do zero ao primeiro resultado.' },
            { icon: Star, t: 'Acesso vitalício', d: 'Pague uma vez no Pro e receba todas as atualizações futuras sem mensalidades.' },
          ].map((b) => (
            <div key={b.t}>
              <div className="w-10 h-10 rounded-lg bg-brand-teal/10 text-brand-teal flex items-center justify-center mb-3">
                <b.icon size={18} />
              </div>
              <h3 className="text-base font-semibold mb-1.5">{b.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para quem é */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-[11px] sm:text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Para quem é</p>
            <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl tracking-tight">Feito para empreendedores ocupados</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {[
              { t: 'Donos de pequenos negócios', d: 'Automatize tarefas repetitivas e ganhe horas na semana com IAs certas.' },
              { t: 'Profissionais de marketing', d: 'Crie conteúdo, anúncios e copies em escala mantendo a qualidade.' },
              { t: 'Criadores e freelancers', d: 'Entregue mais projetos com menos esforço usando fluxos com IA.' },
            ].map((p) => (
              <Card key={p.t} className="p-6 rounded-xl border border-border">
                <div className="w-9 h-9 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-3">
                  <CheckCircle2 size={16} />
                </div>
                <h3 className="font-serif-display text-lg mb-1.5">{p.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimento */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full">
        <Card className="p-6 sm:p-8 md:p-10 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-1 mb-4 text-brand-blue">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
          </div>
          <p className="font-serif-display text-lg sm:text-xl md:text-2xl leading-relaxed mb-5">
            "Em duas semanas refiz todo o meu fluxo de marketing usando os e-books da AdAI. Economizo cerca de 10 horas por semana e meus anúncios performam melhor."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center font-semibold text-sm">MR</div>
            <div>
              <p className="text-sm font-semibold">Marina R.</p>
              <p className="text-xs text-muted-foreground">Fundadora · agência de conteúdo</p>
            </div>
          </div>
        </Card>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-6 sm:mb-10">
            <p className="text-[11px] sm:text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Dúvidas frequentes</p>
            <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl tracking-tight">Perguntas comuns</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Preciso saber programar para usar?', a: 'Não. Todas as ferramentas e e-books são pensados para quem não tem background técnico — basta seguir o passo a passo.' },
              { q: 'O acesso é mensal ou vitalício?', a: 'O plano Pro é pagamento único e vitalício — você recebe todas as atualizações futuras sem mensalidades.' },
              { q: 'Os e-books são atualizados?', a: 'Sim. Revisamos a curadoria mensalmente em 2026 para incluir novas IAs e remover ferramentas obsoletas.' },
              { q: 'Posso cancelar?', a: 'Como o plano é vitalício e único, não há recorrência. Se mudar de ideia em até 7 dias, devolvemos 100% do valor.' },
            ].map((f) => (
              <Card key={f.q} className="p-5 rounded-xl border border-border">
                <div className="flex items-start gap-3 mb-2">
                  <HelpCircle size={16} className="text-brand-blue mt-1 shrink-0" />
                  <h3 className="text-base font-semibold">{f.q}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-7">{f.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <Reveal as="section" className="bg-navy relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(700px 350px at 50% 100%, hsl(var(--blue) / 0.25), transparent 60%)',
          }}
        />
        <div className="relative max-w-[800px] mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h2 className="font-serif-display text-2xl sm:text-3xl md:text-5xl text-primary-foreground tracking-tight mb-3 sm:mb-4">
            Pare de deixar dinheiro na mesa.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground/80 mb-6 sm:mb-8 max-w-lg mx-auto">
            Seu concorrente já está usando IA. Você vai ficar pra trás?
          </p>
          <Button
            size="lg"
            onClick={goTools}
            className="bg-brand-blue hover:bg-brand-blue/90 hover:scale-[1.03] text-primary-foreground h-12 sm:h-16 px-5 sm:px-10 rounded-2xl gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-semibold shadow-lg shadow-brand-blue/25 transition-all duration-200 w-full sm:w-auto max-w-full whitespace-normal"
          >
            <span className="truncate">Começar agora — é gratuito</span> <ArrowRight size={18} className="shrink-0" />
          </Button>
        </div>
      </Reveal>

      {/* Footer */}
      <footer className="bg-navy border-t border-primary-foreground/5 py-8 text-center">
        <p className="text-xs text-muted-foreground/40">
          AdAI · Guia de Inteligência Artificial para Empreendedores · © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
