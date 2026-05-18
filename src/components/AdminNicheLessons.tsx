import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, X, Folder, Play, FileText, ArrowLeft, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logActivity } from '@/lib/activity-log';

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

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

export default function AdminNicheLessons() {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [openModule, setOpenModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [moduleForm, setModuleForm] = useState<Partial<Module> | null>(null);
  const [lessonForm, setLessonForm] = useState<Partial<Lesson> | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const reload = async () => {
    setLoading(true);
    const [m, l] = await Promise.all([
      supabase.from('niche_modules' as any).select('*').order('sort_order'),
      supabase.from('niche_lessons' as any).select('*').order('sort_order'),
    ]);
    if (m.data) setModules(m.data as unknown as Module[]);
    if (l.data) setLessons(l.data as unknown as Lesson[]);
    setLoading(false);
  };

  useEffect(() => { void reload(); }, []);

  const saveModule = async () => {
    if (!moduleForm?.title) { toast({ title: 'Título obrigatório', variant: 'destructive' }); return; }
    const payload = {
      title: moduleForm.title,
      description: moduleForm.description || '',
      cover_url: moduleForm.cover_url || null,
      sort_order: moduleForm.sort_order ?? modules.length,
    };
    if (moduleForm.id) {
      const { error } = await supabase.from('niche_modules' as any).update(payload).eq('id', moduleForm.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      void logActivity({ action: 'update', entity_type: 'niche_module', entity_id: moduleForm.id, entity_label: payload.title });
    } else {
      const { error } = await supabase.from('niche_modules' as any).insert(payload);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      void logActivity({ action: 'create', entity_type: 'niche_module', entity_label: payload.title });
    }
    toast({ title: 'Módulo salvo' });
    setModuleForm(null);
    await reload();
  };

  const deleteModule = async (id: string) => {
    if (!confirm('Excluir este módulo e todas as aulas?')) return;
    const moduleLessons = lessons.filter(l => l.module_id === id && l.pdf_path);
    if (moduleLessons.length) await supabase.storage.from('lesson-pdfs').remove(moduleLessons.map(l => l.pdf_path!));
    const { error } = await supabase.from('niche_modules' as any).delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Módulo excluído' });
    await reload();
  };

  const uploadPdf = async (file: File): Promise<string | null> => {
    if (file.type !== 'application/pdf') { toast({ title: 'Apenas PDF', variant: 'destructive' }); return null; }
    if (file.size > 30 * 1024 * 1024) { toast({ title: 'PDF muito grande (máx 30MB)', variant: 'destructive' }); return null; }
    setUploadingPdf(true);
    try {
      const path = `niche/${openModule?.id || 'misc'}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage.from('lesson-pdfs').upload(path, file, { contentType: 'application/pdf' });
      if (error) { toast({ title: 'Falha no upload', description: error.message, variant: 'destructive' }); return null; }
      return path;
    } finally { setUploadingPdf(false); }
  };

  const saveLesson = async () => {
    if (!lessonForm?.title || !openModule) { toast({ title: 'Título obrigatório', variant: 'destructive' }); return; }
    const kind = lessonForm.kind || 'video';
    if ((kind === 'video' || kind === 'both') && !lessonForm.video_url) { toast({ title: 'URL do vídeo obrigatória', variant: 'destructive' }); return; }
    if ((kind === 'transcript' || kind === 'both') && !lessonForm.pdf_path) { toast({ title: 'PDF obrigatório', variant: 'destructive' }); return; }
    const payload = {
      module_id: openModule.id,
      title: lessonForm.title,
      description: lessonForm.description || '',
      kind,
      video_url: lessonForm.video_url || null,
      pdf_path: lessonForm.pdf_path || null,
      duration_min: lessonForm.duration_min || null,
      sort_order: lessonForm.sort_order ?? lessons.filter(l => l.module_id === openModule.id).length,
    };
    if (lessonForm.id) {
      const { error } = await supabase.from('niche_lessons' as any).update(payload).eq('id', lessonForm.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('niche_lessons' as any).insert(payload);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: 'Aula salva' });
    setLessonForm(null);
    await reload();
  };

  const deleteLesson = async (l: Lesson) => {
    if (!confirm(`Excluir a aula "${l.title}"?`)) return;
    if (l.pdf_path) await supabase.storage.from('lesson-pdfs').remove([l.pdf_path]);
    const { error } = await supabase.from('niche_lessons' as any).delete().eq('id', l.id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Aula excluída' });
    await reload();
  };

  if (loading) return <p className="text-muted-foreground/60">Carregando…</p>;

  if (openModule) {
    const moduleLessons = lessons.filter(l => l.module_id === openModule.id);
    const kind = lessonForm?.kind || 'video';
    return (
      <>
        <button onClick={() => setOpenModule(null)} className="flex items-center gap-1.5 text-[12px] text-brand-blue-medium mb-4">
          <ArrowLeft size={14} /> Voltar aos módulos
        </button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-primary-foreground">{openModule.title}</h1>
            <p className="text-[12px] text-muted-foreground/50">{openModule.description}</p>
          </div>
          <button onClick={() => setLessonForm({ kind: 'video' })} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] bg-brand-blue text-primary-foreground">
            <Plus size={14} /> Nova aula
          </button>
        </div>

        <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
          {moduleLessons.length === 0 ? (
            <p className="p-6 text-center text-[12px] text-muted-foreground/50">Nenhuma aula ainda.</p>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-primary-foreground/[0.07]">
                {['Aula', 'Tipo', 'Duração', 'Ações'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {moduleLessons.map(l => (
                  <tr key={l.id} className="border-b border-primary-foreground/[0.04]">
                    <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{l.title}</td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/60">
                      {l.kind === 'video' && <span className="inline-flex items-center gap-1"><Play size={11} /> Vídeo</span>}
                      {l.kind === 'transcript' && <span className="inline-flex items-center gap-1"><FileText size={11} /> PDF</span>}
                      {l.kind === 'both' && <span className="inline-flex items-center gap-1"><Play size={11} /><FileText size={11} /> Ambos</span>}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/60">{l.duration_min ? `${l.duration_min} min` : '—'}</td>
                    <td className="px-5 py-3 flex gap-2">
                      <button onClick={() => setLessonForm(l)} className="text-brand-blue-medium hover:opacity-80"><Pencil size={13} /></button>
                      <button onClick={() => deleteLesson(l)} className="text-brand-red/70 hover:text-brand-red"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {lessonForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setLessonForm(null)}>
            <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-[520px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-primary-foreground">{lessonForm.id ? 'Editar Aula' : 'Nova Aula'}</h3>
                <button onClick={() => setLessonForm(null)} className="text-muted-foreground/40 hover:text-primary-foreground"><X size={16} /></button>
              </div>
              <Field label="Título"><input value={lessonForm.title || ''} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} className={inputCls} /></Field>
              <Field label="Descrição"><textarea value={lessonForm.description || ''} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} rows={2} className={inputCls + ' resize-none'} /></Field>
              <Field label="Tipo">
                <select value={kind} onChange={e => setLessonForm({ ...lessonForm, kind: e.target.value as Lesson['kind'] })} className={inputCls}>
                  <option value="video">Apenas vídeo</option>
                  <option value="transcript">Apenas PDF</option>
                  <option value="both">Vídeo + PDF</option>
                </select>
              </Field>
              {(kind === 'video' || kind === 'both') && (
                <Field label="URL do vídeo (YouTube, Vimeo, Loom)">
                  <input value={lessonForm.video_url || ''} onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })} placeholder="https://..." className={inputCls} />
                </Field>
              )}
              {(kind === 'transcript' || kind === 'both') && (
                <Field label="PDF">
                  {lessonForm.pdf_path ? (
                    <div className="flex items-center gap-2 bg-brand-green/10 rounded-lg p-3">
                      <FileText size={14} className="text-brand-green" />
                      <span className="text-[12px] flex-1 truncate">{lessonForm.pdf_path.split('/').pop()}</span>
                      <button onClick={() => setLessonForm({ ...lessonForm, pdf_path: null })} className="text-brand-red/60 text-[11px]">Remover</button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] bg-primary-foreground/5 border border-dashed border-primary-foreground/20 text-muted-foreground/60 cursor-pointer hover:border-brand-blue">
                      <Upload size={14} /> {uploadingPdf ? 'Enviando…' : 'Subir PDF'}
                      <input type="file" accept="application/pdf" className="hidden" disabled={uploadingPdf}
                        onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; const p = await uploadPdf(f); if (p) setLessonForm(prev => ({ ...prev, pdf_path: p })); }} />
                    </label>
                  )}
                </Field>
              )}
              <Field label="Duração (min, opcional)"><input type="number" value={lessonForm.duration_min || ''} onChange={e => setLessonForm({ ...lessonForm, duration_min: e.target.value ? Number(e.target.value) : null })} className={inputCls} /></Field>
              <Field label="Ordem"><input type="number" value={lessonForm.sort_order ?? 0} onChange={e => setLessonForm({ ...lessonForm, sort_order: Number(e.target.value) })} className={inputCls} /></Field>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setLessonForm(null)} className="px-4 py-2 text-sm text-muted-foreground/60">Cancelar</button>
                <button onClick={saveLesson} disabled={uploadingPdf} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50">Salvar</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-primary-foreground">Aulas por Nicho</h1>
          <p className="text-[12px] text-muted-foreground/50">Módulos e aulas específicas por nicho (mineração, copy, criação de sites, etc.).</p>
        </div>
        <button onClick={() => setModuleForm({ sort_order: modules.length })} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] bg-brand-blue text-primary-foreground">
          <Plus size={14} /> Novo módulo
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-10 text-center">
          <Folder size={36} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-[13px] text-muted-foreground/60">Nenhum módulo ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map(m => {
            const count = lessons.filter(l => l.module_id === m.id).length;
            return (
              <div key={m.id} className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-4">
                <button onClick={() => setOpenModule(m)} className="text-left w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <Folder size={15} className="text-brand-blue-medium" />
                    <h3 className="text-[13px] font-medium text-primary-foreground truncate">{m.title}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 line-clamp-2">{m.description || '—'}</p>
                  <p className="text-[10px] text-muted-foreground/40 mt-1">{count} aula(s)</p>
                </button>
                <div className="flex gap-2 pt-2 mt-2 border-t border-primary-foreground/[0.05]">
                  <button onClick={() => setModuleForm(m)} className="text-brand-blue-medium"><Pencil size={13} /></button>
                  <button onClick={() => deleteModule(m.id)} className="text-brand-red/70"><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {moduleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModuleForm(null)}>
          <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-[480px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-primary-foreground">{moduleForm.id ? 'Editar Módulo' : 'Novo Módulo'}</h3>
              <button onClick={() => setModuleForm(null)} className="text-muted-foreground/40"><X size={16} /></button>
            </div>
            <Field label="Título"><input value={moduleForm.title || ''} onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))} className={inputCls} /></Field>
            <Field label="Descrição"><textarea value={moduleForm.description || ''} onChange={e => setModuleForm(p => ({ ...p, description: e.target.value }))} rows={3} className={inputCls + ' resize-none'} /></Field>
            <Field label="URL da capa (opcional)"><input value={moduleForm.cover_url || ''} onChange={e => setModuleForm(p => ({ ...p, cover_url: e.target.value }))} placeholder="https://..." className={inputCls} /></Field>
            <Field label="Ordem"><input type="number" value={moduleForm.sort_order ?? 0} onChange={e => setModuleForm(p => ({ ...p, sort_order: Number(e.target.value) }))} className={inputCls} /></Field>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModuleForm(null)} className="px-4 py-2 text-sm text-muted-foreground/60">Cancelar</button>
              <button onClick={saveModule} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
