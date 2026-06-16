import { useState, useEffect } from 'react';
import { type Tool, type Category } from '@/data/tools-data';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, LayoutDashboard, Users, CreditCard, FileText, Settings, LogOut, Search, Download, Plus, Pencil, Trash2, X, Check, Palette, Eye, EyeOff, Globe, Bell, Shield, Database, Mail, Play, Video, GraduationCap, Activity, Menu, Folder, Tag, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminOffers from './AdminOffers';
import AdminLessons from './AdminLessons';
import AdminContentSections from './AdminContentSections';
import AdminNicheLessons from './AdminNicheLessons';
import AdminSiteCreation from './AdminSiteCreation';
import AdminMenu from './AdminMenu';
import AdminStudentAreas from './AdminStudentAreas';
import AdminOfferAnalyses from './AdminOfferAnalyses';
import AdminPurchasedAccounts from './AdminPurchasedAccounts';
import AdminCashDeposits from './AdminCashDeposits';
import AdminUserOffers from './AdminUserOffers';
import ActivityLogView from './ActivityLogView';
import { logActivity } from '@/lib/activity-log';

// ── Plan type ───────────────────────────────────────────────────────
interface Plan {
  id: string;
  name: string;
  period: 'semanal' | 'mensal' | 'anual' | 'vitalicio';
  price: string;
  active: boolean;
  features: string[];
  highlight?: boolean;
  checkoutUrl?: string;
}

const DEFAULT_PLANS: Plan[] = [
  { id: '1', name: 'Elite Vitalício', period: 'vitalicio', price: '14.90', active: true, highlight: true, checkoutUrl: 'https://buy.stripe.com/eVqdRb2JS5lmflRc1P5wI01', features: ['Tudo do plano gratuito', '24 e-books completos', '+200 prompts exclusivos', 'Guias passo a passo', 'Atualizações contínuas', 'Suporte prioritário'] },
];

// ── Modals ──────────────────────────────────────────────────────────

