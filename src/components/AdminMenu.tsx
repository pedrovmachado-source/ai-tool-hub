import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logActivity } from '@/lib/activity-log';

export interface NavMenuItem {
  key: string;
  label: string;
  icon: string;
  color: string;
  target: string;
  enabled: boolean;
  sort_order: number;
}

const ICON_OPTIONS = ['Sparkles', 'Globe2', 'Wand2', 'BookOpen', 'GraduationCap', 'Video', 'Shield', 'CreditCard', 'Star', 'Zap', 'Rocket', 'Users'];
const COLOR_OPTIONS = [
  { value: 'text-brand-amber', label: 'Âmbar' },
  { value: 'text-brand-blue-medium', label: 'Azul' },
  { value: 'text-brand-teal', label: 'Teal' },
  { value: 'text-brand-green', label: 'Verde' },
  { value: 'text-brand-red', label: 'Vermelho' },
];
const TARGET_OPTIONS = [
  { value: 'home', label: 'Início (Landing Page)' },
  { value: 'menu', label: 'Menu Principal' },
  { value: 'ferramentas', label: 'Ais' },
  { value: 'ofertas', label: 'Ofertas validadas' },
  { value: 'site-creation', label: 'Comprar Site' },
  { value: 'creative-edit', label: 'Comprar Criativo' },
  { value: 'fb-accounts', label: 'Contas de Facebook Ads' },
  { value: 'niche-lessons', label: 'Aulas por nicho' },
  { value: 'lessons', label: 'Aulas gravadas' },
  { value: 'alunos', label: 'Área do Mentorado' },
  { value: 'pro', label: 'Página Pro' },
  { value: 'profile', label: 'Perfil' },
  { value: 'copywrite', label: 'Copywrite' },
  { value: 'mentorias', label: 'Mentorias' },
];

export default function AdminMenu() {
  const [items, setItems] = useState<NavMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'nav_menu_items').maybeSingle();
        if (data?.value) setItems((data.value as any).sort((a: NavMenuItem, b: NavMenuItem) => a.sort_order - b.sort_order));
      } finally { setLoading(false); }
    })();
  }, []);

  const update = (i: number, patch: Partial<NavMenuItem>) =>
    setItems(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setItems(copy.map((it, idx) => ({ ...it, sort_order: idx + 1 })));
  };

  const add = () => setItems([...items, {
    key: `item-${Date.now()}`,
    label: 'Novo item',
    icon: 'Sparkles',
    color: 'text-brand-amber',
    target: 'offers',
    enabled: true,
    sort_order: items.length + 1,
  }]);

  const save = async () => {
    setSaving(true);
    const payload = items.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    const { error } = await supabase.from('site_settings').upsert(
      { key: 'nav_menu_items', value: payload as any },
      { onConflict: 'key' }
    );
    setSaving(false);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Menu salvo', description: 'As alterações já estão ativas.' });
    void logActivity({ action: 'settings_update', entity_type: 'site_settings', entity_id: 'nav_menu_items', entity_label: 'Menu lateral', metadata: { count: payload.length } });
  };

  if (loading) return <p className="text-muted-foreground text-sm">Carregando…</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-medium text-primary-foreground">Menu Lateral</h1>
        <div className="flex gap-2">
          <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-brand-green/20 text-brand-green hover:bg-brand-green/30">
            <Plus size={14} /> Adicionar
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-brand-blue/20 text-brand-blue-medium hover:bg-brand-blue/30 disabled:opacity-50">
            <Save size={14} /> {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl divide-y divide-primary-foreground/[0.07]">
        {items.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground/60">Nenhum item. Clique em "Adicionar".</p>
        )}
        {items.map((it, i) => (
          <div key={i} className="p-4 grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr_1fr_auto_auto] gap-2 items-center">
            <div className="flex gap-1">
              <button onClick={() => move(i, -1)} className="p-1 rounded bg-primary-foreground/5 hover:bg-primary-foreground/10 text-primary-foreground/60"><ArrowUp size={12} /></button>
              <button onClick={() => move(i, 1)} className="p-1 rounded bg-primary-foreground/5 hover:bg-primary-foreground/10 text-primary-foreground/60"><ArrowDown size={12} /></button>
            </div>
            <input value={it.label} onChange={e => update(i, { label: e.target.value })}
              placeholder="Rótulo" className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg px-3 py-2 text-[13px] text-primary-foreground" />
            <select value={it.target} onChange={e => update(i, { target: e.target.value })}
              className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg px-3 py-2 text-[13px] text-primary-foreground">
              {TARGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={it.icon} onChange={e => update(i, { icon: e.target.value })}
              className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg px-3 py-2 text-[13px] text-primary-foreground">
              {ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={it.color} onChange={e => update(i, { color: e.target.value })}
              className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg px-3 py-2 text-[13px] text-primary-foreground">
              {COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <label className="flex items-center gap-2 text-[12px] text-primary-foreground/70 cursor-pointer">
              <input type="checkbox" checked={it.enabled} onChange={e => update(i, { enabled: e.target.checked })} />
              Ativo
            </label>
            <button onClick={() => remove(i)} className="p-2 rounded bg-brand-red/20 text-brand-red hover:bg-brand-red/30">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
