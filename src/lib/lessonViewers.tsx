import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Loader2, X } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { supabase } from '@/integrations/supabase/client';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export function getEmbedUrl(url: string): string | null {
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

export function VideoModal({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[400] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-medium text-sm">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="aspect-video bg-black">
          <iframe
            src={getEmbedUrl(url) || url}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export function ImageModal({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[400] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white p-2"><X size={22} /></button>
      <img src={url} alt={title} className="max-h-[90vh] max-w-full rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
    </div>
  );
}

export function PdfModal({ title, path, onClose }: { title: string; path: string; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const scale = useMemo(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 0.8 : 1.2), []);

  useEffect(() => {
    let active = true;
    let blobUrl: string | null = null;
    (async () => {
      try {
        const { data, error } = await supabase.storage.from('lesson-pdfs').download(path);
        if (error || !data) { console.error(error); return; }
        const blob = new Blob([await data.arrayBuffer()], { type: 'application/pdf' });
        blobUrl = URL.createObjectURL(blob);
        if (active) setUrl(blobUrl);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [path]);

  return (
    <div className="fixed inset-0 z-[400] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="min-w-0">
            <h3 className="font-medium text-sm flex items-center gap-2"><FileText size={16} /> {title}</h3>
            {pages > 0 && <p className="text-xs text-muted-foreground mt-1">Página {page} de {pages}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages} className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
          {loading || !url ? (
            <div className="h-full flex items-center justify-center text-muted-foreground gap-2 text-sm">
              <Loader2 size={18} className="animate-spin" /> Carregando PDF…
            </div>
          ) : (
            <div className="min-h-full flex justify-center">
              <Document
                file={url}
                loading={<div className="text-muted-foreground text-sm flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Renderizando…</div>}
                error={<div className="text-sm text-muted-foreground">Não foi possível renderizar este PDF.</div>}
                onLoadSuccess={({ numPages }) => { setPages(numPages); setPage(1); }}
              >
                <Page pageNumber={page} scale={scale} renderAnnotationLayer renderTextLayer className="shadow-lg" />
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