function PromptsEditor({ title, prompts, onChange }: { title: string; prompts: { label: string; text: string }[]; onChange: (p: { label: string; text: string }[]) => void }) {
  const update = (i: number, field: 'label' | 'text', value: string) => {
    onChange(prompts.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };
  const remove = (i: number) => onChange(prompts.filter((_, idx) => idx !== i));
  const add = () => onChange([...prompts, { label: '', text: '' }]);

  return (
    <div className="mb-3 border-t border-primary-foreground/[0.07] pt-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-medium text-muted-foreground/40 block">{title}</label>
        <button type="button" onClick={add} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-brand-blue/20 text-brand-blue-medium hover:bg-brand-blue/30">
          <Plus size={10} /> Adicionar
        </button>
      </div>
      {prompts.length === 0 && (
        <p className="text-[11px] text-muted-foreground/40 italic py-2">Nenhum prompt. Clique em "Adicionar" para criar.</p>
      )}
      {prompts.map((p, i) => {
        const labelMissing = !p.label?.trim();
        const textMissing = !p.text?.trim();
        return (
          <div key={i} className="bg-primary-foreground/5 rounded-lg p-2.5 mb-2 border border-primary-foreground/10">
            <div className="flex items-start gap-2 mb-1.5">
              <span className="text-[10px] font-medium text-muted-foreground/40 mt-2">#{i + 1}</span>
              <input
                value={p.label || ''}
                onChange={e => update(i, 'label', e.target.value)}
                placeholder="Label (ex: 🟢 Iniciante — Criar copy)"
                className={`flex-1 px-2 py-1.5 rounded text-[12px] bg-primary-foreground/5 border text-primary-foreground focus:outline-none focus:border-brand-blue ${labelMissing ? 'border-brand-red/50' : 'border-primary-foreground/10'}`}
              />
              <button type="button" onClick={() => remove(i)} className="text-brand-red/60 hover:text-brand-red shrink-0 mt-1.5"><Trash2 size={12} /></button>
            </div>
            <textarea
              value={p.text || ''}
              onChange={e => update(i, 'text', e.target.value)}
              placeholder="Texto do prompt..."
              rows={3}
              className={`w-full px-2 py-1.5 rounded text-[12px] bg-primary-foreground/5 border text-primary-foreground focus:outline-none focus:border-brand-blue resize-none ${textMissing ? 'border-brand-red/50' : 'border-primary-foreground/10'}`}
            />
            {(labelMissing || textMissing) && (
              <p className="text-[10px] text-brand-red mt-1">⚠ Label e texto são obrigatórios.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ToolFormModal({ tool, onSave, onClose }: { tool?: Tool; onSave: (t: Tool) => void; onClose: () => void }) {
  const [form, setForm] = useState<Tool>(tool || { key: '', name: '', url: '', urlLabel: 'Acessar', badge: 'Grátis', desc: '', videos: [], prompts: [], promptsAdvanced: [] });
  const [newVideo, setNewVideo] = useState({ title: '', url: '', desc: '' });
  const set = (k: keyof Tool, v: any) => setForm(p => ({ ...p, [k]: v }));

  const validateAndSave = () => {
    if (!form.name || !form.key) return;
    const checkPrompts = (arr: any[] | undefined, label: string) => {
      if (!Array.isArray(arr)) return true;
      const bad = arr.findIndex((p: any) => !p?.label?.trim() || !p?.text?.trim());
      if (bad !== -1) {
        toast({ title: `${label}: prompt #${bad + 1} inválido`, description: 'Label e texto são obrigatórios.', variant: 'destructive' });
        return false;
      }
      return true;
    };
    if (!checkPrompts((form as any).prompts, 'Prompts básicos')) return;
    if (!checkPrompts((form as any).promptsAdvanced, 'Prompts avançados')) return;
    onSave(form);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    const reader = new FileReader();
    reader.onload = () => set('pdfDataUrl', reader.result as string);
    reader.readAsDataURL(file);
  };

  const addVideo = () => {
    if (newVideo.title && newVideo.url) {
      set('videos', [...(form.videos || []), { ...newVideo }]);
      setNewVideo({ title: '', url: '', desc: '' });
    }
  };

  const removeVideo = (idx: number) => {
    set('videos', (form.videos || []).filter((_: any, i: number) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-0" onClick={onClose}>
      <div className="glass-smooth border border-white/10 rounded-[2rem] p-8 w-[95vw] sm:w-[520px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-serif-display text-white">{tool ? 'Editar Ferramenta' : 'Nova Ferramenta'}</h3>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        {[
          { label: 'Nome', key: 'name' as const, placeholder: 'Ex: ChatGPT' },
          { label: 'Chave (slug)', key: 'key' as const, placeholder: 'Ex: chatgpt' },
          { label: 'URL', key: 'url' as const, placeholder: 'https://...' },
          { label: 'Label do botão', key: 'urlLabel' as const, placeholder: 'Acessar' },
          { label: 'Badge', key: 'badge' as const, placeholder: 'Grátis / Freemium / Pago' },
        ].map(f => (
          <div key={f.key} className="mb-3">
            <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">{f.label}</label>
            <input value={(form[f.key] as string) || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all" />
          </div>
        ))}
        <div className="mb-3">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Descrição</label>
          <textarea value={form.desc} onChange={e => set('desc', e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all resize-none" />
        </div>

        {/* PDF Upload */}
        <div className="mb-3 border-t border-primary-foreground/[0.07] pt-4 mt-4">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-2 block flex items-center gap-1.5"><FileText size={12} /> E-Book em PDF</label>
          {form.pdfDataUrl ? (
            <div className="flex items-center gap-2 bg-brand-green/10 rounded-lg p-3 mb-2">
              <FileText size={14} className="text-brand-green" />
              <span className="text-[12px] text-primary-foreground/80 flex-1">PDF carregado ✓</span>
              <button onClick={() => set('pdfDataUrl', undefined)} className="text-brand-red/60 hover:text-brand-red text-[11px]">Remover</button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px] bg-primary-foreground/5 border border-dashed border-primary-foreground/20 text-muted-foreground/60 cursor-pointer hover:border-brand-blue hover:text-brand-blue-medium transition-colors">
              <Plus size={14} /> Subir arquivo PDF
              <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Videos section */}
        <div className="mb-3 border-t border-primary-foreground/[0.07] pt-4 mt-4">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-2 block flex items-center gap-1.5"><Video size={12} /> Vídeos Tutoriais</label>
          {(form.videos || []).map((v: any, i: number) => (
            <div key={i} className="flex items-center gap-2 mb-2 bg-primary-foreground/5 rounded-lg p-2">
              <Play size={12} className="text-brand-blue-medium shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-primary-foreground/80 truncate">{v.title}</div>
                <div className="text-[10px] text-muted-foreground/40 truncate">{v.url}</div>
              </div>
              <button onClick={() => removeVideo(i)} className="text-brand-red/60 hover:text-brand-red shrink-0"><Trash2 size={12} /></button>
            </div>
          ))}
          <div className="space-y-2 mt-2">
            <input value={newVideo.title} onChange={e => setNewVideo(p => ({ ...p, title: e.target.value }))} placeholder="Título do vídeo" className="w-full px-3 py-1.5 rounded-lg text-[12px] bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" />
            <input value={newVideo.url} onChange={e => setNewVideo(p => ({ ...p, url: e.target.value }))} placeholder="URL (YouTube, Vimeo, Loom...)" className="w-full px-3 py-1.5 rounded-lg text-[12px] bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" />
            <input value={newVideo.desc} onChange={e => setNewVideo(p => ({ ...p, desc: e.target.value }))} placeholder="Descrição (opcional)" className="w-full px-3 py-1.5 rounded-lg text-[12px] bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" />
            <button onClick={addVideo} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-brand-green/20 text-brand-green hover:bg-brand-green/30">
              <Plus size={12} /> Adicionar vídeo
            </button>
          </div>
        </div>

        {/* Visual prompts editors */}
        <PromptsEditor
          title="📝 Prompts Básicos"
          prompts={((form as any).prompts) || []}
          onChange={(p) => set('prompts' as any, p)}
        />
        <PromptsEditor
          title="🚀 Prompts Avançados"
          prompts={((form as any).promptsAdvanced) || []}
          onChange={(p) => set('promptsAdvanced' as any, p)}
        />

        <div className="flex gap-4 justify-end mt-12">
          <button onClick={onClose} className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Cancelar</button>
          <button onClick={validateAndSave} className="px-8 py-2.5 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all">Salvar</button>
        </div>
      </div>
    </div>
  );
}

function CategoryFormModal({ category, onSave, onClose }: { category: Category; onSave: (c: Category) => void; onClose: () => void }) {
  const [form, setForm] = useState({ label: category.label, accent: category.accent, accentLight: category.accentLight, accentDark: category.accentDark, introTitle: category.introTitle, introText: category.introText });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-0" onClick={onClose}>
      <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-[95vw] sm:w-[480px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-primary-foreground">Editar Categoria</h3>
          <button onClick={onClose} className="text-muted-foreground/40 hover:text-primary-foreground"><X size={16} /></button>
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Nome da categoria</label>
          <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" />
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Título de introdução</label>
          <input value={form.introTitle} onChange={e => setForm(p => ({ ...p, introTitle: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" />
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Texto de introdução</label>
          <textarea value={form.introText} onChange={e => setForm(p => ({ ...p, introText: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue resize-none" />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: 'Cor principal', key: 'accent' as const },
            { label: 'Cor clara', key: 'accentLight' as const },
            { label: 'Cor escura', key: 'accentDark' as const },
          ].map(c => (
            <div key={c.key}>
              <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">{c.label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form[c.key]} onChange={e => setForm(p => ({ ...p, [c.key]: e.target.value }))} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                <input value={form[c.key]} onChange={e => setForm(p => ({ ...p, [c.key]: e.target.value }))} className="flex-1 px-2 py-1.5 rounded text-[11px] bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground/60 hover:text-primary-foreground">Cancelar</button>
          <button onClick={() => onSave({ ...category, ...form })} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Salvar</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-0" onClick={onCancel}>
      <div className="bg-navy border border-primary-foreground/10 rounded-xl p-5 sm:p-6 w-[95vw] sm:w-[380px]" onClick={e => e.stopPropagation()}>
        <p className="text-sm text-primary-foreground mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-muted-foreground/60 hover:text-primary-foreground">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-brand-red text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function PlanFormModal({ plan, onSave, onClose }: { plan?: Plan; onSave: (p: Plan) => void; onClose: () => void }) {
  const [form, setForm] = useState<Plan>(plan || { id: '', name: '', period: 'vitalicio', price: '', active: true, features: [], highlight: false, checkoutUrl: '' });
  const [newFeature, setNewFeature] = useState('');

  const addFeature = () => {
    if (newFeature.trim()) {
      setForm(p => ({ ...p, features: [...p.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-0" onClick={onClose}>
      <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-[95vw] sm:w-[480px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-primary-foreground">{plan ? 'Editar Plano' : 'Novo Plano'}</h3>
          <button onClick={onClose} className="text-muted-foreground/40 hover:text-primary-foreground"><X size={16} /></button>
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Nome do plano</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Pro Mensal" className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" />
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Período</label>
          <select value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value as Plan['period'] }))} className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue">
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
            <option value="vitalicio">Vitalício</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Preço (R$)</label>
          <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="14.90" className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" />
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Link de Checkout (Stripe)</label>
          <input value={form.checkoutUrl || ''} onChange={e => setForm(p => ({ ...p, checkoutUrl: e.target.value }))} placeholder="https://buy.stripe.com/..." className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" />
        </div>
        <div className="mb-3 flex gap-4">
          <label className="flex items-center gap-2 text-[12px] text-primary-foreground/70 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded" /> Ativo
          </label>
          <label className="flex items-center gap-2 text-[12px] text-primary-foreground/70 cursor-pointer">
            <input type="checkbox" checked={form.highlight || false} onChange={e => setForm(p => ({ ...p, highlight: e.target.checked }))} className="rounded" /> Destacar
          </label>
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Recursos incluídos</label>
          {form.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <Check size={12} className="text-brand-green shrink-0" />
              <span className="text-[12px] text-primary-foreground/70 flex-1">{f}</span>
              <button onClick={() => setForm(p => ({ ...p, features: p.features.filter((_, fi) => fi !== i) }))} className="text-brand-red/50 hover:text-brand-red"><X size={12} /></button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeature()} placeholder="Novo recurso..." className="flex-1 px-3 py-1.5 rounded-lg text-[12px] bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" />
            <button onClick={addFeature} className="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-brand-green/20 text-brand-green hover:bg-brand-green/30"><Plus size={12} /></button>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground/60 hover:text-primary-foreground">Cancelar</button>
          <button onClick={() => { if (form.name && form.price) onSave(form); }} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ── Category Tools Detail ───────────────────────────────────────────

function CategoryToolsView({ category, onBack, onSaveTool, onDeleteTool }: { category: Category; onBack: () => void; onSaveTool: (tool: Tool, categoryKey: string, isNew: boolean) => Promise<void>; onDeleteTool: (toolKey: string) => Promise<void> }) {
  const [tools, setTools] = useState<Tool[]>(category.tools);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSaveTool = async (t: Tool) => {
    const isNew = !editingTool;
    await onSaveTool(t, category.key, isNew);
    if (editingTool) {
      setTools(prev => prev.map(old => old.key === editingTool.key ? t : old));
    } else {
      setTools(prev => [...prev, t]);
    }
    setEditingTool(null);
    setIsAdding(false);
  };

  const handleDeleteTool = async (key: string) => {
    await onDeleteTool(key);
    setTools(prev => prev.filter(t => t.key !== key));
    setConfirmDelete(null);
  };

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-brand-blue-medium hover:underline mb-4"><ArrowLeft size={14} /> Voltar</button>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: category.accent }} />
          <h2 className="text-lg font-medium text-primary-foreground">{category.label}</h2>
          <span className="text-xs text-muted-foreground/40">{tools.length} ferramentas</span>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar ferramenta..." className="pl-8 pr-4 py-2 rounded-lg text-sm bg-navy border border-primary-foreground/10 text-primary-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-brand-blue w-[220px]" />
          </div>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-green/20 text-brand-green hover:bg-brand-green/30">
            <Plus size={14} /> Adicionar
          </button>
        </div>
      </div>
      <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-primary-foreground/[0.07]">
            {['Nome', 'Badge', 'URL', 'Ações'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.key} className="border-b border-primary-foreground/[0.04] hover:bg-primary-foreground/[0.02]">
                <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{t.name}</td>
                <td className="px-5 py-3"><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${t.badge === 'Grátis' ? 'bg-brand-green/20 text-brand-green' : t.badge === 'Pago' ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-amber/20 text-brand-amber'}`}>{t.badge}</span></td>
                <td className="px-5 py-3 text-[13px] text-muted-foreground/50 max-w-[200px] truncate">{t.url}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingTool(t)} className="text-[11px] px-2 py-1 rounded bg-brand-blue/20 text-brand-blue-medium hover:bg-brand-blue/30 flex items-center gap-1"><Pencil size={11} /> Editar</button>
                    <button onClick={() => setConfirmDelete(t.key)} className="text-[11px] px-2 py-1 rounded bg-brand-red/20 text-brand-red hover:bg-brand-red/30 flex items-center gap-1"><Trash2 size={11} /> Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editingTool || isAdding) && <ToolFormModal tool={editingTool || undefined} onSave={handleSaveTool} onClose={() => { setEditingTool(null); setIsAdding(false); }} />}
      {confirmDelete && <ConfirmModal message={`Excluir a ferramenta "${tools.find(t => t.key === confirmDelete)?.name}"?`} onConfirm={() => handleDeleteTool(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </>
  );
}

// ── Main Admin Panel ────────────────────────────────────────────────

interface DbUser {
  id: string;
  user_id: string;
  nome: string;
  sobre: string;
  email: string;
  plano: string;
  created_at: string;
}

export default function AdminPanel({ onBack, onCategoriesChanged }: { onBack: () => void; onCategoriesChanged: () => Promise<void> }) {
  useEffect(() => {
    document.title = 'Painel Administrativo | Convert Club';
  }, []);

  const { categories, updateCategory: updateCategoryDb, saveTool: saveToolDb, deleteTool: deleteToolDb } = useCategories();
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search));
  const initialSection = params.get('adminSection') || sessionStorage.getItem('adai:initialAdminSection') || 'dashboard';
  const [section, setSection] = useState(initialSection);
  
  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('adminSection', section);
    window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
    sessionStorage.removeItem('adai:initialAdminSection');
  }, [section]);
  const [unreadOrders, setUnreadOrders] = useState(0);
  const [siteCreationInitialTab, setSiteCreationInitialTab] = useState<'products' | 'orders'>('products');
  const goToOrders = () => {
    setSiteCreationInitialTab('orders');
    setSection('site-creation');
    setViewingCategory(null);
    setSidebarOpen(false);
  };

  // Poll unread orders count and subscribe to realtime
  useEffect(() => {
    const load = async () => {
      const { count } = await (supabase as any)
        .from('site_orders')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null);
      if (typeof count === 'number') setUnreadOrders(count);
    };
    void load();
    const interval = setInterval(load, 30000);
    const channel = (supabase as any)
      .channel('admin-site-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_orders' }, () => void load())
      .subscribe();
    return () => { clearInterval(interval); (supabase as any).removeChannel(channel); };
  }, []);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  // Fetch real users from profiles
  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setUsers(data.map((p: any) => ({ id: p.id, user_id: p.user_id, nome: p.nome, sobre: p.sobre, email: p.email, plano: p.plano, created_at: p.created_at })));
    });
  }, []);

  // Settings state
  const [settingsSection, setSettingsSection] = useState('credentials');
  const [siteName, setSiteName] = useState('AdAI');
  const [siteDesc, setSiteDesc] = useState('Diretório de Ferramentas de IA');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newUserNotif, setNewUserNotif] = useState(true);
  const [paymentNotif, setPaymentNotif] = useState(true);
  const [elitePrice, setElitePrice] = useState('19.90');
  const [eliteAnnualPrice, setEliteAnnualPrice] = useState('178.80');
  const [trialDays, setTrialDays] = useState('7');
  const [showSaved, setShowSaved] = useState('');
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [confirmDeletePlan, setConfirmDeletePlan] = useState<string | null>(null);

  // Load plans from DB
  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'pro_plan').maybeSingle().then(({ data }) => {
      if (data?.value) {
        const v = data.value as any;
        setPlans([{
          id: '1',
          name: v.name || 'Elite Vitalício',
          period: v.period || 'vitalicio',
          price: v.price || '14.90',
          active: true,
          highlight: true,
          checkoutUrl: v.checkoutUrl || '',
          features: v.features || [],
        }]);
      }
    });
  }, []);

  const filteredUsers = users.filter(u =>
    `${u.nome} ${u.sobre} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const eliteUsers = users.filter(u => u.plano === 'Elite').length;
  const elitePlusUsers = users.filter(u => u.plano === 'Elite Plus').length;
  const maxUsers = users.filter(u => u.plano === 'Max').length;
  const totalTools = categories.reduce((sum, c) => sum + c.tools.length, 0);

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users', label: 'Usuários', icon: Users },
    { key: 'payments', label: 'Pagamentos', icon: CreditCard },
    { key: 'content', label: 'Conteúdo', icon: FileText },
    { key: 'lessons', label: 'Aulas gravadas', icon: GraduationCap },
    { key: 'niche-lessons', label: 'Aulas por nicho', icon: Video },
    { key: 'site-creation', label: 'Comprar Site', icon: Folder },
    { key: 'sections', label: 'Conteúdos', icon: Folder },
    { key: 'menu', label: 'Menu Lateral', icon: Menu },
    { key: 'student-areas', label: 'Área do Mentorado', icon: GraduationCap },
    { key: 'purchased-accounts', label: 'Contas Compradas', icon: Shield },
    { key: 'cash-deposits', label: 'Depósitos de Saldo', icon: Wallet },
    { key: 'activity', label: 'Atividade', icon: Activity },
    { key: 'settings', label: 'Configurações', icon: Settings },
  ];

  const setUserPlan = async (userId: string, newPlano: 'Free' | 'Elite' | 'Elite Plus' | 'Max') => {
    const user = users.find(u => u.id === userId);
    if (!user || user.plano === newPlano) return;
    const { error } = await supabase.from('profiles').update({ plano: newPlano }).eq('id', userId);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plano: newPlano } : u));
    void logActivity({
      action: 'plan_change',
      entity_type: 'profile',
      entity_id: user.user_id,
      entity_label: `${user.nome} (${user.email})`,
      metadata: { from: user.plano, to: newPlano },
    });
    toast({ title: `Plano alterado para ${newPlano}` });
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const exportCSV = () => {
    const sanitizeCell = (v: string) => {
      const s = String(v ?? '');
      const dangerous = ['=', '+', '-', '@', '\t', '\r'];
      const safe = dangerous.some(c => s.startsWith(c)) ? `'${s}` : s;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const csv = 'Nome,Sobrenome,Email,Plano,Criado em\n' + users.map(u => [u.nome, u.sobre, u.email, u.plano, new Date(u.created_at).toLocaleDateString('pt-BR')].map(sanitizeCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios_adai.csv';
    a.click();
  };

  const handleUpdateCategory = async (updated: Category) => {
    await updateCategoryDb(updated);
    setViewingCategory(updated);
    void logActivity({ action: 'update', entity_type: 'category', entity_id: updated.key, entity_label: updated.label });
  };

  const handleSaveTool = async (tool: Tool, categoryKey: string, isNew: boolean) => {
    const prompts = (tool as any).prompts;
    if (Array.isArray(prompts)) {
      const invalid = prompts.findIndex(
        (p: any) => !p || typeof p.label !== 'string' || !p.label.trim() || typeof p.text !== 'string' || !p.text.trim()
      );
      if (invalid !== -1) {
        toast({
          title: 'Prompt inválido',
          description: `O prompt #${invalid + 1} está sem "label" ou "text". Ambos são obrigatórios.`,
          variant: 'destructive',
        });
        throw new Error('Invalid prompt: label and text are required');
      }
    }
    await saveToolDb(tool, categoryKey, isNew);
    void logActivity({
      action: isNew ? 'create' : 'update',
      entity_type: 'tool',
      entity_id: tool.key,
      entity_label: tool.name,
      metadata: { category: categoryKey },
    });
  };

  const handleDeleteTool = async (toolKey: string) => {
    await deleteToolDb(toolKey);
    void logActivity({ action: 'delete', entity_type: 'tool', entity_id: toolKey, entity_label: toolKey });
  };

  const saveSettings = (label: string) => {
    setShowSaved(label);
    setTimeout(() => setShowSaved(''), 2000);
  };

  const settingsTabs = [
    { key: 'credentials', label: 'Credenciais', icon: Shield },
    { key: 'general', label: 'Geral', icon: Globe },
    { key: 'notifications', label: 'Notificações', icon: Bell },
    { key: 'plans', label: 'Planos & Preços', icon: CreditCard },
    { key: 'seo', label: 'SEO & Meta', icon: Search },
    { key: 'data', label: 'Dados & Backup', icon: Database },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentSectionLabel = navItems.find(n => n.key === section)?.label || 'Admin';

  return (
    <div className="min-h-screen flex selection:bg-white/20 font-sans" style={{ background: '#000000' }}>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-black border-b border-white/5 h-12 flex items-center px-3 gap-2">
        <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg text-primary-foreground hover:bg-primary-foreground/10">
          <Menu size={20} />
        </button>
        <div className="text-[13px] font-medium text-primary-foreground truncate flex-1">AdAI Admin · {currentSectionLabel}</div>
        <button
          onClick={goToOrders}
          className="relative p-1.5 rounded-lg text-primary-foreground hover:bg-primary-foreground/10"
          aria-label="Novos pedidos"
        >
          <Bell size={18} />
          {unreadOrders > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full min-w-[16px] h-[16px] px-1 inline-flex items-center justify-center">{unreadOrders}</span>
          )}
        </button>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative top-0 left-0 z-50 w-[240px] lg:w-[220px] h-full lg:h-auto bg-black border-r border-white/5 flex flex-col shrink-0 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-5 py-6 border-b border-primary-foreground/[0.07] flex items-start justify-between gap-2">
          <div>
            <div className="text-lg font-serif-display tracking-tight text-white">Convert Club</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Dashboard Admin</div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToOrders}
              className="relative hidden lg:inline-flex p-1.5 rounded-lg text-muted-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
              aria-label="Novos pedidos"
              title={unreadOrders > 0 ? `${unreadOrders} novo(s) pedido(s)` : 'Sem novos pedidos'}
            >
              <Bell size={16} />
              {unreadOrders > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full min-w-[16px] h-[16px] px-1 inline-flex items-center justify-center">{unreadOrders}</span>
              )}
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-primary-foreground p-1">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="py-3 flex-1 overflow-y-auto">
          {navItems.map(item => (
            <button 
              key={item.key} 
              onClick={() => { setSection(item.key); setViewingCategory(null); setSidebarOpen(false); if (item.key === 'site-creation') setSiteCreationInitialTab('products'); }} 
              className={`w-full flex items-center gap-3 px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all ${section === item.key ? 'text-white bg-white/5 border-r-2 border-white' : 'text-white/30 hover:text-white hover:bg-white/[0.02]'}`}
            >
              <item.icon size={14} /> <span className="flex-1 text-left">{item.label}</span>
              {item.key === 'site-creation' && unreadOrders > 0 && (
                <span className="bg-white text-black text-[9px] font-bold rounded-full min-w-[18px] h-[18px] px-1.5 inline-flex items-center justify-center">{unreadOrders}</span>
              )}
            </button>
          ))}
        </div>
        <div className="px-3 pb-4 space-y-1">
          <button onClick={onBack} className="w-full flex items-center gap-2.5 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white/50 rounded-xl hover:bg-white/5 transition-colors"><ArrowLeft size={14} /> Voltar ao site</button>
          <button onClick={onBack} className="w-full flex items-center gap-2.5 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500/60 rounded-xl hover:bg-white/5 transition-colors"><LogOut size={14} /> Sair</button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 w-full min-w-0">
        {section === 'dashboard' && (
          <>
            <h1 className="text-xl sm:text-3xl font-serif-display tracking-tight text-white mb-6 sm:mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total de Usuários', value: users.length, change: `${eliteUsers + elitePlusUsers + maxUsers} pagantes` },
                { label: 'Assinantes Elite', value: eliteUsers, change: 'plano inicial' },
                { label: 'Assinantes Elite Plus', value: elitePlusUsers, change: 'plano intermediário' },
                { label: 'Assinantes Max', value: maxUsers, change: 'plano mentorados' },
                { label: 'Ferramentas', value: totalTools, change: `${categories.length} categorias` },
              ].map((s, i) => (
                <div key={i} className="glass-smooth border border-white/5 rounded-2xl p-5">
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3">{s.label}</div>
                  <div className="text-3xl font-serif-display text-white">{s.value}</div>
                  <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-2">{s.change}</div>
                </div>
              ))}
            </div>
            <div className="glass-smooth border border-white/5 rounded-[2rem] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <h3 className="text-lg font-serif-display text-white">Usuários Recentes</h3>
                <button onClick={() => setSection('users')} className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Ver todos</button>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-white/5">
                  {['Nome', 'E-mail', 'Plano', 'Acesso'].map(h => <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest">{h}</th>)}
                </tr></thead>
                <tbody>
                  {users.slice(0, 4).map(u => (
                    <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-[13px] text-white/80">{u.nome} {u.sobre}</td>
                      <td className="px-6 py-4 text-[13px] text-white/40">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${u.plano === 'Max' ? 'bg-white/10 text-white' : u.plano === 'Pro' ? 'bg-white/5 text-white/70' : u.plano === 'Cancelado' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/40'}`}>
                          {u.plano}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-white/40">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}

        {section === 'users' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h1 className="text-xl sm:text-3xl font-serif-display tracking-tight text-white">Usuários</h1>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Filtrar por nome ou e-mail..." className="pl-10 pr-4 py-2.5 rounded-xl text-[11px] font-medium bg-white/5 border border-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 w-full sm:w-[280px] transition-all" />
                </div>
                <button onClick={exportCSV} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 transition-all"><Download size={14} /> Exportar CSV</button>
              </div>
            </div>
            <div className="glass-smooth border border-white/5 rounded-[2rem] overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-white/5">
                  {['Nome', 'Sobrenome', 'E-mail', 'Plano', 'Acesso', 'Ações'].map(h => <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest whitespace-nowrap">{h}</th>)}
                </tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-[13px] text-white/80 whitespace-nowrap">{u.nome}</td>
                      <td className="px-6 py-4 text-[13px] text-white/80 whitespace-nowrap">{u.sobre}</td>
                      <td className="px-6 py-4 text-[13px] text-white/40 whitespace-nowrap">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${u.plano === 'Max' ? 'bg-purple-500/10 text-purple-500' : u.plano === 'Elite Plus' ? 'bg-blue-500/10 text-blue-500' : u.plano === 'Elite' ? 'bg-brand-amber/10 text-brand-amber' : u.plano === 'Cancelado' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/40'}`}>
                          {u.plano}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-white/40 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2 items-center">
                          <select
                            value={u.plano}
                            onChange={e => setUserPlan(u.id, e.target.value as any)}
                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/70 focus:outline-none focus:border-white/20 transition-all outline-none"
                          >
                            <option value="Free">Free</option>
                            <option value="Elite">Elite</option>
                            <option value="Elite Plus">Elite Plus</option>
                            <option value="Max">Max</option>
                          </select>
                          <button onClick={() => deleteUser(u.id)} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}

        {section === 'sections' && (
          <AdminContentSections />
        )}

        {section === 'payments' && (
          <>
            <h1 className="text-lg sm:text-xl font-medium text-primary-foreground mb-4 sm:mb-6">Pagamentos</h1>
            <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-primary-foreground/[0.07]">
                  {['Usuário', 'Plano', 'Valor', 'Data', 'Status'].map(h => <th key={h} className="px-3 sm:px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
                </tr></thead>
                <tbody>
                  {[
                    { user: 'Ana Souza', plan: 'Pro Mensal', value: 'R$19,90', date: 'Jan/2025', status: 'Pago' },
                    { user: 'Beatriz Lima', plan: 'Pro Mensal', value: 'R$19,90', date: 'Mar/2025', status: 'Pago' },
                    { user: 'Rafael Costa', plan: 'Pro Anual', value: 'R$178,80', date: 'Mar/2025', status: 'Pago' },
                    { user: 'Fernanda Dias', plan: 'Pro Mensal', value: 'R$19,90', date: 'Abr/2025', status: 'Pago' },
                    { user: 'Mariana Ferreira', plan: 'Pro Mensal', value: 'R$19,90', date: 'Dez/2024', status: 'Cancelado' },
                  ].map((p, i) => (
                    <tr key={i} className="border-b border-primary-foreground/[0.04]">
                      <td className="px-3 sm:px-5 py-3 text-[13px] text-primary-foreground/80 whitespace-nowrap">{p.user}</td>
                      <td className="px-3 sm:px-5 py-3 text-[13px] text-muted-foreground/50 whitespace-nowrap">{p.plan}</td>
                      <td className="px-3 sm:px-5 py-3 text-[13px] text-primary-foreground/80 whitespace-nowrap">{p.value}</td>
                      <td className="px-3 sm:px-5 py-3 text-[13px] text-muted-foreground/50 whitespace-nowrap">{p.date}</td>
                      <td className="px-3 sm:px-5 py-3"><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${p.status === 'Pago' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-red/20 text-brand-red'}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}

        {section === 'content' && !viewingCategory && (
          <>
            <h1 className="text-lg sm:text-xl font-medium text-primary-foreground mb-4 sm:mb-6">Conteúdo</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-4 sm:p-5">
                <div className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-2">Ferramentas de IA</div>
                <div className="text-2xl sm:text-[28px] font-medium text-primary-foreground">{totalTools}</div>
              </div>
              <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-4 sm:p-5">
                <div className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-2">Categorias</div>
                <div className="text-2xl sm:text-[28px] font-medium text-primary-foreground">{categories.length}</div>
              </div>
              <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-4 sm:p-5">
                <div className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-2">E-books</div>
                <div className="text-2xl sm:text-[28px] font-medium text-primary-foreground">{totalTools}</div>
              </div>
            </div>

            <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-primary-foreground/[0.07] gap-2 flex-wrap">
                <h3 className="text-sm font-medium text-primary-foreground">Ferramentas por Categoria</h3>
                <div className="flex gap-2">
                  <button onClick={() => {/* could add new category */}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-brand-green/20 text-brand-green hover:bg-brand-green/30 whitespace-nowrap">
                    <Plus size={12} /> Nova Categoria
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-primary-foreground/[0.07]">
                  {['Categoria', 'Ferramentas', 'Cor', 'Ações'].map(h => <th key={h} className="px-3 sm:px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
                </tr></thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.key} className="border-b border-primary-foreground/[0.04] hover:bg-primary-foreground/[0.02]">
                      <td className="px-3 sm:px-5 py-3 text-[13px] text-primary-foreground/80 whitespace-nowrap">{c.label}</td>
                      <td className="px-3 sm:px-5 py-3 text-[13px] text-muted-foreground/50 whitespace-nowrap">{c.tools.length} ferramentas</td>
                      <td className="px-3 sm:px-5 py-3"><div className="w-4 h-4 rounded" style={{ background: c.accent }} /></td>
                      <td className="px-3 sm:px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setViewingCategory(c)} className="text-[11px] px-2 py-1 rounded bg-brand-blue/20 text-brand-blue-medium hover:bg-brand-blue/30 flex items-center gap-1 whitespace-nowrap" aria-label={`Ver ferramentas da categoria ${c.label}`}><Eye size={11} /> Ver</button>
                          <button onClick={() => setEditingCategory(c)} className="text-[11px] px-2 py-1 rounded bg-brand-amber/20 text-brand-amber hover:bg-brand-amber/30 flex items-center gap-1 whitespace-nowrap" aria-label={`Editar categoria ${c.label}`}><Palette size={11} /> Editar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}

        {section === 'content' && viewingCategory && (
          <CategoryToolsView
            category={viewingCategory}
            onBack={() => setViewingCategory(null)}
            onSaveTool={handleSaveTool}
            onDeleteTool={handleDeleteTool}
          />
        )}

        {section === 'lessons' && <AdminLessons />}
        {section === 'sections' && <AdminContentSections />}
        {section === 'niche-lessons' && <AdminNicheLessons />}
        {section === 'site-creation' && <AdminSiteCreation initialTab={siteCreationInitialTab} />}
        {section === 'menu' && <AdminMenu />}
        {section === 'student-areas' && <AdminStudentAreas />}
        {section === 'purchased-accounts' && <AdminPurchasedAccounts />}
        {section === 'cash-deposits' && <AdminCashDeposits />}
        {section === 'offers' && <AdminOffers />}
        {section === 'offer-analyses' && <AdminOfferAnalyses />}
        {section === 'activity' && <ActivityLogView />}

        {section === 'settings' && (
          <>
            <h1 className="text-lg sm:text-xl font-medium text-primary-foreground mb-4 sm:mb-6">Configurações</h1>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Settings sidebar */}
              <div className="w-full lg:w-[200px] shrink-0 flex lg:block gap-1 overflow-x-auto scrollbar-hide lg:space-y-1 -mx-1 px-1 lg:mx-0 lg:px-0">
                {settingsTabs.map(t => (
                  <button key={t.key} onClick={() => setSettingsSection(t.key)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] sm:text-[13px] transition-colors whitespace-nowrap shrink-0 lg:w-full ${settingsSection === t.key ? 'text-brand-blue-medium bg-brand-blue/15' : 'text-muted-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/5'}`}>
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Settings content */}
              <div className="flex-1 lg:max-w-lg min-w-0">
                {settingsSection === 'credentials' && (
                  <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-6">
                    <h3 className="text-sm font-medium text-primary-foreground mb-4">Credenciais de Acesso</h3>
                    <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Usuário admin</label><input defaultValue="admin" className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" /></div>
                    <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Nova senha</label><input type="password" placeholder="Nova senha" className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" /></div>
                    <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Confirmar senha</label><input type="password" placeholder="Confirmar senha" className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" /></div>
                    <button onClick={() => saveSettings('credentials')} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2">{showSaved === 'credentials' ? <><Check size={14} /> Salvo!</> : 'Salvar'}</button>
                  </div>
                )}

                {settingsSection === 'general' && (
                  <div className="space-y-4">
                    <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-6">
                      <h3 className="text-sm font-medium text-primary-foreground mb-4">Informações do Site</h3>
                      <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Nome do site</label><input value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" /></div>
                      <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Descrição</label><textarea value={siteDesc} onChange={e => setSiteDesc(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue resize-none" /></div>
                      <button onClick={() => saveSettings('general')} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2">{showSaved === 'general' ? <><Check size={14} /> Salvo!</> : 'Salvar'}</button>
                    </div>
                    <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-6">
                      <h3 className="text-sm font-medium text-primary-foreground mb-4">Modo Manutenção</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[13px] text-primary-foreground/80">Ativar modo manutenção</p>
                          <p className="text-[11px] text-muted-foreground/40">Exibe uma página de manutenção para visitantes</p>
                        </div>
                        <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={`w-11 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-brand-blue' : 'bg-primary-foreground/10'}`}>
                          <div className={`w-4 h-4 rounded-full bg-primary-foreground absolute top-1 transition-all ${maintenanceMode ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSection === 'notifications' && (
                  <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-6">
                    <h3 className="text-sm font-medium text-primary-foreground mb-4">Notificações</h3>
                    {[
                      { label: 'Notificações por e-mail', desc: 'Receber resumos e alertas por e-mail', value: emailNotifications, set: setEmailNotifications },
                      { label: 'Novo usuário cadastrado', desc: 'Notificar quando um novo usuário se cadastrar', value: newUserNotif, set: setNewUserNotif },
                      { label: 'Novo pagamento', desc: 'Notificar quando um pagamento for realizado', value: paymentNotif, set: setPaymentNotif },
                    ].map((n, i) => (
                      <div key={i} className={`flex items-center justify-between ${i > 0 ? 'mt-4 pt-4 border-t border-primary-foreground/[0.05]' : ''}`}>
                        <div>
                          <p className="text-[13px] text-primary-foreground/80">{n.label}</p>
                          <p className="text-[11px] text-muted-foreground/40">{n.desc}</p>
                        </div>
                        <button onClick={() => n.set(!n.value)} className={`w-11 h-6 rounded-full transition-colors relative ${n.value ? 'bg-brand-blue' : 'bg-primary-foreground/10'}`}>
                          <div className={`w-4 h-4 rounded-full bg-primary-foreground absolute top-1 transition-all ${n.value ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => saveSettings('notifications')} className="mt-6 px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2">{showSaved === 'notifications' ? <><Check size={14} /> Salvo!</> : 'Salvar'}</button>
                  </div>
                )}

                {settingsSection === 'plans' && (
                  <div className="space-y-4">
                    <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-primary-foreground">Planos & Preços</h3>
                        <button onClick={() => setIsAddingPlan(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-brand-green/20 text-brand-green hover:bg-brand-green/30">
                          <Plus size={12} /> Novo Plano
                        </button>
                      </div>

                      <div className="space-y-3">
                        {plans.map(plan => (
                          <div key={plan.id} className={`border rounded-xl p-4 ${plan.active ? 'border-brand-blue/30 bg-brand-blue/5' : 'border-primary-foreground/[0.07]'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[13px] font-medium text-primary-foreground">{plan.name}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${plan.active ? 'bg-brand-green/20 text-brand-green' : 'bg-muted-foreground/10 text-muted-foreground/50'}`}>{plan.active ? 'Ativo' : 'Inativo'}</span>
                                {plan.highlight && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-amber/20 text-brand-amber font-medium">Destaque</span>}
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-foreground/5 text-muted-foreground/50 capitalize">{plan.period === 'vitalicio' ? 'Vitalício' : plan.period}</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setEditingPlan(plan)} className="text-[11px] px-2 py-1 rounded bg-brand-blue/20 text-brand-blue-medium hover:bg-brand-blue/30 flex items-center gap-1"><Pencil size={11} /> Editar</button>
                                <button onClick={() => setPlans(ps => ps.map(p => p.id === plan.id ? { ...p, active: !p.active } : p))} className="text-[11px] px-2 py-1 rounded bg-brand-amber/20 text-brand-amber hover:bg-brand-amber/30 flex items-center gap-1">
                                  {plan.active ? <><EyeOff size={11} /> Desativar</> : <><Eye size={11} /> Ativar</>}
                                </button>
                                <button onClick={() => setConfirmDeletePlan(plan.id)} className="text-[11px] px-2 py-1 rounded bg-brand-red/20 text-brand-red hover:bg-brand-red/30 flex items-center gap-1"><Trash2 size={11} /></button>
                              </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-bold text-primary-foreground">R${plan.price}</span>
                              <span className="text-[11px] text-muted-foreground/40">/{plan.period === 'vitalicio' ? 'único' : plan.period === 'anual' ? 'ano' : plan.period === 'semanal' ? 'semana' : 'mês'}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {plan.features.map((f, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-foreground/5 text-muted-foreground/50">{f}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-6">
                      <h3 className="text-sm font-medium text-primary-foreground mb-4">Configurações Gerais</h3>
                      <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Dias de teste grátis</label><input value={trialDays} onChange={e => setTrialDays(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" /></div>
                      <button onClick={async () => {
                        const activePlan = plans.find(pl => pl.highlight) || plans.find(pl => pl.active) || plans[0];
                        if (activePlan) {
                          await supabase.from('site_settings').upsert({
                            key: 'pro_plan',
                            value: { name: activePlan.name, price: activePlan.price, period: activePlan.period, checkoutUrl: activePlan.checkoutUrl || '', features: activePlan.features },
                            updated_at: new Date().toISOString(),
                          }, { onConflict: 'key' });
                        }
                        saveSettings('plans');
                      }} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2">{showSaved === 'plans' ? <><Check size={14} /> Salvo!</> : 'Salvar'}</button>
                    </div>

                    {/* Plan form modal */}
                    {(editingPlan || isAddingPlan) && (
                      <PlanFormModal
                        plan={editingPlan || undefined}
                        onSave={async (p) => {
                          const updatedPlans = editingPlan
                            ? plans.map(old => old.id === editingPlan.id ? p : old)
                            : [...plans, { ...p, id: Date.now().toString() }];
                          setPlans(updatedPlans);
                          // Persist the highlighted/active plan to DB
                          const activePlan = updatedPlans.find(pl => pl.highlight) || updatedPlans.find(pl => pl.active) || updatedPlans[0];
                          if (activePlan) {
                            await supabase.from('site_settings').upsert({
                              key: 'pro_plan',
                              value: { name: activePlan.name, price: activePlan.price, period: activePlan.period, checkoutUrl: activePlan.checkoutUrl || '', features: activePlan.features },
                              updated_at: new Date().toISOString(),
                            }, { onConflict: 'key' });
                          }
                          setEditingPlan(null);
                          setIsAddingPlan(false);
                          saveSettings('plans');
                        }}
                        onClose={() => { setEditingPlan(null); setIsAddingPlan(false); }}
                      />
                    )}

                    {confirmDeletePlan && (
                      <ConfirmModal
                        message={`Excluir o plano "${plans.find(p => p.id === confirmDeletePlan)?.name}"?`}
                        onConfirm={() => { setPlans(ps => ps.filter(p => p.id !== confirmDeletePlan)); setConfirmDeletePlan(null); }}
                        onCancel={() => setConfirmDeletePlan(null)}
                      />
                    )}
                  </div>
                )}

                {settingsSection === 'seo' && (
                  <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-6">
                    <h3 className="text-sm font-medium text-primary-foreground mb-4">SEO & Meta Tags</h3>
                    <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Meta título</label><input defaultValue="AdAI — Diretório de Ferramentas de IA" className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" /></div>
                    <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Meta descrição</label><textarea defaultValue="Descubra as melhores ferramentas de IA para texto, imagem, vídeo, produtividade e mais." rows={3} className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue resize-none" /></div>
                    <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Palavras-chave</label><input defaultValue="ferramentas ia, inteligência artificial, chatgpt, midjourney" className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" /></div>
                    <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">URL canônica</label><input defaultValue="https://adai.com.br" className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" /></div>
                    <button onClick={() => saveSettings('seo')} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2">{showSaved === 'seo' ? <><Check size={14} /> Salvo!</> : 'Salvar'}</button>
                  </div>
                )}

                {settingsSection === 'data' && (
                  <div className="space-y-4">
                    <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-6">
                      <h3 className="text-sm font-medium text-primary-foreground mb-4">Exportar Dados</h3>
                      <p className="text-[12px] text-muted-foreground/50 mb-4">Exporte todos os dados do sistema para backup.</p>
                      <div className="flex gap-3">
                        <button onClick={exportCSV} className="px-4 py-2 bg-brand-blue/20 text-brand-blue-medium rounded-lg text-sm font-medium hover:bg-brand-blue/30 flex items-center gap-2"><Download size={14} /> Exportar Usuários (CSV)</button>
                        <button className="px-4 py-2 bg-brand-green/20 text-brand-green rounded-lg text-sm font-medium hover:bg-brand-green/30 flex items-center gap-2"><Download size={14} /> Exportar Ferramentas (JSON)</button>
                      </div>
                    </div>
                    <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-6">
                      <h3 className="text-sm font-medium text-primary-foreground mb-2">Zona de Perigo</h3>
                      <p className="text-[12px] text-muted-foreground/50 mb-4">Ações irreversíveis. Tenha cuidado.</p>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 bg-brand-red/20 text-brand-red rounded-lg text-sm font-medium hover:bg-brand-red/30">Limpar cache</button>
                        <button className="px-4 py-2 bg-brand-red/20 text-brand-red rounded-lg text-sm font-medium hover:bg-brand-red/30">Resetar configurações</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Category edit modal */}
      {editingCategory && (
        <CategoryFormModal
          category={editingCategory}
          onSave={(c) => { handleUpdateCategory(c); setEditingCategory(null); }}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
}
