import { useState, useEffect } from 'react';
import { type Tool, type Category } from '@/data/tools-data';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, LayoutDashboard, Users, CreditCard, FileText, Settings, LogOut, Search, Download, Plus, Pencil, Trash2, X, Check, Palette, Eye, EyeOff, Globe, Bell, Shield, Database, Mail, Play, Video } from 'lucide-react';

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
  { id: '1', name: 'Pro Vitalício', period: 'vitalicio', price: '14.90', active: true, highlight: true, checkoutUrl: 'https://buy.stripe.com/test_fZubJ3ackg00ddJgi55wI00', features: ['Tudo do plano gratuito', '24 e-books completos', '+200 prompts exclusivos', 'Guias passo a passo', 'Atualizações contínuas', 'Suporte prioritário'] },
];

// ── Modals ──────────────────────────────────────────────────────────

function ToolFormModal({ tool, onSave, onClose }: { tool?: Tool; onSave: (t: Tool) => void; onClose: () => void }) {
  const [form, setForm] = useState<Tool>(tool || { key: '', name: '', url: '', urlLabel: 'Acessar', badge: 'Grátis', desc: '', videos: [] });
  const [newVideo, setNewVideo] = useState({ title: '', url: '', desc: '' });
  const set = (k: keyof Tool, v: any) => setForm(p => ({ ...p, [k]: v }));

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-[520px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-primary-foreground">{tool ? 'Editar Ferramenta' : 'Nova Ferramenta'}</h3>
          <button onClick={onClose} className="text-muted-foreground/40 hover:text-primary-foreground"><X size={16} /></button>
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
            <input value={(form[f.key] as string) || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" />
          </div>
        ))}
        <div className="mb-3">
          <label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Descrição</label>
          <textarea value={form.desc} onChange={e => set('desc', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue resize-none" />
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

        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground/60 hover:text-primary-foreground">Cancelar</button>
          <button onClick={() => { if (form.name && form.key) onSave(form); }} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Salvar</button>
        </div>
      </div>
    </div>
  );
}

