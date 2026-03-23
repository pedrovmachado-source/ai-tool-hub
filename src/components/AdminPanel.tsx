import { useState } from 'react';
import { USERS_DB } from '@/data/tools-data';
import { CATEGORIES } from '@/data/tools-data';
import { ArrowLeft, LayoutDashboard, Users, CreditCard, FileText, Settings, LogOut, Search, Download } from 'lucide-react';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [section, setSection] = useState('dashboard');
  const [users, setUsers] = useState(USERS_DB);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u =>
    `${u.nome} ${u.sobre} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const proUsers = users.filter(u => u.plano === 'Pro').length;
  const totalTools = CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0);

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users', label: 'Usuários', icon: Users },
    { key: 'payments', label: 'Pagamentos', icon: CreditCard },
    { key: 'content', label: 'Conteúdo', icon: FileText },
    { key: 'settings', label: 'Configurações', icon: Settings },
  ];

  const togglePlan = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, plano: u.plano === 'Pro' ? 'Grátis' : 'Pro' } : u));
  };

  const deleteUser = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const exportCSV = () => {
    const csv = 'Nome,Sobrenome,Email,Plano,Último Acesso\n' + users.map(u => `${u.nome},${u.sobre},${u.email},${u.plano},${u.acesso}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios_adai.csv';
    a.click();
  };

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
            <button key={item.key} onClick={() => setSection(item.key)} className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] transition-colors ${section === item.key ? 'text-brand-blue-medium bg-brand-blue/15' : 'text-muted-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/5'}`}>
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
                { label: 'Total de Usuários', value: users.length, change: `↑ +2 essa semana` },
                { label: 'Assinantes Pro', value: proUsers, change: `↑ +1 esse mês` },
                { label: 'Receita Mensal', value: `R$${(proUsers * 19.9).toFixed(0)}`, change: '↑ +R$19,90 vs mês anterior' },
                { label: 'Ferramentas', value: totalTools, change: `${CATEGORIES.length} categorias` },
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
                      <td className="px-5 py-3 text-[13px] text-muted-foreground/50">{u.acesso}</td>
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
                      <td className="px-5 py-3 text-[13px] text-muted-foreground/50">{u.acesso}</td>
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

        {section === 'content' && (
          <>
            <h1 className="text-xl font-medium text-primary-foreground mb-6">Conteúdo</h1>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-5">
                <div className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-2">Ferramentas de IA</div>
                <div className="text-[28px] font-medium text-primary-foreground">{totalTools}</div>
              </div>
              <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-5">
                <div className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-2">Categorias</div>
                <div className="text-[28px] font-medium text-primary-foreground">{CATEGORIES.length}</div>
              </div>
              <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-5">
                <div className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-2">E-books</div>
                <div className="text-[28px] font-medium text-primary-foreground">24</div>
              </div>
            </div>
            <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-primary-foreground/[0.07]">
                <h3 className="text-sm font-medium text-primary-foreground">Ferramentas por Categoria</h3>
              </div>
              <table className="w-full">
                <thead><tr className="border-b border-primary-foreground/[0.07]">
                  {['Categoria', 'Ferramentas', 'Cor'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody>
                  {CATEGORIES.map(c => (
                    <tr key={c.key} className="border-b border-primary-foreground/[0.04]">
                      <td className="px-5 py-3 text-[13px] text-primary-foreground/80">{c.label}</td>
                      <td className="px-5 py-3 text-[13px] text-muted-foreground/50">{c.tools.length} ferramentas</td>
                      <td className="px-5 py-3"><div className="w-4 h-4 rounded" style={{ background: c.accent }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === 'settings' && (
          <>
            <h1 className="text-xl font-medium text-primary-foreground mb-6">Configurações</h1>
            <div className="bg-navy border border-primary-foreground/[0.07] rounded-xl p-6 max-w-md">
              <h3 className="text-sm font-medium text-primary-foreground mb-4">Credenciais de Acesso</h3>
              <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Usuário admin</label><input defaultValue="admin" className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" /></div>
              <div className="mb-4"><label className="text-[11px] font-medium text-muted-foreground/40 mb-1 block">Nova senha</label><input type="password" placeholder="Nova senha" className="w-full px-3 py-2 rounded-lg text-sm bg-primary-foreground/5 border border-primary-foreground/10 text-primary-foreground focus:outline-none focus:border-brand-blue" /></div>
              <button className="px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Salvar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
