import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Meta from '@/components/Meta';
import MentoriaModal from '@/components/MentoriaModal';
import ExtensionPurchaseModal from '@/components/ExtensionPurchaseModal';
import ModuloCriativos from '@/components/ModuloCriativos';

import { isMentorado } from '@/lib/plan';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Lock,
  Music,
  Search,
  ExternalLink,
  Target,
  Globe,
  Layout,
  MessageSquare,
  CreditCard,
  Check,
  Calculator,
  DollarSign
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
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [personalizedAulas, setPersonalizedAulas] = useState<Lesson[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [areaId, setAreaId] = useState<string | null>(null);
  const [lessonsDone, setLessonsDone] = useState(0);
  const [lessonsLimit, setLessonsLimit] = useState(0);
  const [tasksByLesson, setTasksByLesson] = useState<Record<string, { id: string; text: string }[]>>({});
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLDivElement>(null);

  // Calculadoras de investimento e receita
  const [reach, setReach] = useState('');
  const [cpm, setCpm] = useState('');
  const [visits, setVisits] = useState('');
  const [ticket, setTicket] = useState('');

  useEffect(() => {
    if (user) {
      if (user.abuseBlocked) {
        navigate('/bloqueado');
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
        setLessonsDone(Number(content.lessonsDone) || 0);
        setLessonsLimit(Number(content.lessonsLimit) || 0);
        setTasksByLesson((content.tasks || {}) as Record<string, { id: string; text: string }[]>);
        setTasksDone(new Set(content.tasks_done || []));
      } else {
        // Fallback to defaults if no personalized area found
        setPersonalizedAulas(defaultAulas);
        setWelcomeMessage('');
        setCompletedLessons(new Set());
        setLessonsDone(0);
        setLessonsLimit(0);
        setTasksByLesson({});
        setTasksDone(new Set());
      }
    }
    setLoading(false);
  };

  const persistProgress = async (patch: Record<string, any>) => {
    if (!user || !areaId) return;
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
          .update({ content: { ...content, ...patch } })
          .eq('id', areaId);
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const toggleTask = async (taskId: string) => {
    const next = new Set(tasksDone);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    setTasksDone(next);
    await persistProgress({ tasks_done: Array.from(next) });
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




  const defaultAulas: Lesson[] = [
    { id: '1', title: 'Aula 1: O Mindset dos 1%', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15:20', transcriptionUrl: '#' },
    { id: '2', title: 'Aula 2: Estrutura de Escala Brutal', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '22:45', transcriptionUrl: '#' },
    { id: '3', title: 'Aula 3: Copywriting de Alta Conversão', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '18:10', transcriptionUrl: '#' },
    { id: '4', title: 'Aula 4: Tráfego e Segmentação Elite', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '25:30', transcriptionUrl: '#' },
    { id: '5', title: 'Aula 5: Funis de Vendas Automáticos', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '20:15', transcriptionUrl: '#' },
    { id: '6', title: 'Aula 6: Gestão de Comunidade e LTV', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '30:00', transcriptionUrl: '#' },
  ];

  // Cálculos das calculadoras
  const reachNum = parseFloat(reach.replace(/\./g, '').replace(',', '.'));
  const cpmNum = parseFloat(cpm.replace(',', '.'));
  const creativeInvest = !isNaN(reachNum) && !isNaN(cpmNum) && reachNum > 0 && cpmNum > 0
    ? (reachNum * 1.5 / 1000) * cpmNum
    : null;

  const visitsNum = parseInt(visits.replace(/\./g, '').replace(',', ''), 10);
  const ticketNum = parseFloat(ticket.replace(',', '.'));
  const sales = !isNaN(visitsNum) && visitsNum > 0 ? visitsNum * 0.05 : null;
  const revenue = sales !== null && !isNaN(ticketNum) && ticketNum > 0 ? sales * ticketNum : null;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white/20 font-sans overflow-x-hidden">
      <Meta title="Área do Mentorado | Convert Club" description="Área exclusiva para alunos da Convert Club. Acesse suas aulas, transcrições e materiais de apoio personalizados." />
      <header>
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
      </header>

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

              <Reveal delay={200}>
                <div className="glass-smooth rounded-[2rem] border border-white/5 p-8 space-y-8">
                  {/* 1- Procurar os melhores produtos */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-white/70" />
                      </div>
                      <h3 className="text-xl font-serif-display">1- Procurar os melhores produtos</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-white/50 list-disc list-inside ml-2">
                      <li>Como identificar um bom produto:</li>
                      <li className="list-none ml-4">• Tempo rodando, Quantidade de anúncios, volume de vendas, volume gasto de anúncio</li>
                      <li className="list-none ml-4">• Similarweb, Biblioteca de anúncios</li>
                    </ul>
                  </section>

                  {/* Tabela de métricas */}
                  <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5">
                    <table className="w-full text-center text-xs">
                      <thead className="bg-white/5 text-white/40 uppercase tracking-widest font-bold">
                        <tr>
                          <th className="py-3 px-2 border-r border-white/5">Demanda</th>
                          <th className="py-3 px-2 border-r border-white/5">Margem</th>
                          <th className="py-3 px-2 border-r border-white/5">Concorrência</th>
                          <th className="py-3 px-2">Recorrência</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-white/70">
                          <td className="py-4 px-2 border-r border-white/5">Alta</td>
                          <td className="py-4 px-2 border-r border-white/5">Alta</td>
                          <td className="py-4 px-2 border-r border-white/5">Baixa</td>
                          <td className="py-4 px-2">Alta</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Dores e Nicho */}
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-sm text-white/70 leading-relaxed">
                        <span className="text-white font-medium">Religião, receitas, infantil, mães, dores no corpo, vícios, fanatismo, educação, renda extra e treinos</span> - Focam numa dor
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-white/50">
                      <Target className="w-4 h-4 text-white/30" />
                      <p>Nicho &gt; País &gt; Minerar produtos desse país &gt; modelagem</p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Melhores países para minerar ofertas</p>
                      <div className="flex flex-wrap gap-2">
                        {['Reino Unido', 'Holanda', 'Bélgica', 'Alemanha', 'Irlanda', 'França', 'Itália'].map(pais => (
                          <span key={pais} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider text-white/40">
                            {pais}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-sm text-white/70 leading-relaxed">
                      <span className="text-white font-medium">Dica:</span> Descobrir páginas em site WordPress — adicione <span className="font-mono text-white/90 bg-white/10 px-1.5 py-0.5 rounded">wp-sitemap.xml</span> no fim do domínio do site.
                    </p>
                  </div>

                  {/* Termos de Pesquisa */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-white/70" />
                      </div>
                      <h3 className="text-lg font-serif-display">Palavras-chave genericas para pesquisa</h3>
                    </div>
                    <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5">
                      <p className="text-[11px] leading-relaxed text-white/40 font-mono">
                        truque, responda, receita, sucesso, ebook, livro digital, diagnóstico, fórmula, método, segredo, análise, desafio, funciona, comprovado, definitivo, natural,<br/>
                        teste gratuito, guia prático, guia completo, nova forma, nova técnica,<br/>
                        7 dias, 15 dias, 21 dias, 28 dias, 30 dias, 60 dias,<br/>
                        ebook, curso online, treinamento, mentor, especialista,<br/>
                        fórmula milagrosa, passo a passo, passo simples, acesso imediato,<br/>
                        19,90, 29,90, 9,90, 47,90, 49,90, 59,90, 97,00, 99,90, 4.5/5, 4.9/5<br/>
                        vercel.app, lovable.app, hotmart.com, inlead.digital, twr.<br/>
                        .com/vsl, .com/quiz, .com/lp
                      </p>
                    </div>
                  </section>

                  {/* Prompt */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white/70" />
                      </div>
                      <h3 className="text-lg font-serif-display">Prompt de texto</h3>
                    </div>
                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative p-6 rounded-2xl bg-black border border-white/10">
                        <p className="text-sm text-white/70 italic leading-relaxed">
                          "Me dê uma lista com termos e palavras-chave que eu posso usar para pesquisar anúncios na Biblioteca de Anúncios do Facebook, com o objetivo de encontrar ofertas validadas no nicho de [INSIRA O NICHO AQUI]. A resposta deve ser uma lista separada por tópicos, com pelo menos 30 sugestões."
                        </p>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="mt-4 h-8 px-4 rounded-full border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:bg-white hover:text-black transition-colors"
                          onClick={async () => {
                            try {
                              const text = "Me dê uma lista com termos e palavras-chave que eu posso usar para pesquisar anúncios na Biblioteca de Anúncios do Facebook, com o objetivo de encontrar ofertas validadas no nicho de [INSIRA O NICHO AQUI]. A resposta deve ser uma lista separada por tópicos, com pelo menos 30 sugestões.";
                              if (navigator.clipboard && window.isSecureContext) {
                                await navigator.clipboard.writeText(text);
                              } else {
                                const textArea = document.createElement("textarea");
                                textArea.value = text;
                                textArea.style.position = "fixed";
                                textArea.style.left = "-9999px";
                                document.body.appendChild(textArea);
                                textArea.focus();
                                textArea.select();
                                const successful = document.execCommand('copy');
                                document.body.removeChild(textArea);
                                if (!successful) throw new Error('execCommand failed');
                              }
                              toast({ title: "Prompt copiado!" });
                            } catch (err) {
                              console.error('Failed to copy:', err);
                              toast({ title: "Erro ao copiar", variant: "destructive" });
                            }
                          }}
                        >
                          Copiar Prompt
                        </Button>
                      </div>
                    </div>
                  </section>

                  {/* Calculadoras */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                        <Calculator className="w-4 h-4 text-white/70" />
                      </div>
                      <h3 className="text-lg font-serif-display">Calculadoras</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Investimento no criativo */}
                      <div className="p-6 rounded-2xl bg-black border border-white/10 space-y-4">
                        <h4 className="text-sm font-medium text-white/80">Cálculo de quanto investir no criativo</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">Número de alcance (0.000.000)</label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Ex: 1.500.000"
                              value={reach}
                              onChange={(e) => setReach(e.target.value)}
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-xl focus-visible:ring-white/20"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">CPM do país (US$)</label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Ex: 12,50"
                              value={cpm}
                              onChange={(e) => setCpm(e.target.value)}
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-xl focus-visible:ring-white/20"
                            />
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Resultado</p>
                          <p className="text-lg font-mono text-white/90">
                            {creativeInvest !== null
                              ? `US$ ${creativeInvest.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Receita da oferta */}
                      <div className="p-6 rounded-2xl bg-black border border-white/10 space-y-4">
                        <h4 className="text-sm font-medium text-white/80">Cálculo do quanto provavelmente a oferta vende</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">Número de visitas à página</label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="Ex: 10.000"
                              value={visits}
                              onChange={(e) => setVisits(e.target.value)}
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-xl focus-visible:ring-white/20"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">Ticket do produto (R$)</label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Ex: 197,00"
                              value={ticket}
                              onChange={(e) => setTicket(e.target.value)}
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-xl focus-visible:ring-white/20"
                            />
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Resultado</p>
                          <p className="text-lg font-mono text-white/90">
                            {sales !== null
                              ? `${sales.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} vendas = R$ ${revenue !== null ? revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}`
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Links Úteis */}
                  <section className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <Layout className="w-4 h-4 text-white/30" />
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Links</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { name: 'Biblioteca de anúncios', url: 'https://www.facebook.com/ads/library/' },
                        { name: 'AdsParo', url: 'https://chromewebstore.google.com/detail/adsparo-adlibrary-ad-find/jhgpmfdfgihdclapmppfeddggkidnoid?hl=pt-BR' },
                        { name: 'Ad Lib Note', url: 'https://chromewebstore.google.com/detail/adlibnote-ad-library-down/niepmhdjjdggogblnljbdflekfohknmc?hl=pt-BR' },
                        { name: 'Claude', url: 'https://Claude.ai' },
                        { name: 'DeepSeek', url: 'https://chat.deepseek.com/' },
                        { name: 'Similarweb', url: 'https://www.similarweb.com/pt/' }
                      ].map(link => (
                        <a 
                          key={link.name}
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                        >
                          <span className="text-xs text-white/50 group-hover:text-white/80">{link.name}</span>
                          <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/50" />
                        </a>
                      ))}
                    </div>
                  </section>
                </div>
              </Reveal>

              <Reveal delay={250}>
                <ModuloCriativos />
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

                    {/* Progresso de aulas */}
                    {lessonsLimit > 0 && (
                      <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Aulas realizadas</p>
                          <p className="text-[11px] text-white/50 font-medium">{lessonsDone} / {lessonsLimit}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: lessonsLimit }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-colors ${
                                i < lessonsDone
                                  ? 'bg-brand-blue text-white'
                                  : 'bg-white text-black/30'
                              }`}
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tasks da aula */}
                    {selectedVideo && (
                      <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Tasks desta aula</p>
                        {(tasksByLesson[selectedVideo.id] || []).length === 0 ? (
                          <p className="text-xs text-white/20">Nenhuma task definida para esta aula.</p>
                        ) : (
                          <>
                            <div className="space-y-2">
                              {(tasksByLesson[selectedVideo.id] || []).map(task => {
                                const done = tasksDone.has(task.id);
                                return (
                                  <button
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-full flex items-center gap-3 text-left p-3 rounded-2xl border transition-colors ${
                                      done ? 'bg-brand-blue/10 border-brand-blue/40' : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${done ? 'bg-brand-blue' : 'bg-white'}`}>
                                      {done && <Check className="w-3 h-3 text-white" />}
                                    </span>
                                    <span className={`text-xs ${done ? 'text-white' : 'text-white/60'}`}>{task.text}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {(tasksByLesson[selectedVideo.id] || []).every(t => tasksDone.has(t.id)) ? (
                              <a
                                href="https://wa.me/5521965248844?text=Fiz%20todas%20as%20tasks%2C%20j%C3%A1%20podemos%20marcar%20a%20aula!"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-green-600 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Marcar aula no WhatsApp
                              </a>
                            ) : (
                              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/20">
                                <Lock className="w-3 h-3" />
                                Conclua todas as tasks para liberar o agendamento
                              </p>
                            )}
                          </>
                        )}
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
        
        <div className="text-[9px] text-white/10 font-bold uppercase tracking-[0.5em] mt-8">
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
      <ExtensionPurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
      />
    </div>

  );
}
