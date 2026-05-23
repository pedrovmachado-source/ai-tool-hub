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
  Users,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const openEmbeddedPage = (page: string) => {
    sessionStorage.setItem('adai:initialPage', page);
    navigate('/ferramentas');
  };

  useEffect(() => {
    document.title = 'Convert Club — Comunidade de Alta Conversão';
    const desc = document.querySelector('meta[name="description"]');
    const content = 'Acesse a Convert Club: A maior comunidade de infoprodutores e estrategistas digitais focados em escala e alta conversão.';
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
      title: "Ofertas Validadas",
      description: "Copias e funis que já faturaram alto, prontos para você modelar e aplicar.",
      icon: Sparkles,
      color: "text-white",
      bg: "bg-white/10",
      target: "offers",
      badge: "Best Seller"
    },
    {
      title: "Comprar Site",
      description: "Sites prontos para vender em até 7 dias com copy persuasiva incluída.",
      icon: Globe2,
      color: "text-white",
      bg: "bg-white/10",
      target: "site-creation",
      badge: "Alta Conversão"
    },
    {
      title: "Comprar Criativo",
      description: "Anúncios validados que param o scroll e trazem leads qualificados.",
      icon: Wand2,
      color: "text-white",
      bg: "bg-white/10",
      target: "creative-edit",
      badge: "Vendas Diretas"
    },
    {
      title: "Aulas Gravadas",
      description: "Estratégias práticas de quem fatura 6 dígitos no mercado digital.",
      icon: GraduationCap,
      color: "text-white",
      bg: "bg-white/10",
      target: "lessons",
      badge: "Conteúdo VIP"
    },
    {
      title: "Ferramentas de IA",
      description: "O maior guia de IAs com e-books e prompts para turbinar seu fluxo.",
      icon: Layout,
      color: "text-white",
      bg: "bg-white/10",
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
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white/20 font-sans overflow-x-hidden">
      <Navbar
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
          else if (page === 'profile') navigate('/perfil');
          else if (page === 'pro') navigate('/pro');
          else openEmbeddedPage(page);
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32">
        {/* Glass Orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[140px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <Reveal className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-smooth mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-[10px] font-bold text-white/70 tracking-[0.2em] uppercase">Convert Club Access</span>
          </Reveal>
          
          <Reveal delay={200}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif-display text-white tracking-tighter leading-[0.9] mb-10">
              Transforme Cliques em <em className="italic font-normal">Escala Brutal</em>.
            </h1>
          </Reveal>

          <Reveal delay={400}>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/50 leading-relaxed mb-12 font-light">
              Bem-vindo à Convert Club. A etapa final para infoprodutores que buscam o domínio absoluto do mercado através de sites de alta conversão e inteligência estratégica.
            </p>
          </Reveal>

          <Reveal delay={600} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button 
              size="lg" 
              onClick={() => scrollTo('services')}
              className="w-full sm:w-auto bg-white hover:bg-white/90 text-black h-16 px-12 rounded-full text-lg font-bold transition-all hover:scale-[1.05] shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              Entrar na Comunidade
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => scrollTo('how-it-works')}
              className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 h-16 px-12 rounded-full text-lg font-medium glass-smooth"
            >
              Explorar Ecossistema
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16 sm:py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <Reveal className="text-white/40 font-bold tracking-[0.3em] uppercase text-[10px] mb-4">Vertical de Acesso</Reveal>
            <Reveal delay={200} as="h2" className="text-4xl sm:text-6xl font-serif-display tracking-tight text-white">
              O Que Você <span className="italic">Destrava</span> Aqui
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <Reveal key={service.title} delay={idx * 150}>
                <div 
                  className="group relative h-full p-10 glass-smooth hover:bg-white/10 transition-all duration-700 rounded-[2.5rem] cursor-pointer"
                  onClick={() => handleServiceClick(service.target)}
                >
                  <div className="absolute top-10 right-10 opacity-20 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-2">
                    <ChevronRight className="w-6 h-6 text-white" />
                  </div>

                  <div className={`w-16 h-16 ${service.bg} rounded-2xl flex items-center justify-center mb-10 group-hover:rotate-[10deg] transition-transform duration-500`}>
                    <service.icon className={`w-8 h-8 ${service.color}`} />
                  </div>

                  <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-6">
                    {service.badge}
                  </div>

                  <h3 className="text-3xl font-serif-display text-white mb-6 group-hover:tracking-wide transition-all">
                    {service.title}
                  </h3>
                  
                  <p className="text-white/40 leading-relaxed font-light text-sm">
                    {service.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="how-it-works" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <Reveal>
              <div className="relative">
                <p className="text-white/40 font-bold tracking-[0.3em] uppercase text-[10px] mb-4">Standard of Quality</p>
                <h2 className="text-5xl sm:text-6xl font-serif-display tracking-tight text-white mb-12 leading-[1.1]">
                  A Experiência <br/><em className="italic">Glass Smooth</em>.
                </h2>
                <div className="space-y-12">
                  {[
                    { title: "Design Imersivo", desc: "Uma interface pensada para não distrair e focar no que importa: seus resultados.", icon: Clock },
                    { title: "Arquitetura de Vendas", desc: "Cada pixel é posicionado para conduzir o lead através do seu funil.", icon: MousePointer2 },
                    { title: "Inteligência Ativa", desc: "Acesso direto aos segredos dos maiores players do mercado digital.", icon: Zap },
                    { title: "Escalabilidade PWA", desc: "Leve a Convert Club no seu bolso. Instale como um app e tenha acesso instantâneo.", icon: Rocket }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-8 group">
                      <div className="flex-shrink-0 w-14 h-14 glass-smooth rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <item.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-white/30 text-sm leading-relaxed font-light">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={400} className="relative">
              <div className="relative z-10 p-4 glass-smooth rounded-[3.5rem] transform lg:rotate-3 hover:rotate-0 transition-all duration-1000">
                <div className="aspect-[4/5] bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] p-12 flex flex-col justify-end overflow-hidden relative group">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover opacity-20 grayscale group-hover:scale-110 transition-transform duration-[2000ms]" />
                   <div className="relative z-10">
                    <Layout className="w-16 h-16 text-white mb-8" />
                    <h3 className="text-4xl font-serif-display text-white mb-6">Interface Masterclass</h3>
                    <p className="text-white/40 text-sm max-w-xs mb-10 font-light">
                      Onde a estética encontra a conversão agressiva. Tudo o que você vê é projetado para vender.
                    </p>
                    <div className="flex gap-4">
                      <div className="px-5 py-2 rounded-full glass-smooth text-[10px] font-bold uppercase tracking-widest">Premium</div>
                      <div className="px-5 py-2 rounded-full glass-smooth text-[10px] font-bold uppercase tracking-widest">Exclusive</div>
                    </div>
                   </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-white/5 py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Convert Club Members", value: "1.5k+", icon: Users },
              { label: "Conversion Rate Avg", value: "12%+", icon: TrendingUp },
              { label: "Community Assets", value: "300+", icon: Globe2 },
              { label: "Scale Multiplier", value: "10x", icon: Rocket }
            ].map((stat, i) => (
              <Reveal key={i} delay={i * 100} className="text-center">
                <div className="text-4xl sm:text-6xl font-serif-display text-white mb-3 tracking-tighter">{stat.value}</div>
                <div className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.05),transparent)] pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <Reveal>
            <h2 className="text-5xl sm:text-8xl font-serif-display text-white mb-12 tracking-tighter leading-[0.9]">
              Torne-se <em className="italic font-normal">Inegociável</em>.
            </h2>
            <p className="text-white/40 text-xl mb-16 max-w-2xl mx-auto font-light">
              A Convert Club não é para todos. É para aqueles que entenderam que no digital, ou você domina a conversão, ou você é dominado por ela.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Button 
                size="lg" 
                onClick={() => scrollTo('services')}
                className="w-full sm:w-auto bg-white hover:bg-white/90 text-black h-20 px-16 rounded-full text-xl font-bold transition-all hover:scale-105"
              >
                Acessar Agora
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5 text-center bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="font-serif-display text-4xl text-white mb-6 tracking-tighter">CONVERT CLUB</div>
          <p className="text-white/20 text-sm mb-12 max-w-md mx-auto leading-relaxed font-light">
            The elite layer of digital entrepreneurship. Glass smooth experience, razor sharp results.
          </p>
          <div className="flex justify-center gap-12 mb-12 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => navigate('/ferramentas')} className="hover:text-white transition-colors">Tools</button>
            <button onClick={() => navigate('/pro')} className="hover:text-white transition-colors">Plano Max</button>
          </div>
          <div className="text-[10px] text-white/10 font-bold uppercase tracking-[0.5em]">
            &copy; 2026 CONVERT CLUB · BUILT FOR THE 1%
          </div>
        </div>
      </footer>
    </div>
  );
}
