import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Search, Pencil, Trash2, X, Check, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PurchasedAccount {
  id: string;
  user_id: string;
  account_type: string;
  credentials: any;
  status: string;
  created_at: string;
  user_email?: string;
}

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue';

export default function AdminPurchasedAccounts() {
  const [accounts, setAccounts] = useState<PurchasedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<PurchasedAccount | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // We'll join with profiles or auth.users if possible, or just fetch emails manually
      const { data: accs, error } = await supabase
        .from('purchased_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user emails for display
      const userIds = [...new Set((accs || []).map(a => a.user_id))];
      const { data: users } = await supabase.rpc('get_user_emails' as any, { user_ids: userIds });
      
      const userList = (users || []) as any[];
      const userMap = userList.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr.email;
        return acc;
      }, {});

      setAccounts((accs || []).map(a => ({
        ...a,
        user_email: userMap[a.user_id] || 'N/A'
      })));
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao carregar contas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const save = async () => {
    if (!editing) return;
    try {
      const { error } = await supabase
        .from('purchased_accounts')
        .update({
          account_type: editing.account_type,
          status: editing.status,
          credentials: editing.credentials
        })
        .eq('id', editing.id);

      if (error) throw error;
      toast({ title: 'Atualizado com sucesso' });
      setEditing(null);
      fetchAccounts();
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este registro?')) return;
    const { error } = await supabase.from('purchased_accounts').delete().eq('id', id);
    if (error) toast({ title: 'Erro ao excluir', variant: 'destructive' });
    else fetchAccounts();
  };

  const filtered = accounts.filter(a => 
    a.user_email?.toLowerCase().includes(search.toLowerCase()) || 
    a.account_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-primary-foreground">Contas Compradas</h1>
          <p className="text-[12px] text-muted-foreground/50">Gerencie os acessos liberados para os clientes.</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Buscar por email ou produto..." 
            className="pl-9 pr-4 py-2 rounded-lg text-sm bg-navy border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue w-[280px]" 
          />
        </div>
      </div>

      <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-10 text-center text-muted-foreground/40">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground/40">Nenhum registro encontrado.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-foreground/[0.07]">
                {['Data', 'Usuário', 'Produto', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-primary-foreground/[0.04] hover:bg-white/[0.01]">
                  <td className="px-5 py-3 text-[12px] text-muted-foreground/60">{new Date(a.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{a.user_email}</td>
                  <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{a.account_type}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.status === 'active' ? 'bg-brand-green/20 text-brand-green' : 'bg-white/5 text-white/40'}`}>
                      {a.status === 'active' ? 'Ativo' : a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => setEditing(a)} className="text-brand-blue-medium hover:opacity-80"><Pencil size={14} /></button>
                    <button onClick={() => remove(a.id)} className="text-brand-red/60 hover:text-brand-red"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditing(null)}>
          <div className="bg-navy border border-primary-foreground/10 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-primary-foreground">Editar Acesso</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground/40"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-muted-foreground/40 mb-1 block uppercase tracking-wider">Produto</label>
                <input value={editing.account_type} onChange={e => setEditing({...editing, account_type: e.target.value})} className={inputCls} />
              </div>
              
              <div>
                <label className="text-[11px] text-muted-foreground/40 mb-1 block uppercase tracking-wider">Status</label>
                <select value={editing.status} onChange={e => setEditing({...editing, status: e.target.value})} className={inputCls}>
                  <option value="active">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="disabled">Desativado</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground/40 mb-2 block uppercase tracking-wider">Dados de Acesso (JSON)</label>
                <div className="space-y-2">
                   {['login', 'password', 'two_factor', 'bm_link'].map(field => (
                     <div key={field}>
                        <label className="text-[10px] text-muted-foreground/60 ml-1">{field}</label>
                        <input 
                          value={editing.credentials?.[field] || ''} 
                          onChange={e => setEditing({
                            ...editing, 
                            credentials: { ...editing.credentials, [field]: e.target.value }
                          })} 
                          className={inputCls} 
                        />
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-muted-foreground/60">Cancelar</button>
              <button onClick={save} className="px-6 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
