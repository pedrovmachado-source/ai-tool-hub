import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isPaid } from '@/lib/plan';
import { X, Folder, Play, FileText, ArrowLeft, Lock } from 'lucide-react';
import { PdfModal, VideoModal } from '@/lib/lessonViewers';
import logoAdai from '@/assets/logo.png';

interface Module { id: string; title: string; description: string; cover_url: string | null; sort_order: number; }
interface Lesson {
  id: string; module_id: string; title: string; description: string;
  kind: 'video' | 'transcript' | 'both';
  video_url: string | null; pdf_path: string | null; duration_min: number | null; sort_order: number;
}

export default function NicheLessonsModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  const { user, isAdmin } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [openModule, setOpenModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState<Lesson | null>(null);
  const [pdf, setPdf] = useState<Lesson | null>(null);

  const canAccess = isAdmin || isPaid(user?.plano);

  useEffect(() => {
    if (!canAccess) { setLoading(false); return; }
    (async () => {
      try {
        const [m, l] = await Promise.all([
          supabase.from('niche_modules' as any).select('*').order('sort_order'),
          supabase.from('niche_lessons' as any).select('*').order('sort_order'),
        ]);
        if (m.data) setModules(m.data as unknown as Module[]);
        if (l.data) setLessons(l.data as unknown as Lesson[]);
      } finally { setLoading(false); }
    })();
  }, [canAccess]);

  const moduleLessons = openModule ? lessons.filter(l => l.module_id === openModule.id) : [];

  return (
    <div className="fixed inset-0 z-[400] bg-black/60 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            {openModule && (
              <button onClick={() => setOpenModule(null)} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /></button>
            )}
            <h3 className="font-serif-display text-lg sm:text-xl truncate">{openModule ? openModule.title : 'Aulas por Nicho'}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!canAccess ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 overflow-hidden">
                <img src={logoAdai} alt="Logo" className="w-10 h-10 object-contain" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Conteúdo exclusivo para assinantes <strong>Elite</strong>, <strong>Elite Plus</strong> ou <strong>Max</strong>.</p>
              <button onClick={onUpgrade} className="px-6 py-2 rounded-lg bg-brand-amber text-white text-sm font-bold uppercase tracking-widest">⚡ Assinar</button>
            </div>
          ) : loading ? (
            <p className="text-center text-muted-foreground py-10">Carregando…</p>
          ) : !openModule ? (
            modules.length === 0 ? (
              <div className="text-center py-12">
                <Folder size={36} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhum módulo disponível ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.map(m => {
                  const count = lessons.filter(l => l.module_id === m.id).length;
                  return (
                    <button key={m.id} onClick={() => setOpenModule(m)} className="text-left bg-secondary border border-border rounded-xl p-4 hover:border-brand-blue transition-colors">
                      {m.cover_url && <img src={m.cover_url} alt={m.title} className="w-full h-28 object-cover rounded-lg mb-3" />}
                      <div className="flex items-center gap-2 mb-1">
                        <Folder size={16} className="text-brand-blue-medium" />
                        <h4 className="font-medium text-sm truncate">{m.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-2">{count} aula(s)</p>
                    </button>
                  );
                })}
              </div>
            )
          ) : moduleLessons.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">Nenhuma aula neste módulo ainda.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {moduleLessons.map(l => (
                <div key={l.id} className="bg-secondary border border-border rounded-xl p-4">
                  <h4 className="font-medium text-sm mb-1">{l.title}</h4>
                  {l.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{l.description}</p>}
                  <div className="flex gap-2">
                    {l.video_url && (
                      <button onClick={() => setVideo(l)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-blue/15 text-brand-blue-medium text-xs">
                        <Play size={12} /> Vídeo
                      </button>
                    )}
                    {l.pdf_path && (
                      <button onClick={() => setPdf(l)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-green/15 text-brand-green text-xs">
                        <FileText size={12} /> PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {video && video.video_url && (
        <VideoModal title={video.title} url={video.video_url} onClose={() => setVideo(null)} />
      )}
      {pdf && pdf.pdf_path && (
        <PdfModal title={pdf.title} path={pdf.pdf_path} onClose={() => setPdf(null)} />
      )}
    </div>
  );
}
