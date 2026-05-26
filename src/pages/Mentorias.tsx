import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import MentoriaModal from '@/components/MentoriaModal';
import { isMentorado } from '@/lib/plan';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  PlayCircle, 
  FileText, 
  Download, 
  Video, 
  Clock, 
  Calendar, 
  Info,
  ChevronRight,
  Plus
} from 'lucide-react';

interface MentorLesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  thumbnail: string;
  description: string;
  transcription?: string;
  category: string;
}

export default function Mentorias() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentoriaModalOpen, setMentoriaModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MentorLesson | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (user) {
      if (user.abuseBlocked) {
        navigate('/bloqueado');
        return;
      }
      if (!isMentorado(user.plano)) {
        setMentoriaModalOpen(true);
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    document.title = 'Convert Club — Mentorias';
  }, []);

  const mentorias: MentorLesson[] = [
    {
      id: 'm1',
      title: 'Estratégia de Escala na Europa',
      category: 'Estratégia',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '45min',
      thumbnail: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2606&auto=format&fit=crop',
      description: 'Como adaptar sua oferta brasileira para o mercado europeu e vender em Euro com alta margem.',
      transcription: 'Texto completo da transcrição da mentoria sobre escala europeia...'
    },
    {
      id: 'm2',
      title: 'Funis Inquebráveis de High Ticket',
      category: 'Funis',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '38min',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
      description: 'A estrutura exata de funis que convertem produtos de R$ 5.000+ no tráfego frio.',
      transcription: 'Transcrição sobre funis high ticket...'
    },
    {
      id: 'm3',
      title: 'Copywriting para Infoprodutos Elite',
      category: 'Copywriting',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '52min',
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2573&auto=format&fit=crop',
      description: 'Técnicas avançadas de escrita persuasiva para quem já fatura 7 dígitos.',
      transcription: 'Transcrição sobre copywriting de elite...'
    },
    {
      id: 'm4',
      title: 'Gestão de Tráfego de Escala Brutal',
      category: 'Tráfego',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '60min',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2670&auto=format&fit=crop',
      description: 'Como gerenciar orçamentos de R$ 10k/dia sem perder o ROAS no Facebook e Google Ads.',
      transcription: 'Transcrição sobre tráfego de escala...'
    },
    {
      id: 'm5',
      title: 'Análise de Oferta de Alunos',
      category: 'Análise',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '42min',
      thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop',
      description: 'Sessão prática corrigindo e otimizando as ofertas dos mentorados em tempo real.',
      transcription: 'Transcrição sobre análise de ofertas...'
    }
  ];

  const categories = Array.from(new Set(mentorias.map(m => m.category)));

  const handleVideoSelect = (video: MentorLesson) => {
    setSelectedVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#141414] text-white selection:bg-white/20 font-sans overflow-x-hidden">
      <Navbar 
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
          else if (page === 'profile') navigate('/perfil');
          else if (page === 'pro') navigate('/pro');
          else if (page === 'alunos' || page === 'lessons') navigate('/alunos');
          else if (page === 'mentorias') navigate('/mentorias');
          else navigate('/ferramentas');
        }} 
      />


      <main className="flex-1">
        {/* Hero / Player Section */}
        <section className="relative w-full aspect-[21/9] sm:aspect-video lg:aspect-[21/9] bg-black group overflow-hidden" ref={playerRef}>
          {selectedVideo ? (
            <div className="absolute inset-0 w-full h-full">
              <iframe
                src={`${selectedVideo.videoUrl}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-24 right-8 z-50 bg-black/50 hover:bg-black/80 p-2 rounded-full border border-white/10 transition-all"
              >
                <XIcon size={24} />
              </button>

            </div>
          ) : (
            <>
              {/* Featured Content (Hero) */}
              <div className="absolute inset-0">
                <img 
                  src={mentorias[0].thumbnail} 
                  alt="Featured" 
                  className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
              </div>

              <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-16 max-w-4xl pt-20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter uppercase">Original</div>
                  <span className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Convert Club Original</span>
                </div>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-display leading-none mb-6">
                  {mentorias[0].title}
                </h1>
                <p className="text-white/70 text-sm sm:text-lg mb-8 max-w-xl font-light leading-relaxed">
                  {mentorias[0].description}
                </p>
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => handleVideoSelect(mentorias[0])}
                    className="h-12 sm:h-14 px-8 rounded bg-white text-black hover:bg-white/90 font-bold flex items-center gap-2"
                  >
                    <Play size={20} fill="currentColor" />
                    Assistir Agora
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-12 sm:h-14 px-8 rounded bg-white/20 hover:bg-white/30 text-white border-transparent font-bold flex items-center gap-2 backdrop-blur-sm"
                  >
                    <Info size={20} />
                    Mais Informações
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Rows of content */}
        <div className="relative z-20 -mt-24 sm:-mt-32 pb-24 px-4 sm:px-16 space-y-12">
          {/* Continue Watching / Recent */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white/90 flex items-center gap-2">
              Gravações de Mentoria
              <ChevronRight className="w-5 h-5 text-white/40" />
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide no-scrollbar">
              {mentorias.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => handleVideoSelect(m)}
                  className="flex-shrink-0 w-64 sm:w-72 lg:w-80 relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30"
                >

                  <div className="aspect-video rounded-md overflow-hidden bg-white/5 border border-white/5 relative">
                    <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                          <Play size={12} fill="currentColor" />
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white">
                          <Plus size={16} />
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{m.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-white/60 font-bold uppercase tracking-widest">
                        <span>{m.duration}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{m.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Rows */}
          {categories.map(cat => (
            <div key={cat}>
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white/90 flex items-center gap-2">
                Vertical: {cat}
                <ChevronRight className="w-5 h-5 text-white/40" />
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide no-scrollbar">
                {mentorias.filter(m => m.category === cat).map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => handleVideoSelect(m)}
                    className="flex-shrink-0 w-64 sm:w-72 relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30"
                  >
                    <div className="aspect-video rounded-md overflow-hidden bg-white/5 border border-white/5">
                      <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-white/80">{m.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Transcription Section if video selected */}
          {selectedVideo && (
            <div className="pt-12 animate-fade-in">
              <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[3rem]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif-display">Transcrição da Mentoria</h3>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Material de Apoio Oficial</p>
                  </div>
                  <Button variant="outline" className="ml-auto rounded-full border-white/10 text-white hover:bg-white/5 px-6 font-bold text-[10px] uppercase tracking-widest gap-2">
                    <Download size={14} /> Baixar PDF
                  </Button>
                </div>
                
                <div className="prose prose-invert max-w-none text-white/50 font-light leading-loose text-sm">
                  <p className="mb-4">
                    <strong>[00:00:00]</strong> Bem-vindos a mais uma mentoria exclusiva do Clube Kayosa. Hoje vamos abordar profundamente o tema: {selectedVideo.title}.
                  </p>
                  <p className="mb-4">
                    {selectedVideo.transcription}
                  </p>
                  <p>
                    Para aplicar o que discutimos hoje, recomendo focar inicialmente na estrutura de tráfego, garantindo que o seu pixel esteja devidamente aquecido antes de subir o orçamento principal...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 opacity-30">
          <div className="text-[9px] font-bold uppercase tracking-[0.5em]">
            &copy; 2026 CONVERT CLUB · BUILT FOR THE 1%
          </div>
          <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Ajuda</a>
          </div>
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

const XIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

