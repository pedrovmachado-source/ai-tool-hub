import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Rocket, 
  ArrowRight, 
  Zap, 
  Star, 
  TrendingUp, 
  CheckCircle2, 
  Globe2, 
  Wand2, 
  GraduationCap, 
  Layout, 
  MousePointer2,
  Clock,
  Award,
  Users
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const openEmbeddedPage = (page: string) => {
    sessionStorage.setItem('adai:initialPage', page);
    navigate('/ferramentas');
  };

  useEffect(() => {
    document.title = 'AdAI — Tudo o que seu negócio precisa para escalar';
    const desc = document.querySelector('meta[name="description"]');
    const content = 'Desde sites de alta conversão até as ferramentas de IA mais avançadas. A solução completa para infoprodutores e empreendedores digitais.';
    if (desc) desc.setAttribute('content', content);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // Reveal-on-scroll component
  const Reveal = ({ children, className = '', as: As = 'section' as any, delay = 0, ...rest }: any) => {
    const ref = useRef<HTMLElement | null>(null);
    const [shown, setShown] = useState(false);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
        { threshold: 0.1 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);
    return (
      <As
        ref={ref as any}
        {...rest}
        className={`${className} transition-all duration-1000 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: `${delay}ms`, ...(rest.style || {}) }}
      >
        {children}
      </As>
    );
  };

  const services = [
    {
      title: "Comprar Site",
      description: "Sites prontos para vender em até 7 dias com copy persuasiva incluída.",
      icon: Globe2,
      color: "text-brand-blue-medium",
      bg: "bg-brand-blue/10",
      target: "site-creation",
      badge: "Alta Conversão"
    },
    {
      title: "Comprar Criativo",
      description: "Anúncios validados que param o scroll e trazem leads qualificados.",
      icon: Wand2,
      color: "text-brand-teal",
      bg: "bg-brand-teal/10",
      target: "creative-edit",
      badge: "Vendas Diretas"
    },
    {
      title: "Aulas Gravadas",
      description: "Estratégias práticas de quem fatura 6 dígitos no mercado digital.",
      icon: GraduationCap,
      color: "text-brand-blue-medium",
      bg: "bg-brand-blue/10",
      target: "lessons",
      badge: "Conteúdo VIP"
    },
    {
      title: "Ferramentas de IA",
      description: "O maior guia de IAs com e-books e prompts para turbinar seu fluxo.",
      icon: Sparkles,
      color: "text-brand-amber",
      bg: "bg-brand-amber/10",
      target: "/ferramentas",
      badge: "Curadoria 2026"
    }
  ];

  const handleServiceClick = (target: string) => {
    if (target.startsWith('/')) {
      navigate(target);
    } else {
      openEmbeddedPage(target);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-brand-blue/30">
      <Navbar
        hideAuth
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
          else if (page === 'profile') navigate('/perfil');
          else if (page === 'pro') navigate('/pro');
          else openEmbeddedPage(page);
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40 bg-navy">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-blue/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-teal/10 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <Reveal className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
            </span>
            <span className="text-xs font-medium text-white/80 tracking-wide uppercase">Solução completa para o seu negócio digital</span>
          </Reveal>
          
          <Reveal delay={200}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-display text-white tracking-tight leading-[1.1] mb-8">
              Tudo o que seu negócio precisa para <em className="text-brand-blue-medium italic not-italic">escalar</em> com IA
            </h1>
          </Reveal>

          <Reveal delay={400}>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/60 leading-relaxed mb-10">
              Desde a criação do seu site de alta conversão até as ferramentas mais avançadas para dominar o mercado digital. Menos esforço, mais lucro.
            </p>
          </Reveal>

          <Reveal delay={600} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => scrollTo('services')}
              className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue/90 text-white h-14 px-10 rounded-2xl text-lg font-semibold shadow-xl shadow-brand-blue/20 transition-all hover:scale-[1.02]"
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => scrollTo('how-it-works')}
              className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 h-14 px-10 rounded-2xl text-lg font-medium backdrop-blur-sm"
            >
              Como funciona
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 sm:py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <Reveal className="text-brand-blue font-bold tracking-widest uppercase text-sm mb-4">Serviços Especializados</Reveal>
            <Reveal delay={200} as="h2" className="text-3xl sm:text-5xl font-serif-display tracking-tight text-slate-900">
              Nossas Verticais de <span className="text-brand-blue">Crescimento</span>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {services.map((service, idx) => (
              <Reveal key={service.title} delay={idx * 150}>
                <Card 
                  className="group relative h-full p-8 border border-slate-200 bg-white hover:border-brand-blue/30 hover:shadow-2xl hover:shadow-brand-blue/5 transition-all duration-500 rounded-[2rem] cursor-pointer overflow-hidden"
                  onClick={() => handleServiceClick(service.target)}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-brand-blue" />
                  </div>

                  <div className={`w-14 h-14 ${service.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <service.icon className={`w-7 h-7 ${service.color}`} />
                  </div>

                  <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                    {service.badge}
                  </div>

                  <h3 className="text-2xl font-serif-display text-slate-900 mb-4 group-hover:text-brand-blue transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-500 leading-relaxed">
                    {service.description}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Section - The "Zero" Refactoring part */}
      <section id="how-it-works" className="py-24 sm:py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <Reveal>
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-blue/5 rounded-full blur-3xl" />
                <p className="text-brand-blue font-bold tracking-widest uppercase text-sm mb-4">Vantagem Competitiva</p>
                <h2 className="text-4xl sm:text-5xl font-serif-display tracking-tight text-slate-900 mb-8 leading-[1.1]">
                  Por que escolher a plataforma AdAI?
                </h2>
                <div className="space-y-8">
                  {[
                    { title: "Entrega Expressa", desc: "Seu site pronto em tempo recorde, sem comprometer a qualidade ou a copy.", icon: Clock },
                    { title: "Copy que Vende", desc: "Nossas estruturas são baseadas em gatilhos mentais que realmente convertem.", icon: MousePointer2 },
                    { title: "IA de Ponta", desc: "Acesso às ferramentas mais modernas de 2026, curadas por especialistas.", icon: Zap },
                    { title: "Suporte Premium", desc: "Acompanhamento dedicado para garantir que seu funil esteja performando.", icon: Award }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-brand-blue" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={400} className="relative lg:ml-auto">
              <div className="relative z-10 p-2 bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden transform lg:rotate-2">
                <div className="aspect-[4/5] bg-navy rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center overflow-hidden relative">
                   {/* Abstract Preview */}
                   <div className="absolute inset-0 opacity-20 pointer-events-none">
                     <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-blue/40 via-transparent to-transparent" />
                   </div>
                   
                   <Layout className="w-20 h-20 text-brand-blue-medium mb-8" />
                   <h3 className="text-3xl font-serif-display text-white mb-4">Interface de Alta Conversão</h3>
                   <p className="text-white/60 text-sm max-w-xs mb-8">
                     Visualizamos cada detalhe do seu funil para maximizar cada clique.
                   </p>
                   <div className="w-full h-px bg-white/10 mb-8" />
                   <div className="flex gap-4">
                     <div className="px-4 py-2 rounded-full bg-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-widest">Performance</div>
                     <div className="px-4 py-2 rounded-full bg-brand-amber/20 text-brand-amber text-xs font-bold uppercase tracking-widest">Escala</div>
                   </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-teal/5 rounded-full blur-3xl" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="bg-navy py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              { label: "Clientes Satisfeitos", value: "1.500+", icon: Users },
              { label: "Anúncios Gerados", value: "50k+", icon: Wand2 },
              { label: "Sites Entregues", value: "300+", icon: Globe2 },
              { label: "Economia de Tempo", value: "85%", icon: TrendingUp }
            ].map((stat, i) => (
              <Reveal key={i} delay={i * 100} className="text-center">
                <div className="text-3xl sm:text-5xl font-serif-display text-brand-blue-medium mb-2">{stat.value}</div>
                <div className="text-white/40 text-xs sm:text-sm font-medium uppercase tracking-wider">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Keep simple and powerful */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal className="mb-12">
            <div className="flex justify-center gap-1 text-brand-amber mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-current" />)}
            </div>
            <p className="text-2xl sm:text-4xl font-serif-display leading-tight text-slate-900 mb-10 italic">
              "O AdAI mudou completamente a forma como encaro a escala do meu negócio. Ter o site, os criativos e as ferramentas de IA em um só lugar é um diferencial absurdo."
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xl">
                RD
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-lg">Ricardo Duarte</div>
                <div className="text-slate-500 text-sm">CEO & Infoprodutor</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 px-6 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-brand-blue/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Reveal>
            <h2 className="text-4xl sm:text-5xl font-serif-display text-white mb-8 tracking-tight">
              Pronto para levar seu negócio ao próximo nível?
            </h2>
            <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
              Junte-se a centenas de empreendedores que já estão usando o poder da inteligência artificial para automatizar e lucrar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => scrollTo('services')}
                className="w-full sm:w-auto bg-brand-teal hover:bg-brand-teal/90 text-navy h-14 px-12 rounded-2xl text-lg font-bold transition-all hover:scale-105"
              >
                Quero Escalar Agora
              </Button>
              <Button 
                size="lg" 
                variant="link"
                className="text-white/60 hover:text-white"
              >
                Falar com consultor especializado
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 text-center bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="font-serif-display text-2xl text-slate-900 mb-4">AdAI</div>
          <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            A solução definitiva para o empreendedorismo digital moderno.
          </p>
          <div className="flex justify-center gap-8 mb-8 text-sm font-medium text-slate-500">
            <button onClick={() => navigate('/')} className="hover:text-brand-blue">Home</button>
            <button onClick={() => navigate('/ferramentas')} className="hover:text-brand-blue">Ferramentas</button>
            <button onClick={() => navigate('/pro')} className="hover:text-brand-blue">Planos</button>
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            &copy; 2026 ADAI PLATFORM · TODOS OS DIREITOS RESERVADOS
          </div>
        </div>
      </footer>
    </div>
  );
}
