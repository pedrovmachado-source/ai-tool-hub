import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  PlayCircle, 
  FileText, 
  Download,
  Video,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Calendar,
  Lock
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  transcriptionUrl?: string;
}

export default function Alunos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<Lesson | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Convert Club — Área do Aluno';
  }, []);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedVideo(lesson);
    // Smooth scroll to video player if on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        videoRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

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

  const aulasGravadas: Lesson[] = [
    { id: '1', title: 'Aula 1: O Mindset dos 1%', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15:20', transcriptionUrl: '#' },
    { id: '2', title: 'Aula 2: Estrutura de Escala Brutal', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '22:45', transcriptionUrl: '#' },
    { id: '3', title: 'Aula 3: Copywriting de Alta Conversão', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '18:10', transcriptionUrl: '#' },
    { id: '4', title: 'Aula 4: Tráfego e Segmentação Elite', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '25:30', transcriptionUrl: '#' },
    { id: '5', title: 'Aula 5: Funis de Vendas Automáticos', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '20:15', transcriptionUrl: '#' },
    { id: '6', title: 'Aula 6: Gestão de Comunidade e LTV', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '30:00', transcriptionUrl: '#' },
  ];

  const aulasAdicionais: Lesson[] = [
    { id: 'a1', title: 'Extra: Lançamentos Meteóricos 2.0', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '45:00', transcriptionUrl: '#' },
    { id: 'a2', title: 'Extra: Escala com Influenciadores', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '35:20', transcriptionUrl: '#' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white/20 font-sans overflow-x-hidden">
      <Navbar 
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
          else if (page === 'profile') navigate('/perfil');
          else if (page === 'pro') navigate('/pro');
          else if (page === 'alunos' || page === 'lessons') navigate('/alunos');
          else navigate('/ferramentas');
        }} 
      />

      <main className="flex-1 relative pt-32 pb-24 px-6">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="mb-12">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-smooth mb-6 border border-white/5">
                <GraduationCap className="w-3 h-3 text-white/50" />
                <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">Área Exclusiva para Alunos</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif-display tracking-tight text-white mb-6">
                Bem-vindo à sua <em className="italic font-normal">Formação</em>.
              </h1>
              <p className="text-white/40 text-lg max-w-2xl font-light">
                Olá, {user?.nome || 'Membro'}. Aqui você encontra todo o arsenal necessário para dominar o mercado. Escolha uma aula abaixo para começar.
              </p>
            </Reveal>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Menu */}
            <div className="lg:col-span-5 space-y-6">
              <Reveal delay={100}>
                <Accordion type="single" collapsible className="space-y-4">
                  
                  {/* Seção 1 — Aulas Gravadas */}
                  <AccordionItem value="gravadas" className="border-white/5 glass-smooth rounded-[2rem] overflow-hidden px-6">
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-serif-display">Aulas Gravadas</h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">6 Aulas Disponíveis</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="space-y-2 pt-2">
                        {aulasGravadas.map((aula) => (
                          <button
                            key={aula.id}
                            onClick={() => handleLessonSelect(aula)}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${selectedVideo?.id === aula.id ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 border-transparent'} border`}
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className={`w-4 h-4 ${selectedVideo?.id === aula.id ? 'text-white' : 'text-white/20 group-hover:text-white/50'}`} />
                              <span className={`text-sm ${selectedVideo?.id === aula.id ? 'text-white font-medium' : 'text-white/50'}`}>{aula.title}</span>
                            </div>
                            <span className="text-[10px] text-white/20 font-mono">{aula.duration}</span>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Seção 2 — Aulas Adicionais */}
                  <AccordionItem value="adicionais" className="border-white/5 glass-smooth rounded-[2rem] overflow-hidden px-6">
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                          <PlayCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-serif-display">Aulas Adicionais</h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Atualizado Semanalmente</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="space-y-2 pt-2">
                        {aulasAdicionais.map((aula) => (
                          <button
                            key={aula.id}
                            onClick={() => handleLessonSelect(aula)}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${selectedVideo?.id === aula.id ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 border-transparent'} border`}
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className={`w-4 h-4 ${selectedVideo?.id === aula.id ? 'text-white' : 'text-white/20 group-hover:text-white/50'}`} />
                              <span className={`text-sm ${selectedVideo?.id === aula.id ? 'text-white font-medium' : 'text-white/50'}`}>{aula.title}</span>
                            </div>
                            <span className="text-[10px] text-white/20 font-mono">{aula.duration}</span>
                          </button>
                        ))}
                        <div className="p-4 border border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 mt-4">
                          <Lock className="w-3 h-3 text-white/20" />
                          <span className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Próxima aula em breve</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Seção 3 — Transcrições */}
                  <AccordionItem value="transcricoes" className="border-white/5 glass-smooth rounded-[2rem] overflow-hidden px-6">
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-serif-display">Transcrições</h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Material de Apoio PDF</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="space-y-2 pt-2">
                        {[...aulasGravadas, ...aulasAdicionais].map((aula) => (
                          <div
                            key={`trans-${aula.id}`}
                            className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-white/20" />
                              <span className="text-sm text-white/50">Transcrição {aula.title.split(':')[0]}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/10"
                            >
                              <Download className="w-3 h-3" />
                              Baixar PDF
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </Reveal>
            </div>

            {/* Right Column: Video Player */}
            <div className="lg:col-span-7" ref={videoRef}>
              <Reveal delay={200}>
                <div className="glass-smooth rounded-[2.5rem] border border-white/5 overflow-hidden sticky top-32">
                  {selectedVideo ? (
                    <div className="aspect-video w-full bg-black relative">
                      <iframe
                        src={selectedVideo.videoUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-white/[0.02] flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 animate-pulse">
                        <PlayCircle className="w-10 h-10 text-white/20" />
                      </div>
                      <h3 className="text-2xl font-serif-display text-white mb-4">Escolha uma aula</h3>
                      <p className="text-white/30 font-light max-w-xs mx-auto text-sm leading-relaxed">
                        Selecione qualquer item do menu ao lado para iniciar a reprodução imediata do conteúdo.
                      </p>
                    </div>
                  )}
                  
                  <div className="p-8 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-bold text-white/50 tracking-widest uppercase">
                          {selectedVideo ? 'Reproduzindo Agora' : 'Aguardando Seleção'}
                        </span>
                        {selectedVideo && (
                          <span className="flex items-center gap-1 text-[10px] text-white/30">
                            <Calendar className="w-3 h-3" />
                            Disponível por tempo limitado
                          </span>
                        )}
                      </div>
                    </div>
                    <h2 className="text-2xl font-serif-display text-white">
                      {selectedVideo?.title || 'Selecione um conteúdo para começar'}
                    </h2>
                    {selectedVideo && (
                      <div className="mt-8 flex gap-4">
                        <Button className="rounded-full bg-white text-black hover:bg-white/90 px-8 font-bold text-xs uppercase tracking-widest">
                          Marcar como Concluída
                        </Button>
                        <Button variant="outline" className="rounded-full border-white/10 text-white hover:bg-white/5 px-8 font-bold text-xs uppercase tracking-widest glass-smooth">
                          Ver Transcrição
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="text-[9px] text-white/10 font-bold uppercase tracking-[0.5em]">
          &copy; 2026 CONVERT CLUB · BUILT FOR THE 1%
        </div>
      </footer>
    </div>
  );
}
