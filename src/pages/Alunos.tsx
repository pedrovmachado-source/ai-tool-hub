import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import MentoriaModal from '@/components/MentoriaModal';
import { isMentorado } from '@/lib/plan';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<Lesson | null>(null);
  const [mentoriaModalOpen, setMentoriaModalOpen] = useState(false);
  const [personalizedAulas, setPersonalizedAulas] = useState<Lesson[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [areaId, setAreaId] = useState<string | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      if (user.abuseBlocked) {
        navigate('/bloqueado');
        return;
      }
      if (!isMentorado(user.plano)) {
        setMentoriaModalOpen(true);
        return;
      }
      fetchPersonalizedArea();
    }
  }, [user, navigate]);

  const fetchPersonalizedArea = async () => {
    if (!user) return;
    setLoading(true);
    
    // First, find the profile ID (since student_areas uses profile.id as user_id)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      const { data, error } = await supabase
        .from('student_areas')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (data && !error) {
        setAreaId(data.id);
        const content = (data.content as any) || {};
        setPersonalizedAulas(content.lessons || []);
        setWelcomeMessage(content.welcomeMessage || '');
        setCompletedLessons(new Set(content.completed_ids || []));
      } else {
        // Fallback to defaults if no personalized area found
        setPersonalizedAulas(defaultAulas);
        setWelcomeMessage('');
        setCompletedLessons(new Set());
      }
    }
    setLoading(false);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    
    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    
    return url;
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedVideo(lesson);
    // Smooth scroll to video player if on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        videoRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const toggleLessonCompletion = async (lessonId: string) => {
    const newCompleted = new Set(completedLessons);
    const isAdding = !newCompleted.has(lessonId);
    
    if (isAdding) {
      newCompleted.add(lessonId);
      toast({
        title: "Aula concluída!",
        description: "Seu progresso foi salvo.",
      });
    } else {
      newCompleted.delete(lessonId);
    }
    setCompletedLessons(newCompleted);

    if (!user || !areaId) return;

    // Persist to database directly using cached areaId
    try {
      const { data: currentArea } = await supabase
        .from('student_areas')
        .select('content')
        .eq('id', areaId)
        .single();

      if (currentArea) {
        const content = (currentArea.content as any) || {};
        await supabase
          .from('student_areas')
          .update({
            content: {
              ...content,
              completed_ids: Array.from(newCompleted)
            }
          })
          .eq('id', areaId);
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleViewTranscription = (url?: string) => {
    if (!url || url === '#') {
      toast({
        title: "Transcrição Indisponível",
        description: "Este conteúdo ainda não possui transcrição anexada.",
        variant: "destructive"
      });
      return;
    }
    window.open(url, '_blank');
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

  const defaultAulas: Lesson[] = [
    { id: '1', title: 'Aula 1: O Mindset dos 1%', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15:20', transcriptionUrl: '#' },
    { id: '2', title: 'Aula 2: Estrutura de Escala Brutal', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '22:45', transcriptionUrl: '#' },
    { id: '3', title: 'Aula 3: Copywriting de Alta Conversão', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '18:10', transcriptionUrl: '#' },
    { id: '4', title: 'Aula 4: Tráfego e Segmentação Elite', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '25:30', transcriptionUrl: '#' },
    { id: '5', title: 'Aula 5: Funis de Vendas Automáticos', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '20:15', transcriptionUrl: '#' },
    { id: '6', title: 'Aula 6: Gestão de Comunidade e LTV', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '30:00', transcriptionUrl: '#' },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white/20 font-sans overflow-x-hidden">
      <Navbar 
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
          else if (page === 'profile') navigate('/perfil');
          else if (page === 'pro') navigate('/pro');
          else if (page === 'alunos' || page === 'lessons') navigate('/alunos');
          else if (page === 'menu') navigate('/menu');
          else if (page === 'mentorias') navigate('/mentorias');
          else if (page === 'ofertas' || page === 'offers') navigate('/ofertas');
          else {
            sessionStorage.setItem('adai:initialPage', page);
            navigate('/ferramentas');
          }
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
                <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">Área Exclusiva do Mentorado</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif-display tracking-tight text-white mb-6">
                Bem-vindo à sua <em className="italic font-normal">Formação</em>.
              </h1>
              <p className="text-white/40 text-lg max-w-2xl font-light">
                {welcomeMessage || `Olá, ${user?.nome || 'Membro'}. Aqui você encontra todo o arsenal necessário para dominar o mercado. Escolha uma aula abaixo para começar.`}
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
                          <h3 className="text-xl font-serif-display">Aulas Personalizadas</h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{personalizedAulas.length} Aulas Disponíveis</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="space-y-2 pt-2">
                        {personalizedAulas.map((aula) => (
                          <button
                            key={aula.id}
                            onClick={() => handleLessonSelect(aula)}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${selectedVideo?.id === aula.id ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 border-transparent'} border`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <PlayCircle className={`w-4 h-4 ${selectedVideo?.id === aula.id ? 'text-white' : 'text-white/20 group-hover:text-white/50'}`} />
                                {completedLessons.has(aula.id) && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black" />
                                )}
                              </div>
                              <span className={`text-sm ${selectedVideo?.id === aula.id ? 'text-white font-medium' : 'text-white/50'} ${completedLessons.has(aula.id) ? 'line-through opacity-50' : ''}`}>{aula.title}</span>
                            </div>
                            <span className="text-[10px] text-white/20 font-mono">{aula.duration}</span>
                          </button>
                        ))}
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
                        {personalizedAulas.map((aula) => (
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
                              onClick={() => handleViewTranscription(aula.transcriptionUrl)}
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
                        src={getEmbedUrl(selectedVideo.videoUrl)}
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
                      <div className="mt-8 flex flex-wrap gap-4">
                        <Button 
                          onClick={() => toggleLessonCompletion(selectedVideo.id)}
                          className={`rounded-full px-8 font-bold text-xs uppercase tracking-widest transition-all ${
                            completedLessons.has(selectedVideo.id) 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-white text-black hover:bg-white/90'
                          }`}
                        >
                          {completedLessons.has(selectedVideo.id) ? 'Concluída' : 'Marcar como Concluída'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewTranscription(selectedVideo.transcriptionUrl)}
                          className="rounded-full border-white/10 text-white hover:bg-white/5 px-8 font-bold text-xs uppercase tracking-widest glass-smooth"
                        >
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

      <MentoriaModal 
        isOpen={mentoriaModalOpen} 
        onClose={() => {
          setMentoriaModalOpen(false);
          navigate('/menu');
        }} 
      />
    </div>

  );
}