function CategoryFormModal({ category, onSave, onClose }: { category: Category; onSave: (c: Category) => void; onClose: () => void }) {
  const [form, setForm] = useState({ label: category.label, accent: category.accent, accentLight: category.accentLight, accentDark: category.accentDark, introTitle: category.introTitle, introText: category.introText });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-[380px]" onClick={e => e.stopPropagation()}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
  const { categories, updateCategory: updateCategoryDb, saveTool: saveToolDb, deleteTool: deleteToolDb } = useCategories();
  const [section, setSection] = useState('dashboard');
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
  const [proPrice, setProPrice] = useState('19.90');
  const [proAnnualPrice, setProAnnualPrice] = useState('178.80');
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
          name: v.name || 'Pro Vitalício',
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

  const proUsers = users.filter(u => u.plano === 'Pro').length;
  const totalTools = categories.reduce((sum, c) => sum + c.tools.length, 0);

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users', label: 'Usuários', icon: Users },
    { key: 'payments', label: 'Pagamentos', icon: CreditCard },
    { key: 'content', label: 'Conteúdo', icon: FileText },
    { key: 'settings', label: 'Configurações', icon: Settings },
  ];

  const togglePlan = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newPlano = user.plano === 'Pro' ? 'Free' : 'Pro';
    await supabase.from('profiles').update({ plano: newPlano }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plano: newPlano } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const exportCSV = () => {
    const csv = 'Nome,Sobrenome,Email,Plano,Criado em\n' + users.map(u => `${u.nome},${u.sobre},${u.email},${u.plano},${new Date(u.created_at).toLocaleDateString('pt-BR')}`).join('\n');
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
  };

  const handleSaveTool = async (tool: Tool, categoryKey: string, isNew: boolean) => {
    await saveToolDb(tool, categoryKey, isNew);
  };

  const handleDeleteTool = async (toolKey: string) => {
    await deleteToolDb(toolKey);
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

  return (
    <div className="min-h-screen flex" style={{ background: '#0F0F1A' }}>
      {/* Sidebar */}
      <div className="w-[220px] bg-navy flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-primary-foreground/[0.07]">
          <div className="text-[15px] font-medium text-primary-foreground">AdAI Admin</div>
          <div className="text-[11px] text-muted-foreground/40">Painel de administração</div>
        </div>
        <div className="py-3 flex-1">
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setSection(item.key); setViewingCategory(null); }} className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] transition-colors ${section === item.key ? 'text-brand-blue-medium bg-brand-blue/15' : 'text-muted-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/5'}`}>
              <item.icon size={15} /> {item.label}
            </button>
          ))}
        </div>
        <div className="px-3 pb-4 space-y-1">
          <button onClick={onBack} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-brand-blue-medium rounded-lg hover:bg-primary-foreground/5"><ArrowLeft size={15} /> Voltar ao site</button>
          <button onClick={onBack} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-brand-red/60 rounded-lg hover:bg-primary-foreground/5"><LogOut size={15} /> Sair</button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-8">
        {section === 'dashboard' && (
          <>
            <h1 className="text-xl font-medium text-primary-foreground mb-6">Dashboard</h1>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total de Usuários', value: users.length, change: '↑ +2 essa semana' },
                { label: 'Assinantes Pro', value: proUsers, change: '↑ +1 esse mês' },
                { label: 'Receita Mensal', value: `R$${(proUsers * 19.9).toFixed(0)}`, change: '↑ +R$19,90 vs mês anterior' },
                { label: 'Ferramentas', value: totalTools, change: `${categories.length} categorias` },
              ].map((s, i) => (
                <div key={i} className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-5">
                  <div className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-2">{s.label}</div>
                  <div className="text-[28px] font-medium text-primary-foreground">{s.value}</div>
                  <div className="text-xs text-brand-green mt-1">{s.change}</div>
                </div>
              ))}
            </div>
            <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-primary-foreground/[0.07]">
                <h3 className="text-sm font-medium text-primary-foreground">Usuários Recentes</h3>
                <button onClick={() => setSection('users')} className="text-xs text-brand-blue-medium hover:underline">Ver todos</button>
              </div>
              <table className="w-full">
                <thead><tr className="border-b border-primary-foreground/[0.07]">
                  {['Nome', 'E-mail', 'Plano', 'Acesso'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody>
                  {users.slice(0, 4).map(u => (
                    <tr key={u.id} className="border-b border-primary-foreground/[0.04] hover:bg-primary-foreground/[0.02]">
                      <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{u.nome} {u.sobre}</td>
                      <td className="px-5 py-3 text-[13px] text-muted-foreground/50">{u.email}</td>
                      <td className="px-5 py-3"><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${u.plano === 'Pro' ? 'bg-brand-green/20 text-brand-green' : u.plano === 'Cancelado' ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-amber/20 text-brand-amber'}`}>{u.plano}</span></td>
                      <td className="px-5 py-3 text-[13px] text-muted-foreground/50">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === 'users' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-medium text-primary-foreground">Usuários</h1>
              <div className="flex gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar..." className="pl-8 pr-4 py-2 rounded-lg text-sm bg-navy border border-primary-foreground/10 text-primary-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-brand-blue w-[260px]" />
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-brand-blue text-primary-foreground hover:opacity-90"><Download size={14} /> CSV</button>
              </div>
            </div>
            <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-primary-foreground/[0.07]">
                  {['Nome', 'Sobrenome', 'E-mail', 'Plano', 'Acesso', 'Ações'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-primary-foreground/[0.04] hover:bg-primary-foreground/[0.02]">
                      <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{u.nome}</td>
                      <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{u.sobre}</td>
                      <td className="px-5 py-3 text-[13px] text-muted-foreground/50">{u.email}</td>
                      <td className="px-5 py-3"><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${u.plano === 'Pro' ? 'bg-brand-green/20 text-brand-green' : u.plano === 'Cancelado' ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-amber/20 text-brand-amber'}`}>{u.plano}</span></td>
                      <td className="px-5 py-3 text-[13px] text-muted-foreground/50">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => togglePlan(u.id)} className="text-[11px] px-2 py-1 rounded bg-brand-blue/20 text-brand-blue-medium hover:bg-brand-blue/30">{u.plano === 'Pro' ? 'Rebaixar' : 'Upgrade'}</button>
                          <button onClick={() => deleteUser(u.id)} className="text-[11px] px-2 py-1 rounded bg-brand-red/20 text-brand-red hover:bg-brand-red/30">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === 'payments' && (
          <>
            <h1 className="text-xl font-medium text-primary-foreground mb-6">Pagamentos</h1>
            <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-primary-foreground/[0.07]">
                  {['Usuário', 'Plano', 'Valor', 'Data', 'Status'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
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
                      <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{p.user}</td>
                      <td className="px-5 py-3 text-[13px] text-muted-foreground/50">{p.plan}</td>
                      <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{p.value}</td>
                      <td className="px-5 py-3 text-[13px] text-muted-foreground/50">{p.date}</td>
                      <td className="px-5 py-3"><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${p.status === 'Pago' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-red/20 text-brand-red'}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === 'content' && !viewingCategory && (
          <>
            <h1 className="text-xl font-medium text-primary-foreground mb-6">Conteúdo</h1>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-5">
                <div className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-2">Ferramentas de IA</div>
                <div className="text-[28px] font-medium text-primary-foreground">{totalTools}</div>
              </div>
              <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-5">
                <div className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-2">Categorias</div>
                <div className="text-[28px] font-medium text-primary-foreground">{categories.length}</div>
              </div>
              <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-5">
                <div className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-2">E-books</div>
                <div className="text-[28px] font-medium text-primary-foreground">{totalTools}</div>
              </div>
            </div>

            <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-primary-foreground/[0.07]">
                <h3 className="text-sm font-medium text-primary-foreground">Ferramentas por Categoria</h3>
                <div className="flex gap-2">
                  <button onClick={() => {/* could add new category */}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-brand-green/20 text-brand-green hover:bg-brand-green/30">
                    <Plus size={12} /> Nova Categoria
                  </button>
                </div>
              </div>
              <table className="w-full">
                <thead><tr className="border-b border-primary-foreground/[0.07]">
                  {['Categoria', 'Ferramentas', 'Cor', 'Ações'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.key} className="border-b border-primary-foreground/[0.04] hover:bg-primary-foreground/[0.02]">
                      <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{c.label}</td>
                      <td className="px-5 py-3 text-[13px] text-muted-foreground/50">{c.tools.length} ferramentas</td>
                      <td className="px-5 py-3"><div className="w-4 h-4 rounded" style={{ background: c.accent }} /></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setViewingCategory(c)} className="text-[11px] px-2 py-1 rounded bg-brand-blue/20 text-brand-blue-medium hover:bg-brand-blue/30 flex items-center gap-1"><Eye size={11} /> Ver</button>
                          <button onClick={() => setEditingCategory(c)} className="text-[11px] px-2 py-1 rounded bg-brand-amber/20 text-brand-amber hover:bg-brand-amber/30 flex items-center gap-1"><Palette size={11} /> Editar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {section === 'settings' && (
          <>
            <h1 className="text-xl font-medium text-primary-foreground mb-6">Configurações</h1>
            <div className="flex gap-6">
              {/* Settings sidebar */}
              <div className="w-[200px] shrink-0 space-y-1">
                {settingsTabs.map(t => (
                  <button key={t.key} onClick={() => setSettingsSection(t.key)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors ${settingsSection === t.key ? 'text-brand-blue-medium bg-brand-blue/15' : 'text-muted-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/5'}`}>
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Settings content */}
              <div className="flex-1 max-w-lg">
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
                      <button onClick={() => saveSettings('plans')} className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2">{showSaved === 'plans' ? <><Check size={14} /> Salvo!</> : 'Salvar'}</button>
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
