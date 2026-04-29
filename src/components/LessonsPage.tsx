import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Play, FileText, Lock, Folder, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

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

function getEmbedUrl(url: string): string | null {
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
}

export default function LessonsPage({ onBack }: { onBack: () => void }) {
  const { user, isAdmin } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModule, setOpenModule] = useState<Module | null>(null);
  const [playingLesson, setPlayingLesson] = useState<Lesson | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('Transcrição');
  const [pdfPages, setPdfPages] = useState(0);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);

  const canAccess = isAdmin || user?.plano === 'Pro';
  const pdfCanGoPrev = pdfPage > 1;
  const pdfCanGoNext = pdfPage < pdfPages;
  const pdfScale = useMemo(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 0.8 : 1.2), []);

  useEffect(() => {
    if (!canAccess) { setLoading(false); return; }
    (async () => {
      try {
        const [mRes, lRes] = await Promise.all([
          supabase.from('modules').select('*').order('sort_order'),
          supabase.from('lessons').select('*').order('sort_order'),
        ]);
        if (mRes.data) setModules(mRes.data as Module[]);
        if (lRes.data) setLessons(lRes.data as Lesson[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [canAccess]);

  const closePdf = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfPages(0);
    setPdfPage(1);
    setPdfTitle('Transcrição');
  };

  const openPdf = async (path: string, title: string) => {
    try {
      setPdfLoading(true);
      setPdfTitle(title);
      setPdfPages(0);
      setPdfPage(1);
      const { data, error } = await supabase.storage.from('lesson-pdfs').download(path);
      if (error || !data) {
        console.error('PDF download error:', error);
        return;
      }
      const blob = new Blob([await data.arrayBuffer()], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
    } catch (e) {
      console.error('PDF load failed:', e);
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto py-20 px-6 text-center">
          <Lock size={42} className="mx-auto mb-4 text-muted-foreground/50" />
          <h1 className="font-serif-display text-3xl mb-3">Aulas e Transcrições</h1>
          <p className="text-muted-foreground mb-6">Conteúdo exclusivo para assinantes Pro.</p>
          <button onClick={onBack} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Voltar</button>
        </div>
      </div>
    );
  }

  const moduleLessons = openModule ? lessons.filter(l => l.module_id === openModule.id) : [];
  const videoLessons = moduleLessons.filter(l => l.kind !== 'transcript' && l.video_url);
  const transcriptLessons = moduleLessons.filter(l => l.kind !== 'video' && l.pdf_path);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-navy py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <button onClick={openModule ? () => setOpenModule(null) : onBack} className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4">
            <ArrowLeft size={16} /> {openModule ? 'Voltar aos módulos' : 'Voltar'}
          </button>
          <h1 className="font-serif-display text-3xl text-white mb-2">{openModule ? openModule.title : 'Aulas e Transcrições'}</h1>
          <p className="text-sm text-white/60">{openModule ? openModule.description : 'Conteúdos exclusivos: vídeos e materiais em PDF.'}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">Carregando…</p>
        ) : !openModule ? (
          modules.length === 0 ? (
            <div className="text-center py-16">
              <Folder size={42} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhum módulo disponível ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map(m => {
                const count = lessons.filter(l => l.module_id === m.id).length;
                return (
                  <button key={m.id} onClick={() => setOpenModule(m)} className="text-left bg-card border border-border rounded-xl p-5 hover:border-brand-blue transition-colors">
                    {m.cover_url && <img src={m.cover_url} alt={m.title} className="w-full h-32 object-cover rounded-lg mb-3" />}
                    <div className="flex items-center gap-2 mb-2">
                      <Folder size={18} className="text-brand-blue-medium" />
                      <h3 className="font-medium">{m.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-2">{count} aula(s)</p>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <Tabs defaultValue="videos">
            <TabsList>
              <TabsTrigger value="videos"><Play size={14} className="mr-1.5" /> Vídeos ({videoLessons.length})</TabsTrigger>
              <TabsTrigger value="transcripts"><FileText size={14} className="mr-1.5" /> Transcrições ({transcriptLessons.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="videos" className="mt-4">
              {videoLessons.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhum vídeo neste módulo.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoLessons.map(l => (
                    <button key={l.id} onClick={() => setPlayingLesson(l)} className="text-left bg-card border border-border rounded-xl p-4 hover:border-brand-blue transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Play size={16} className="text-brand-blue-medium" />
                        <h4 className="font-medium text-sm">{l.title}</h4>
                      </div>
                      {l.description && <p className="text-xs text-muted-foreground line-clamp-2">{l.description}</p>}
                      {l.duration_min && <p className="text-[11px] text-muted-foreground/60 mt-1">{l.duration_min} min</p>}
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="transcripts" className="mt-4">
              {transcriptLessons.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma transcrição neste módulo.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transcriptLessons.map(l => (
                    <button key={l.id} onClick={() => l.pdf_path && openPdf(l.pdf_path, l.title)} className="text-left bg-card border border-border rounded-xl p-4 hover:border-brand-blue transition-colors disabled:opacity-70" disabled={pdfLoading}>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText size={16} className="text-brand-green" />
                        <h4 className="font-medium text-sm">{l.title}</h4>
                      </div>
                      {l.description && <p className="text-xs text-muted-foreground line-clamp-2">{l.description}</p>}
                      {pdfLoading && <p className="text-[11px] text-muted-foreground/70 mt-2">Abrindo PDF…</p>}
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Video player modal */}
      {playingLesson && playingLesson.video_url && (
        <div className="fixed inset-0 z-[400] bg-black/80 flex items-center justify-center p-4" onClick={() => setPlayingLesson(null)}>
          <div className="bg-card rounded-xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-medium text-sm">{playingLesson.title}</h3>
              <button onClick={() => setPlayingLesson(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={getEmbedUrl(playingLesson.video_url) || playingLesson.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {playingLesson.description && <p className="p-4 text-sm text-muted-foreground">{playingLesson.description}</p>}
          </div>
        </div>
      )}

      {/* PDF viewer modal */}
      {(pdfUrl || pdfLoading) && (
        <div className="fixed inset-0 z-[400] bg-black/80 flex items-center justify-center p-4" onClick={closePdf}>
          <div className="bg-card rounded-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="min-w-0">
                <h3 className="font-medium text-sm flex items-center gap-2"><FileText size={16} /> {pdfTitle}</h3>
                {pdfPages > 0 && <p className="text-xs text-muted-foreground mt-1">Página {pdfPage} de {pdfPages}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPdfPage(p => Math.max(1, p - 1))} disabled={!pdfCanGoPrev} className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPdfPage(p => Math.min(pdfPages, p + 1))} disabled={!pdfCanGoNext} className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
                <button onClick={closePdf} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
              {pdfLoading || !pdfUrl ? (
                <div className="h-full flex items-center justify-center text-muted-foreground gap-2 text-sm">
                  <Loader2 size={18} className="animate-spin" /> Carregando PDF…
                </div>
              ) : (
                <div className="min-h-full flex justify-center">
                  <Document
                    file={pdfUrl}
                    loading={<div className="h-full flex items-center justify-center text-muted-foreground gap-2 text-sm"><Loader2 size={18} className="animate-spin" /> Renderizando PDF…</div>}
                    error={<div className="text-sm text-muted-foreground">Não foi possível renderizar este PDF.</div>}
                    onLoadSuccess={({ numPages }) => {
                      setPdfPages(numPages);
                      setPdfPage(1);
                    }}
                  >
                    <Page
                      pageNumber={pdfPage}
                      scale={pdfScale}
                      renderAnnotationLayer
                      renderTextLayer
                      className="shadow-lg"
                    />
                  </Document>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
