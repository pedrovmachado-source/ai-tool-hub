import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Settings, History, ShieldCheck, Loader2, LogOut, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { planLabel, planBadgeClass } from '@/lib/plan';

type Tab = 'dados' | 'preferencias' | 'historico' | 'seguranca';

const TABS: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'dados', label: 'Dados pessoais', icon: User },
  { key: 'preferencias', label: 'Preferências', icon: Settings },
  { key: 'historico', label: 'Histórico', icon: History },
  { key: 'seguranca', label: 'Segurança', icon: ShieldCheck },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, savedEbooks, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('dados');

  const openEmbeddedPage = (page: string) => {
    sessionStorage.setItem('adai:initialPage', page);
    navigate('/ferramentas');
  };

  useEffect(() => {
    document.title = 'Perfil — AdAI';
    if (!user) navigate('/');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar
        onNavigate={(page) => {
          if (page === 'home') navigate('/');
          else if (page === 'profile') navigate('/perfil');
          else if (page === 'pro') navigate('/pro');
          else if (page === 'admin' || page === 'lessons') openEmbeddedPage(page);
        }}
        onOpenSavedEbook={(toolKey, categoryKey) => navigate(`/ferramentas?tool=${toolKey}&cat=${categoryKey}`)}
      />

      <div className="max-w-[1100px] w-full mx-auto px-6 py-10 flex-1">
        <header className="mb-8">
          <h1 className="font-serif-display text-3xl tracking-tight">Minha conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seus dados, preferências e segurança.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-4">
            <Card className="p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 bg-brand-blue text-primary-foreground">
                  <AvatarFallback className="bg-brand-blue text-primary-foreground font-semibold">
                    {user.nome?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{user.nome} {user.sobre}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
              </div>
              <span className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${planBadgeClass(user.plano)}`}>
                {planLabel(user.plano)}
              </span>
            </Card>

            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-brand-blue/10 text-brand-blue font-medium'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon size={16} /> {t.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Conteúdo */}
          <main>
            {tab === 'dados' && <TabDados />}
            {tab === 'preferencias' && <TabPreferencias />}
            {tab === 'historico' && <TabHistorico savedEbooks={savedEbooks} onOpen={(k, c) => navigate(`/ferramentas?tool=${k}&cat=${c}`)} />}
            {tab === 'seguranca' && <TabSeguranca onLogout={logout} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function TabDados() {
  const { user, updateUser } = useAuth();
  const [nome, setNome] = useState(user?.nome || '');
  const [sobre, setSobre] = useState(user?.sobre || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [empresa, setEmpresa] = useState(user?.empresa || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateUser({ nome, sobre, telefone, empresa });
      toast.success('Dados atualizados');
    } catch {
      toast.error('Falha ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-7 rounded-xl">
      <h2 className="font-serif-display text-xl mb-5">Dados pessoais</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="sobre">Sobrenome</Label>
          <Input id="sobre" value={sobre} onChange={(e) => setSobre(e.target.value)} className="mt-1.5" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" value={user?.email || ''} disabled className="mt-1.5 bg-secondary" />
        </div>
        <div>
          <Label htmlFor="tel">Telefone</Label>
          <Input id="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="emp">Empresa</Label>
          <Input id="emp" value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nome da empresa" className="mt-1.5" />
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={save} disabled={saving} className="bg-brand-blue hover:bg-brand-blue/90 text-primary-foreground gap-2">
          {saving && <Loader2 size={14} className="animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </Card>
  );
}

function TabPreferencias() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [notif, setNotif] = useState(() => localStorage.getItem('adai:notifications') !== 'off');

  const toggleDark = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle('dark', v);
    localStorage.setItem('adai:theme', v ? 'dark' : 'light');
  };
  const toggleNotif = (v: boolean) => {
    setNotif(v);
    localStorage.setItem('adai:notifications', v ? 'on' : 'off');
  };

  return (
    <Card className="p-7 rounded-xl">
      <h2 className="font-serif-display text-xl mb-5">Preferências</h2>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Tema escuro</div>
            <div className="text-xs text-muted-foreground">Use cores escuras para reduzir cansaço visual.</div>
          </div>
          <Switch checked={dark} onCheckedChange={toggleDark} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Notificações</div>
            <div className="text-xs text-muted-foreground">Receber alertas sobre novas ferramentas e e-books.</div>
          </div>
          <Switch checked={notif} onCheckedChange={toggleNotif} />
        </div>
      </div>
    </Card>
  );
}

function TabHistorico({
  savedEbooks,
  onOpen,
}: {
  savedEbooks: { toolKey: string; toolName: string; categoryKey: string; savedAt: string }[];
  onOpen: (toolKey: string, categoryKey: string) => void;
}) {
  return (
    <Card className="p-7 rounded-xl">
      <h2 className="font-serif-display text-xl mb-1">Histórico</h2>
      <p className="text-sm text-muted-foreground mb-5">E-books salvos recentemente.</p>
      {savedEbooks.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
          <Bookmark className="mx-auto mb-2 opacity-40" size={24} />
          Nenhum e-book salvo ainda.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {savedEbooks.map((e) => (
            <li key={e.toolKey} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{e.toolName}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(e.savedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => onOpen(e.toolKey, e.categoryKey)}>
                Abrir
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function TabSeguranca({ onLogout }: { onLogout: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const change = async () => {
    if (newPassword.length < 8) return toast.error('Senha deve ter no mínimo 8 caracteres.');
    if (newPassword !== confirm) return toast.error('As senhas não coincidem.');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Senha alterada com sucesso');
      setNewPassword(''); setConfirm('');
    }
  };

  const signOutAll = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) toast.error(error.message);
    else toast.success('Você saiu de todos os dispositivos');
  };

  return (
    <div className="space-y-5">
      <Card className="p-7 rounded-xl">
        <h2 className="font-serif-display text-xl mb-5">Trocar senha</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="np">Nova senha</Label>
            <Input id="np" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cp">Confirmar</Label>
            <Input id="cp" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a nova senha" className="mt-1.5" />
          </div>
        </div>
        <Button onClick={change} disabled={loading} className="mt-5 bg-brand-blue hover:bg-brand-blue/90 text-primary-foreground gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />} Alterar senha
        </Button>
      </Card>

      <Card className="p-7 rounded-xl border-destructive/30 bg-destructive/[0.03]">
        <h2 className="font-serif-display text-xl mb-1 text-destructive">Sessões</h2>
        <p className="text-sm text-muted-foreground mb-4">Encerre o acesso em todos os navegadores e dispositivos onde você fez login.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={signOutAll} className="gap-2">
            <ShieldCheck size={14} /> Sair de todos os dispositivos
          </Button>
          <Button variant="outline" onClick={onLogout} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10">
            <LogOut size={14} /> Sair desta sessão
          </Button>
        </div>
      </Card>
    </div>
  );
}
