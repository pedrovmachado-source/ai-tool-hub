import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Meta from '@/components/Meta';
import MentoriaModal from '@/components/MentoriaModal';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  FileText, 
  Download, 
  X,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  cover_url: string | null;
  sort_order: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  kind: 'video' | 'transcript' | 'both';
  video_url: string | null;
  pdf_path: string | null;
  duration_min: number | null;
  sort_order: number;
}

export default function Mentorias() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentoriaModalOpen, setMentoriaModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Lesson | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && user.abuseBlocked) {
      navigate('/bloqueado');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mRes, lRes] = await Promise.all([
          supabase.from('modules').select('*').order('sort_order'),
          supabase.from('lessons').select('*').order('sort_order'),
        ]);
        if (mRes.data) setModules(mRes.data as Module[]);
        if (lRes.data) setLessons(lRes.data as Lesson[]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVideoSelect = (video: Lesson) => {
    setSelectedVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getEmbedUrl = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        const id = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v');
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (u.hostname.includes('vimeo.com')) {
        const id = u.pathname.split('/').filter(Boolean).pop();
        if (id) return `https://player.vimeo.com/video/${id}`;
      }
      if (u.hostname.includes('loom.com')) {
        return url.replace('/share/', '/embed/');
      }
      return url;
    } catch {
      return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#141414] text-white selection:bg-white/20 font-sans overflow-x-hidden">
      <Meta title="Mentorias | Convert Club" description="Assista às mentorias exclusivas do Convert Club com estratégias de escala e conversão brutal." />
      <Navbar 
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
          else if (page === 'profile') navigate('/perfil');
          else if (page === 'pro' || page === 'elite') navigate('/pro');
          else if (page === 'alunos' || page === 'lessons') navigate('/alunos');
          else if (page === 'mentorias') navigate('/mentorias');
          else if (page === 'menu') navigate('/menu');
          else if (page === 'ofertas' || page === 'offers') navigate('/ofertas');
          else {
            sessionStorage.setItem('adai:initialPage', page);
            navigate('/ferramentas');
          }
        }}
      />

      <main className="flex-1">
        {/* Hero / Player Section */}
        <div className="flex flex-col">
          <section className="relative w-full aspect-video bg-black group overflow-hidden" ref={playerRef}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin opacity-20" />
              </div>
            ) : selectedVideo ? (
              <div className="absolute inset-0 w-full h-full">
                <iframe
                  src={`${getEmbedUrl(selectedVideo.video_url || '')}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-24 right-8 z-50 bg-black/50 hover:bg-black/80 p-2 rounded-full border border-white/10 transition-all text-white"
                >
                  <X size={24} />
                </button>
              </div>
            ) : lessons.length > 0 ? (
              <>
                {/* Featured Content (Hero) */}
                <div className="absolute inset-0">
                  {modules.find(m => m.id === lessons[0].module_id)?.cover_url ? (
                    <img 
                      src={modules.find(m => m.id === lessons[0].module_id)?.cover_url || ''} 
                      alt="Featured" 
                      className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
                    />
                  ) : (
                    <div className="w-full h-full bg-navy opacity-40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-16 max-w-4xl pt-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter uppercase">Original</div>
                    <span className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Convert Club Original</span>
                  </div>
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-display leading-none mb-6">
                    {lessons[0].title}
                  </h1>
                  <p className="text-white/70 text-sm sm:text-lg mb-8 max-w-xl font-light leading-relaxed">
                    {lessons[0].description}
                  </p>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={() => handleVideoSelect(lessons[0])}
                      className="h-12 sm:h-14 px-8 rounded bg-white text-black hover:bg-white/90 font-bold flex items-center gap-2"
                    >
                      <Play size={20} fill="currentColor" />
                      Assistir Agora
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/40 font-serif-display text-xl uppercase tracking-widest">Nenhuma aula disponível</p>
              </div>
            )}
          </section>

          {/* Quick PDF Action Bar */}
          {selectedVideo && selectedVideo.pdf_path && (
            <div className="bg-white/[0.03] border-b border-white/5 py-4 px-8 sm:px-16 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white/60" />
                </div>
                <span className="text-sm font-medium text-white/80">Material PDF disponível</span>
              </div>
              <Button 
                variant="outline" 
                className="rounded-full border-white/10 text-white hover:bg-white/5 px-6 font-bold text-[10px] uppercase tracking-widest gap-2 h-9"
                onClick={async () => {
                  if (!selectedVideo.pdf_path) return;
                  const { data, error } = await supabase.storage.from('lesson-pdfs').createSignedUrl(selectedVideo.pdf_path, 3600);
                  if (error) {
                    console.error('Error generating PDF URL:', error);
                    const { data: publicData } = await supabase.storage.from('lesson-pdfs').getPublicUrl(selectedVideo.pdf_path);
                    if (publicData?.publicUrl) window.open(publicData.publicUrl, '_blank');
                    return;
                  }
                  if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                }}
              >
                <Download size={14} /> Visualizar PDF
              </Button>
            </div>
          )}
        </div>



        {/* Rows of content */}
        <div className="relative z-20 px-4 sm:px-16 py-12 space-y-12 bg-[#141414]">

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-white animate-spin opacity-20" />
            </div>
          ) : modules.map(module => {
            const moduleLessons = lessons.filter(l => l.module_id === module.id);
            if (moduleLessons.length === 0) return null;

            return (
              <div key={module.id}>
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white/90 flex items-center gap-2">
                  {module.title}
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide no-scrollbar">
                  {moduleLessons.map((l) => (
                    <div 
                      key={l.id}
                      onClick={() => handleVideoSelect(l)}
                      className="flex-shrink-0 w-64 sm:w-72 lg:w-80 relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30"
                    >
                      <div className="aspect-video rounded-md overflow-hidden bg-white/5 border border-white/5 relative">
                        {module.cover_url ? (
                          <img src={module.cover_url} alt={l.title} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                        ) : (
                          <div className="w-full h-full bg-navy group-hover:opacity-40 transition-opacity flex items-center justify-center">
                            <Play size={32} className="text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                              <Play size={12} fill="currentColor" />
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">{l.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-white/60 font-bold uppercase tracking-widest">
                            {l.duration_min && <span>{l.duration_min}min</span>}
                            {l.duration_min && <span className="w-1 h-1 rounded-full bg-white/20" />}
                            <span className="truncate">{l.kind === 'video' ? 'Vídeo' : l.kind === 'transcript' ? 'PDF' : 'Vídeo + PDF'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Transcription Section if video selected */}
          {selectedVideo && (selectedVideo.description || selectedVideo.pdf_path) && (
            <div className="pt-12 animate-fade-in">
              <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[3rem]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif-display">Material da Mentoria</h3>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Material de Apoio Oficial</p>
                  </div>
                  {selectedVideo.pdf_path && (
                    <Button 
                      variant="outline" 
                      className="ml-auto rounded-full border-white/10 text-white hover:bg-white/5 px-6 font-bold text-[10px] uppercase tracking-widest gap-2"
                      onClick={async () => {
                        if (!selectedVideo.pdf_path) return;
                        const { data } = await supabase.storage.from('lesson-pdfs').getPublicUrl(selectedVideo.pdf_path);
                        if (data?.publicUrl) window.open(data.publicUrl, '_blank');
                      }}
                    >
                      <Download size={14} /> Baixar PDF
                    </Button>
                  )}
                </div>
                
                <div className="prose prose-invert max-w-none text-white/50 font-light leading-loose text-sm">
                  {selectedVideo.description ? (
                    <p className="mb-4">{selectedVideo.description}</p>
                  ) : (
                    <p className="italic">Nenhuma descrição disponível para esta mentoria.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 opacity-30">
            <div className="text-[9px] font-bold uppercase tracking-[0.5em]">
              &copy; 2026 CONVERT CLUB · BUILT FOR THE 1%
            </div>
            <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Ajuda</a>
            </div>
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
