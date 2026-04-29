import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar
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
        <div className="relative max-w-[1100px] mx-auto px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-blue/15 border border-brand-blue/30 text-brand-blue-medium text-xs px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={12} /> Curadoria atualizada em 2026
          </div>
          <h1 className="font-serif-display text-5xl md:text-6xl leading-[1.05] text-primary-foreground tracking-tight mb-5">
            Domine as <em className="text-brand-blue-medium italic">IAs</em> certas<br />para o seu negócio
          </h1>
          <p className="text-base md:text-lg text-muted-foreground/70 max-w-[620px] mx-auto leading-relaxed mb-8">
            Curadoria, e-books e prompts prontos das melhores ferramentas de IA — organizados por categoria, com passo a passo para empreendedores.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={goTools} className="bg-brand-blue hover:bg-brand-blue/90 text-primary-foreground gap-2 h-12 px-6 rounded-xl text-sm">
              Acessar ferramentas <ArrowRight size={16} />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => scrollTo('como-funciona')}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-12 px-6 rounded-xl text-sm"
            >
              Saiba mais
            </Button>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="max-w-[1100px] mx-auto px-6 py-20 w-full">
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Como funciona</p>
          <h2 className="font-serif-display text-3xl md:text-4xl tracking-tight">Três passos para começar</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
      </section>

      {/* Categorias em destaque */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="max-w-[1100px] mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Catálogo</p>
              <h2 className="font-serif-display text-3xl md:text-4xl tracking-tight">Categorias disponíveis</h2>
            </div>
            <Button variant="outline" onClick={goTools} className="gap-2 rounded-xl">
              Ver todas <ArrowRight size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <section className="max-w-[1100px] mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
      <section className="max-w-[1100px] mx-auto px-6 py-20 w-full">
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Por que AdAI</p>
          <h2 className="font-serif-display text-3xl md:text-4xl tracking-tight">Pensado para quem aplica, não só lê</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        <div className="max-w-[1100px] mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Para quem é</p>
            <h2 className="font-serif-display text-3xl md:text-4xl tracking-tight">Feito para empreendedores ocupados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
      <section className="max-w-[900px] mx-auto px-6 py-20 w-full">
        <Card className="p-8 md:p-10 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-1 mb-4 text-brand-blue">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
          </div>
          <p className="font-serif-display text-xl md:text-2xl leading-relaxed mb-5">
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
        <div className="max-w-[800px] mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-blue mb-2">Dúvidas frequentes</p>
            <h2 className="font-serif-display text-3xl md:text-4xl tracking-tight">Perguntas comuns</h2>
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
      <section className="bg-navy">
        <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
          <h2 className="font-serif-display text-3xl md:text-4xl text-primary-foreground tracking-tight mb-3">
            Pronto para começar?
          </h2>
          <p className="text-sm text-muted-foreground/70 mb-7 max-w-md mx-auto">
            Acesse a curadoria completa e comece a aplicar IA no seu negócio hoje mesmo.
          </p>
          <Button
            size="lg"
            onClick={goTools}
            className="bg-brand-blue hover:bg-brand-blue/90 text-primary-foreground h-12 px-7 rounded-xl gap-2"
          >
            {user ? 'Explorar ferramentas' : 'Começar agora'} <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy border-t border-primary-foreground/5 py-8 text-center">
        <p className="text-xs text-muted-foreground/40">
          AdAI · Guia de Inteligência Artificial para Empreendedores · © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
