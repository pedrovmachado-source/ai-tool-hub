import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, X, ArrowLeft, Upload, Folder, Play, FileText, Image as ImageIcon, FileText as TextIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logActivity } from '@/lib/activity-log';

interface Section {
  id: string;
  slug: string;
  title: string;
  description: string;
  intro: string;
  cover_url: string | null;
  min_plan: 'Free' | 'Elite' | 'Elite Plus' | 'Max';
  sort_order: number;
}

interface Item {
  id: string;
  section_slug: string;
  topic: string | null;
  title: string;
  description: string;
  kind: 'video' | 'pdf' | 'image' | 'text';
  video_url: string | null;
  pdf_path: string | null;
  image_url: string | null;
  body: string | null;
  example_url: string | null;
  buy_url: string | null;
  sort_order: number;
  examples?: { label: string; url: string }[] | null;
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

export default function AdminContentSections({ autoOpenSlug }: { autoOpenSlug?: string } = {}) {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<Section[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [openSection, setOpenSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionForm, setSectionForm] = useState<Partial<Section> | null>(null);
  const [itemForm, setItemForm] = useState<Partial<Item> | null>(null);
  const [uploading, setUploading] = useState(false);

  const invalidatePublic = (slug?: string) => {
    if (slug) queryClient.invalidateQueries({ queryKey: ['content-section', slug] });
    else queryClient.invalidateQueries({ queryKey: ['content-section'] });
  };

  const reload = async () => {
    setLoading(true);
    const [s, i] = await Promise.all([
      supabase.from('content_sections').select('*').order('sort_order'),
      supabase.from('content_items').select('*').order('sort_order'),
    ]);
    if (s.data) {
      const list = s.data as Section[];
      setSections(list);
      if (autoOpenSlug) {
        const target = list.find(x => x.slug === autoOpenSlug);
        if (target) setOpenSection(prev => prev ?? target);
      }
    }
    if (i.data) setItems((i.data as unknown) as Item[]);
    setLoading(false);
  };

  useEffect(() => { void reload(); }, []);

  const saveSection = async () => {
    if (!sectionForm?.title || !sectionForm.slug) { toast({ title: 'Título e slug obrigatórios', variant: 'destructive' }); return; }
    const payload = {
      slug: sectionForm.slug,
      title: sectionForm.title,
      description: sectionForm.description || '',
      intro: sectionForm.intro || '',
      cover_url: sectionForm.cover_url || null,
      min_plan: sectionForm.min_plan || 'Elite',
      sort_order: sectionForm.sort_order ?? sections.length,
    };
    if (sectionForm.id) {
      const { error } = await supabase.from('content_sections').update(payload).eq('id', sectionForm.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      void logActivity({ action: 'update', entity_type: 'content_section', entity_id: sectionForm.id, entity_label: payload.title });
    } else {
      const { error } = await supabase.from('content_sections').insert(payload);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      void logActivity({ action: 'create', entity_type: 'content_section', entity_label: payload.title });
    }
    toast({ title: 'Seção salva' });
    setSectionForm(null);
    await reload();
  };

  const deleteSection = async (s: Section) => {
    if (!confirm(`Excluir a seção "${s.title}" e todos os itens?`)) return;
    const sectionItems = items.filter(i => i.section_slug === s.slug && i.pdf_path);
    if (sectionItems.length) await supabase.storage.from('lesson-pdfs').remove(sectionItems.map(i => i.pdf_path!));
    const { error } = await supabase.from('content_sections').delete().eq('id', s.id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    void logActivity({ action: 'delete', entity_type: 'content_section', entity_id: s.id, entity_label: s.title });
    toast({ title: 'Seção excluída' });
    await reload();
  };

  const uploadPdf = async (file: File): Promise<string | null> => {
    if (file.type !== 'application/pdf') { toast({ title: 'Apenas PDF', variant: 'destructive' }); return null; }
    if (file.size > 30 * 1024 * 1024) { toast({ title: 'PDF muito grande (máx 30MB)', variant: 'destructive' }); return null; }
    setUploading(true);
    try {
      const path = `content/${openSection?.slug || 'misc'}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage.from('lesson-pdfs').upload(path, file, { contentType: 'application/pdf' });
      if (error) { toast({ title: 'Falha no upload', description: error.message, variant: 'destructive' }); return null; }
      return path;
    } finally { setUploading(false); }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) { toast({ title: 'Apenas imagens', variant: 'destructive' }); return null; }
    if (file.size > 8 * 1024 * 1024) { toast({ title: 'Imagem muito grande (máx 8MB)', variant: 'destructive' }); return null; }
    setUploading(true);
    try {
      const path = `${openSection?.slug || 'misc'}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage.from('content-images').upload(path, file, { contentType: file.type });
      if (error) { toast({ title: 'Falha no upload', description: error.message, variant: 'destructive' }); return null; }
      const { data } = supabase.storage.from('content-images').getPublicUrl(path);
      return data.publicUrl;
    } finally { setUploading(false); }
  };

  const saveItem = async () => {
    if (!itemForm?.title || !openSection) { toast({ title: 'Título obrigatório', variant: 'destructive' }); return; }
    const kind = itemForm.kind || 'video';
    if (kind === 'video' && !itemForm.video_url) { toast({ title: 'URL do vídeo obrigatória', variant: 'destructive' }); return; }
    if (kind === 'pdf' && !itemForm.pdf_path) { toast({ title: 'PDF obrigatório', variant: 'destructive' }); return; }
    if (kind === 'image' && !itemForm.image_url) { toast({ title: 'Imagem obrigatória', variant: 'destructive' }); return; }
    const payload = {
      section_slug: openSection.slug,
      topic: itemForm.topic || null,
      title: itemForm.title,
      description: itemForm.description || '',
      kind,
      video_url: kind === 'video' ? itemForm.video_url || null : null,
      pdf_path: kind === 'pdf' ? itemForm.pdf_path || null : null,
      image_url: itemForm.image_url || null,
      body: itemForm.body || null,
      example_url: itemForm.example_url || null,
      buy_url: itemForm.buy_url || null,
      examples: (itemForm.examples || []).filter(e => e.url?.trim()),
      sort_order: itemForm.sort_order ?? items.filter(i => i.section_slug === openSection.slug).length,
    };
    if (itemForm.id) {
      const { error } = await supabase.from('content_items').update(payload).eq('id', itemForm.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      void logActivity({ action: 'update', entity_type: 'content_item', entity_id: itemForm.id, entity_label: payload.title });
    } else {
      const { error } = await supabase.from('content_items').insert(payload);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      void logActivity({ action: 'create', entity_type: 'content_item', entity_label: payload.title });
    }
    toast({ title: 'Item salvo' });
    setItemForm(null);
    invalidatePublic(openSection.slug);
    await reload();
  };

  const deleteItem = async (item: Item) => {
    if (!confirm(`Excluir "${item.title}"?`)) return;
    if (item.pdf_path) await supabase.storage.from('lesson-pdfs').remove([item.pdf_path]);
    const { error } = await supabase.from('content_items').delete().eq('id', item.id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    void logActivity({ action: 'delete', entity_type: 'content_item', entity_id: item.id, entity_label: item.title });
    toast({ title: 'Item excluído' });
    invalidatePublic(item.section_slug);
    await reload();
  };

  if (loading) return <p className="text-muted-foreground/60">Carregando…</p>;

  // === Section detail ===
  if (openSection) {
    const sectionItems = items.filter(i => i.section_slug === openSection.slug);
    return (
      <>
        <button onClick={() => setOpenSection(null)} className="flex items-center gap-1.5 text-[12px] text-brand-blue-medium mb-4">
          <ArrowLeft size={14} /> Voltar às seções
        </button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-primary-foreground">{openSection.title}</h1>
            <p className="text-[12px] text-muted-foreground/50">/{openSection.slug} · acesso mínimo: {openSection.min_plan}</p>
          </div>
          <button onClick={() => setItemForm({ kind: 'video' })} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] bg-brand-blue text-primary-foreground">
            <Plus size={14} /> Novo item
          </button>
        </div>

        <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
          {sectionItems.length === 0 ? (
            <p className="p-6 text-center text-[12px] text-muted-foreground/50">Nenhum item ainda.</p>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-primary-foreground/[0.07]">
                {['Título', 'Tipo', 'Tópico', 'Ações'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {sectionItems.map(i => (
                  <tr key={i.id} className="border-b border-primary-foreground/[0.04]">
                    <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{i.title}</td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/60">
                      <span className="inline-flex items-center gap-1">
                        {i.kind === 'video' && <><Play size={11} /> Vídeo</>}
                        {i.kind === 'pdf' && <><FileText size={11} /> PDF</>}
                        {i.kind === 'image' && <><ImageIcon size={11} /> Imagem</>}
                        {i.kind === 'text' && <><TextIcon size={11} /> Texto</>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/60">{i.topic || '—'}</td>
                    <td className="px-5 py-3 flex gap-2">
                      <button onClick={() => setItemForm(i)} className="text-brand-blue-medium hover:opacity-80"><Pencil size={13} /></button>
                      <button onClick={() => deleteItem(i)} className="text-brand-red/70 hover:text-brand-red"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {itemForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setItemForm(null)}>
            <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-[540px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-primary-foreground">{itemForm.id ? 'Editar item' : 'Novo item'}</h3>
                <button onClick={() => setItemForm(null)} className="text-muted-foreground/40 hover:text-primary-foreground"><X size={16} /></button>
              </div>
              <Field label="Tipo">
                <select value={itemForm.kind || 'video'} onChange={e => setItemForm({ ...itemForm, kind: e.target.value as Item['kind'] })} className={inputCls}>
                  <option value="video">Vídeo</option>
                  <option value="pdf">PDF</option>
                  <option value="image">Imagem</option>
                  <option value="text">Texto</option>
                </select>
              </Field>
              <Field label="Título"><input value={itemForm.title || ''} onChange={e => setItemForm({ ...itemForm, title: e.target.value })} className={inputCls} /></Field>
              <Field label="Tópico (opcional — para agrupar por assunto)"><input value={itemForm.topic || ''} onChange={e => setItemForm({ ...itemForm, topic: e.target.value })} placeholder="Ex: Mineração de produtos" className={inputCls} /></Field>
              <Field label="Descrição"><textarea value={itemForm.description || ''} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} rows={2} className={inputCls + ' resize-none'} /></Field>

              {itemForm.kind === 'video' && (
                <Field label="URL do vídeo (YouTube, Vimeo, Loom)">
                  <input value={itemForm.video_url || ''} onChange={e => setItemForm({ ...itemForm, video_url: e.target.value })} placeholder="https://..." className={inputCls} />
                </Field>
              )}
              {itemForm.kind === 'pdf' && (
                <Field label="PDF">
                  <label className={`flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-primary-foreground/15 cursor-pointer text-[12px] ${uploading ? 'text-muted-foreground/50' : 'text-brand-green'}`}>
                    <Upload size={14} /> {itemForm.pdf_path ? 'Trocar PDF' : 'Subir PDF'}
                    <input type="file" accept="application/pdf" className="hidden" disabled={uploading}
                      onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; const p = await uploadPdf(f); if (p) setItemForm(prev => ({ ...prev, pdf_path: p })); }} />
                  </label>
                  {itemForm.pdf_path && <p className="text-[11px] text-muted-foreground/60 mt-1 truncate">{itemForm.pdf_path}</p>}
                </Field>
              )}
              <Field label="Imagem de Capa (Opcional)">
                <label className={`flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-primary-foreground/15 cursor-pointer text-[12px] ${uploading ? 'text-muted-foreground/50' : 'text-brand-amber'}`}>
                  <Upload size={14} /> {itemForm.image_url ? 'Trocar imagem' : 'Subir imagem'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading}
                    onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; const url = await uploadImage(f); if (url) setItemForm(prev => ({ ...prev, image_url: url })); }} />
                </label>
                {itemForm.image_url && (
                  <div className="relative mt-2 group">
                    <img src={itemForm.image_url} alt="" className="w-full h-32 object-cover rounded-md" />
                    <button 
                      onClick={() => setItemForm(prev => ({ ...prev, image_url: null }))}
                      className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white/60 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </Field>

              <Field label="Conteúdo Detalhado (Texto/HTML - Abre no Modal)">
                <textarea value={itemForm.body || ''} onChange={e => setItemForm({ ...itemForm, body: e.target.value })} rows={6} className={inputCls + ' resize-none'} placeholder="Este conteúdo aparecerá no modal quando o usuário clicar no item..." />
              </Field>

              <Field label="Link de exemplo (opcional — usado em Ofertas)"><input value={itemForm.example_url || ''} onChange={e => setItemForm({ ...itemForm, example_url: e.target.value })} placeholder="https://..." className={inputCls} /></Field>
              <Field label="Link de compra Stripe (opcional — botão Comprar)"><input value={itemForm.buy_url || ''} onChange={e => setItemForm({ ...itemForm, buy_url: e.target.value })} placeholder="https://buy.stripe.com/..." className={inputCls} /></Field>
              <Field label="Ordem"><input type="number" value={itemForm.sort_order ?? 0} onChange={e => setItemForm({ ...itemForm, sort_order: Number(e.target.value) })} className={inputCls} /></Field>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setItemForm(null)} className="px-4 py-2 text-sm text-muted-foreground/60">Cancelar</button>
                <button onClick={saveItem} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium">Salvar</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // === Section list ===
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-primary-foreground">Conteúdos</h1>
          <p className="text-[12px] text-muted-foreground/50">Gerencie Ofertas validadas, Criação de site, Edição de criativo e Aulas por assunto.</p>
        </div>
        <button onClick={() => setSectionForm({ sort_order: sections.length, min_plan: 'Elite' })} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] bg-brand-blue text-primary-foreground">
          <Plus size={14} /> Nova seção
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map(s => {
          const count = items.filter(i => i.section_slug === s.slug).length;
          return (
            <div key={s.id} className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-4">
              <button onClick={() => setOpenSection(s)} className="text-left w-full mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Folder size={15} className="text-brand-blue-medium" />
                  <h3 className="text-[13px] font-medium text-primary-foreground truncate">{s.title}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground/60 line-clamp-2">{s.description || '—'}</p>
                <p className="text-[10px] text-muted-foreground/40 mt-1">/{s.slug} · {s.min_plan} · {count} item(s)</p>
              </button>
              <div className="flex gap-2 pt-2 border-t border-primary-foreground/[0.05]">
                <button onClick={() => setSectionForm(s)} className="text-brand-blue-medium hover:opacity-80"><Pencil size={13} /></button>
                <button onClick={() => deleteSection(s)} className="text-brand-red/70 hover:text-brand-red"><Trash2 size={13} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {sectionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSectionForm(null)}>
          <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-[500px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-primary-foreground">{sectionForm.id ? 'Editar seção' : 'Nova seção'}</h3>
              <button onClick={() => setSectionForm(null)} className="text-muted-foreground/40 hover:text-primary-foreground"><X size={16} /></button>
            </div>
            <Field label="Slug (URL interna)"><input value={sectionForm.slug || ''} onChange={e => setSectionForm({ ...sectionForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="ex: ofertas" className={inputCls} disabled={!!sectionForm.id} /></Field>
            <Field label="Título"><input value={sectionForm.title || ''} onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })} className={inputCls} /></Field>
            <Field label="Descrição"><textarea value={sectionForm.description || ''} onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })} rows={2} className={inputCls + ' resize-none'} /></Field>
            <Field label="Intro (texto longo)"><textarea value={sectionForm.intro || ''} onChange={e => setSectionForm({ ...sectionForm, intro: e.target.value })} rows={3} className={inputCls + ' resize-none'} /></Field>
            <Field label="URL da capa (opcional)"><input value={sectionForm.cover_url || ''} onChange={e => setSectionForm({ ...sectionForm, cover_url: e.target.value })} placeholder="https://..." className={inputCls} /></Field>
            <Field label="Plano mínimo">
              <select value={sectionForm.min_plan || 'Elite'} onChange={e => setSectionForm({ ...sectionForm, min_plan: e.target.value as Section['min_plan'] })} className={inputCls}>
                <option value="Free">Free</option>
                <option value="Elite">Elite</option>
                <option value="Elite Plus">Elite Plus</option>
                <option value="Max">Max</option>
              </select>
            </Field>
            <Field label="Ordem"><input type="number" value={sectionForm.sort_order ?? 0} onChange={e => setSectionForm({ ...sectionForm, sort_order: Number(e.target.value) })} className={inputCls} /></Field>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setSectionForm(null)} className="px-4 py-2 text-sm text-muted-foreground/60">Cancelar</button>
              <button onClick={saveSection} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
