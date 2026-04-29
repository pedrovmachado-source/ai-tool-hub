import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity, RefreshCw, Filter } from 'lucide-react';

interface LogEntry {
  id: string;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const ENTITY_LABELS: Record<string, string> = {
  module: 'Módulo',
  lesson: 'Aula',
  lesson_pdf: 'PDF de aula',
  lesson_video: 'Vídeo',
  tool: 'Ferramenta',
  category: 'Categoria',
  profile: 'Usuário',
  plan: 'Plano',
  site_settings: 'Configuração',
  role: 'Permissão',
  user: 'Usuário',
};

const ACTION_LABELS: Record<string, { label: string; cls: string }> = {
  create: { label: 'Criou', cls: 'bg-brand-green/20 text-brand-green' },
  update: { label: 'Editou', cls: 'bg-brand-blue/20 text-brand-blue-medium' },
  delete: { label: 'Excluiu', cls: 'bg-brand-red/20 text-brand-red' },
  upload: { label: 'Enviou', cls: 'bg-brand-amber/20 text-brand-amber' },
  plan_change: { label: 'Plano alterado', cls: 'bg-brand-amber/20 text-brand-amber' },
  role_grant: { label: 'Permissão concedida', cls: 'bg-brand-blue/20 text-brand-blue-medium' },
  role_revoke: { label: 'Permissão removida', cls: 'bg-brand-red/20 text-brand-red' },
  settings_update: { label: 'Configuração', cls: 'bg-brand-blue/20 text-brand-blue-medium' },
};

export default function ActivityLogView() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    const query = (supabase as any).from('activity_logs').select('*').order('created_at', { ascending: false }).limit(200);
    const { data, error } = await query;
    if (!error && data) setLogs(data as LogEntry[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = entityFilter === 'all' ? logs : logs.filter(l => l.entity_type === entityFilter);
  const entityTypes = Array.from(new Set(logs.map(l => l.entity_type)));

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-primary-foreground flex items-center gap-2">
            <Activity size={18} /> Log de Atividades
          </h1>
          <p className="text-[12px] text-muted-foreground/50">Histórico de alterações administrativas (somente leitura, à prova de adulteração).</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <select
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value)}
              className="pl-7 pr-3 py-1.5 rounded-lg text-[12px] bg-navy border border-primary-foreground/10 text-primary-foreground focus:outline-none"
            >
              <option value="all">Todas as entidades</option>
              {entityTypes.map(t => (
                <option key={t} value={t}>{ENTITY_LABELS[t] || t}</option>
              ))}
            </select>
          </div>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] bg-brand-blue/20 text-brand-blue-medium hover:bg-brand-blue/30">
            <RefreshCw size={12} /> Atualizar
          </button>
        </div>
      </div>

      <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-[12px] text-muted-foreground/50">Carregando…</p>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-[12px] text-muted-foreground/50">Nenhuma atividade registrada.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-foreground/[0.07]">
                {['Quando', 'Autor', 'Ação', 'Entidade', 'Detalhes'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const act = ACTION_LABELS[l.action] || { label: l.action, cls: 'bg-primary-foreground/10 text-primary-foreground/80' };
                const meta = l.metadata && Object.keys(l.metadata).length > 0
                  ? Object.entries(l.metadata).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(', ')
                  : '';
                return (
                  <tr key={l.id} className="border-b border-primary-foreground/[0.04] hover:bg-primary-foreground/[0.02]">
                    <td className="px-5 py-3 text-[12px] text-muted-foreground/60 whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-primary-foreground/80">{l.actor_email || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${act.cls}`}>{act.label}</span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-primary-foreground/80">
                      <div className="font-medium">{ENTITY_LABELS[l.entity_type] || l.entity_type}</div>
                      {l.entity_label && <div className="text-[11px] text-muted-foreground/60 truncate max-w-[260px]">{l.entity_label}</div>}
                    </td>
                    <td className="px-5 py-3 text-[11px] text-muted-foreground/60 max-w-[320px] truncate" title={meta}>{meta || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
