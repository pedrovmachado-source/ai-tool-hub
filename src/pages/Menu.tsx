import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Meta from '@/components/Meta';
import MentoriaModal from '@/components/MentoriaModal';

import { isMentorado } from '@/lib/plan';

import { Button } from '@/components/ui/button';
import { 
  Wrench, 
  Video, 
  Users, 
  ArrowRight,
  BookOpen,
  Layout,
  PlayCircle,
  Tag,
  Globe2,
  Wand2,
  Facebook,
  PenTool
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Menu() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentoriaModalOpen, setMentoriaModalOpen] = useState(false);


  useEffect(() => {
    if (user?.abuseBlocked) {
      navigate('/bloqueado');
    } else if (user && (!user.nome || !user.sobrenome)) {
      // If user is missing name or surname (common for Google login), redirect to complete profile
      navigate('/completar-perfil');
    }
  }, [user, navigate]);

  const Reveal = ({ children, className = '', as: As = 'div' as any, delay = 0 }: any) => {
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
        className={`${className} transition-all duration-1000 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </As>
    );
  };

  const menuItems = [
    {
      title: "Ferramentas",
      description: "Acesse nosso ecossistema de IAs, prompts e utilitários de alta performance.",
      icon: Wrench,
      path: "/ferramentas",
      badge: "Full Access"
    },
    {
      title: "Ofertas Validadas",
      description: "Produtos e infoprodutos minerados com alto potencial de escala.",
      icon: Tag,
      path: "/ofertas",
      badge: "Curadoria"
    },
    {
      title: "Área do Mentorado",
      description: "Gravação de aulas, transcrição de reuniões e materiais de apoio.",
      icon: Users,
      path: "/alunos",
      badge: "Comunidade"
    },
    {
      title: "Comprar Criativo",
      description: "Criativos validados para parar o scroll e converter seu público.",
      icon: Wand2,
      path: "/creative-edit",
      badge: "Design"
    },
    {
      title: "Copywrite",
      description: "Textos de alta conversão para seus anúncios e páginas de vendas.",
      icon: PenTool,
      path: "/copywrite",
      badge: "Copy"
    },
    {
      title: "Contas de Facebook Ads",
      description: "Contas e BM's prontas para rodar suas campanhas com segurança.",
      icon: Facebook,
      path: "/fb-accounts",
      badge: "Ads"
    },
    {
      title: "Comprar Site",
      description: "Landing pages, quizzes e funis de alta conversão para o seu negócio.",
      icon: Globe2,
      path: "/site-creation",
      badge: "Escala"
    },
    {
      title: "Aulas Gravadas",
      description: "Gravações das mentorias exclusivas com estratégias de escala e conversão.",
      icon: Video,
      path: "/mentorias",
      badge: "Membro"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white/20 font-sans overflow-x-hidden">
      <Meta title="Dashboard | Convert Club" description="Acesse as verticais de escala da Convert Club: ferramentas de IA, ofertas validadas, área do mentorado e mais." />
      <header>
        <Navbar 
          onNavigate={(page) => {
            if (page === 'home') navigate('/');
            else if (page === 'profile') navigate('/perfil');
            else if (page === 'alunos') navigate('/alunos');
            else if (page === 'mentorias') navigate('/mentorias');
            else if (page === 'menu') navigate('/menu');
            else if (page === 'comprar-cash') navigate('/comprar-cash');
            else if (page === 'ofertas' || page === 'offers') navigate('/ofertas');
            else if (page === 'ferramentas') navigate('/ferramentas');
            else if (['copywrite', 'site-creation', 'creative-edit', 'fb-accounts'].includes(page)) {
              navigate(`/${page}`);
            }
            else {
              sessionStorage.setItem('adai:initialPage', page);
              navigate('/ferramentas');
            }
          }} 

        />
      </header>

      <main className="flex-1 relative pt-32 pb-24 px-6">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="mb-20">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg glass-smooth mb-6 border border-white/5">
                <Layout className="w-3 h-3 text-white/50" />
                <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">Dashboard de Acesso</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif-display tracking-tight text-white mb-6">
                Bem-vindo ao <em className="italic font-normal">Ecossistema</em>.
              </h1>
              <p className="text-white/40 text-lg max-w-2xl font-light">
                Olá, {user?.nome || 'Membro'}. Selecione a vertical que deseja acessar hoje para continuar sua jornada rumo à escala brutal.
              </p>
            </Reveal>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 150}>
                <div 
                  onClick={() => {
                    if (item.path === '/alunos' && !isMentorado(user?.plano)) {
                      setMentoriaModalOpen(true);
                      return;
                    }
                    navigate(item.path);
                  }}

                  className="group relative cursor-pointer p-8 glass-smooth hover:bg-white/10 transition-all duration-500 rounded-[2.5rem] border border-white/5 h-full flex flex-col"
                >
                  <div className="w-14 h-14 bg-white/5 rounded-2xl mb-8 group-hover:bg-white group-hover:text-black transition-all duration-500 flex items-center justify-center">
                    <item.icon className="w-7 h-7" />
                  </div>

                  <div className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4 w-fit">
                    {item.badge}
                  </div>

                  <h3 className="text-2xl font-serif-display text-white mb-4">
                    {item.title}
                  </h3>
                  
                  <p className="text-white/30 leading-relaxed font-light text-sm mb-8 flex-1">
                    {item.description}
                  </p>

                  <div className="flex items-center text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                    Acessar agora
                    <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        
        <div className="text-[9px] text-white/10 font-bold uppercase tracking-[0.5em]">
          &copy; 2026 CONVERT CLUB · BUILT FOR THE 1%
        </div>
      </footer>
      <MentoriaModal isOpen={mentoriaModalOpen} onClose={() => setMentoriaModalOpen(false)} />
    </div>

  );
}
