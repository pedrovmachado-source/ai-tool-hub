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
import { User, Settings, History, ShieldCheck, Loader2, LogOut, Bookmark, Ticket, Eye, EyeOff, Copy, Check, CreditCard, Camera, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { planLabel, planBadgeClass } from '@/lib/plan';

type Tab = 'dados' | 'preferencias' | 'historico' | 'seguranca' | 'convites' | 'planos';

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'dados', label: 'Dados pessoais', icon: User },
  { key: 'convites', label: 'Meus Convites', icon: Ticket },
  { key: 'planos', label: 'Planos', icon: CreditCard },
  { key: 'preferencias', label: 'Preferências', icon: Settings },
  { key: 'historico', label: 'Histórico', icon: History },
  { key: 'seguranca', label: 'Segurança', icon: ShieldCheck },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, savedEbooks, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('dados');

  const handleNavigate = (page: string) => {
    if (page === 'home') navigate('/');
    else if (page === 'profile') navigate('/perfil');
    else if (page === 'alunos') navigate('/alunos');
    else if (page === 'mentorias') navigate('/mentorias');
    else {
      sessionStorage.setItem('adai:initialPage', page);
      navigate('/ferramentas');
    }
  };

  useEffect(() => {
    document.title = 'Perfil — AdAI';
    if (!user) {
      navigate('/');
      return;
    }
    if (user.abuseBlocked) {
      navigate('/bloqueado');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar
        onNavigate={handleNavigate}
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
                <Avatar className="h-12 w-12 bg-brand-blue text-primary-foreground border-2 border-brand-blue/20">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.nome} className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-brand-blue text-primary-foreground font-semibold">
                      {user.nome?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{user.nome} {user.sobrenome}</div>
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
            {tab === 'convites' && <TabConvites />}
            {tab === 'planos' && <TabPlanos />}
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
  const [sobrenome, setSobrenome] = useState(user?.sobrenome || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [empresa, setEmpresa] = useState(user?.empresa || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      await updateUser({ avatarUrl: publicUrl });
      toast.success('Foto de perfil atualizada!');
    } catch (error: any) {
      toast.error('Erro ao fazer upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateUser({ nome, sobrenome, telefone, empresa });
      toast.success('Dados atualizados');
    } catch {
      toast.error('Falha ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-7 rounded-xl">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <AvatarFallback className="bg-brand-blue text-white text-3xl font-bold">
                {nome?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
          </Avatar>
          <label className="absolute bottom-0 right-0 bg-brand-blue hover:bg-brand-blue/90 text-white p-2.5 rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110">
            <Camera size={18} />
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
          </label>
        </div>
        <div className="flex-1">
          <h2 className="font-serif-display text-2xl mb-1">Dados pessoais</h2>
          <p className="text-sm text-muted-foreground mb-4">Atualize suas informações de contato e foto de perfil.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="sobrenome">Sobrenome</Label>
          <Input id="sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} className="mt-1.5" />
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
  const [notif, setNotif] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return localStorage.getItem('adai:notifications') !== 'off';
  });

  const toggleNotif = async (v: boolean) => {
    if (v) {
      if (!('Notification' in window)) {
        toast.error('Seu navegador não suporta notificações.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotif(true);
        localStorage.setItem('adai:notifications', 'on');
        toast.success('Notificações ativadas!');
        new Notification('Convert Club', {
          body: 'Você agora receberá alertas sobre novos conteúdos.',
          icon: '/favicon.ico'
        });
      } else {
        toast.error('Você precisa permitir notificações no seu navegador.');
      }
    } else {
      setNotif(false);
      localStorage.setItem('adai:notifications', 'off');
    }
  };

  return (
    <Card className="p-7 rounded-xl">
      <h2 className="font-serif-display text-xl mb-5">Preferências</h2>
      <div className="space-y-5">
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
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const change = async () => {
    // Check if user has a password provider
    const { data: { user: supaUser } } = await supabase.auth.getUser();
    const hasPassword = supaUser?.app_metadata?.provider === 'email' || 
                       supaUser?.identities?.some(id => id.provider === 'email');

    if (!hasPassword) {
      return toast.error('Sua conta está vinculada ao Google. Não é possível alterar a senha por aqui.');
    }

    if (!oldPassword) return toast.error('Digite sua senha atual.');
    if (newPassword.length < 8) return toast.error('Nova senha deve ter no mínimo 8 caracteres.');
    if (newPassword !== confirm) return toast.error('As novas senhas não coincidem.');
    
    setLoading(true);
    
    try {
      // First verify old password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: oldPassword
      });

      if (signInError) {
        throw new Error('Senha atual incorreta.');
      }

      // Then update password
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      
      if (updateError) throw updateError;

      toast.success('Senha alterada com sucesso');
      setOldPassword('');
      setNewPassword(''); 
      setConfirm('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
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
        <div className="space-y-4">
          <div>
            <Label htmlFor="op">Senha atual</Label>
            <Input id="op" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Sua senha atual" className="mt-1.5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="np">Nova senha</Label>
              <Input id="np" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cp">Confirmar nova senha</Label>
              <Input id="cp" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a nova senha" className="mt-1.5" />
            </div>
          </div>
        </div>
        <Button onClick={change} disabled={loading} className="mt-6 bg-brand-blue hover:bg-brand-blue/90 text-primary-foreground gap-2">
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

function TabConvites() {
  const { user, isAdmin } = useAuth();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [visibleCodes, setVisibleCodes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInvites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      toast.error('Não foi possível carregar seus convites.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateInvite = async (inviteId: string) => {
    if (!isAdmin) return;
    setRegenerating(inviteId);
    try {
      const { data, error } = await supabase.rpc('regenerate_invite_code', {
        target_invite_id: inviteId
      });

      if (error) throw error;
      
      const result = data as { success: boolean; message: string };
      if (result.success) {
        toast.success(result.message);
        fetchInvites();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error('Erro ao substituir convite: ' + error.message);
    } finally {
      setRegenerating(null);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [user]);

  const toggleVisibility = (id: string) => {
    setVisibleCodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Código copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const initializeInvites = async () => {
    setInitializing(true);
    try {
      const { data, error } = await supabase.rpc('initialize_admin_invites');
      if (error) throw error;
      
      const result = data as { success: boolean; message: string };
      if (result.success) {
        toast.success(result.message);
        fetchInvites();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao inicializar convites:', error);
      toast.error('Erro ao inicializar convites.');
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-7 rounded-xl flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </Card>
    );
  }

  const allUsed = invites.length > 0 && invites.every(i => i.is_used);

  return (
    <div className="space-y-6">
      <Card className="p-7 rounded-xl">
        <header className="mb-6">
          <h2 className="font-serif-display text-xl">Meus Convites</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin 
              ? "Como administrador, você pode substituir convites existentes por novos códigos."
              : "Você tem direito a 3 convites. Use-os com sabedoria para trazer novos membros para o Convert Club."}
          </p>
        </header>

        {invites.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg space-y-4">
            <Ticket className="mx-auto opacity-20 w-12 h-12" />
            <p className="text-sm text-muted-foreground">Você ainda não possui convites gerados.</p>
            {isAdmin && (
              <Button onClick={initializeInvites} disabled={initializing} className="bg-brand-blue hover:bg-brand-blue/90">
                {initializing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Inicializar Meus Convites
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {invites.map((invite) => (
              <div 
                key={invite.id} 
                className={`relative overflow-hidden p-5 rounded-xl border transition-all ${
                  invite.is_used ? 'bg-secondary/30 border-border opacity-70' : 'bg-brand-blue/[0.03] border-brand-blue/20'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    invite.is_used ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
                  }`}>
                    {invite.is_used ? 'Utilizado' : 'Disponível'}
                  </span>
                  {!invite.is_used && (
                    <button 
                      onClick={() => toggleVisibility(invite.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {visibleCodes[invite.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>

                <div className="relative group">
                  <div className={`text-2xl font-mono font-bold text-center tracking-widest transition-all duration-300 ${
                    !invite.is_used && !visibleCodes[invite.id] ? 'blur-md select-none' : ''
                  }`}>
                    {invite.code}
                  </div>
                  
                  {!invite.is_used && (
                    <button 
                      onClick={() => copyToClipboard(invite.code, invite.id)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedId === invite.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button 
                      onClick={() => handleRegenerateInvite(invite.id)}
                      disabled={regenerating === invite.id}
                      variant="ghost" 
                      size="sm"
                      className="w-full text-[10px] h-8 gap-2 hover:bg-brand-blue/10 hover:text-brand-blue"
                    >
                      {regenerating === invite.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <History size={12} />
                      )}
                      Substituir código
                    </Button>
                  </div>
                )}

                {invite.is_used && (
                  <div className="mt-2 text-[10px] text-muted-foreground space-y-1">
                    <p>Utilizado em: {new Date(invite.used_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {allUsed && !isAdmin && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 text-sm flex gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <p>Você já utilizou todos os seus convites disponíveis. Não é possível gerar novos códigos.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function TabPlanos() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Elite',
      description: 'Acesso às ferramentas essenciais do Convert Club.',
      badge: 'bg-gradient-to-r from-brand-amber to-brand-amber/80 text-white',
      link: '/pro',
      cta: 'Ver detalhes'
    },
    {
      name: 'Elite Plus',
      description: 'Ferramentas avançadas e limites ampliados.',
      badge: 'bg-gradient-to-r from-brand-blue to-brand-teal text-white',
      link: '/pro',
      cta: 'Ver detalhes'
    },
    {
      name: 'Max',
      description: 'Cargo exclusivo para mentorados. Acompanhamento direto e estratégico.',
      badge: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
      link: 'https://kayosa.com.br',
      cta: 'Conhecer Mentoria',
      external: true
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-7 rounded-xl">
        <h2 className="font-serif-display text-xl mb-1">Categorias de Planos</h2>
        <p className="text-sm text-muted-foreground mb-6">Conheça os níveis de acesso disponíveis no Convert Club.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className="flex flex-col border border-border rounded-xl p-5 hover:border-brand-blue/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badge}`}>
                  PLANO
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-6 flex-1">{p.description}</p>
              
              {p.external ? (
                <a 
                  href={p.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
                >
                  {p.cta} <ExternalLink size={14} />
                </a>
              ) : (
                <Button 
                  onClick={() => navigate(p.link)} 
                  variant="secondary" 
                  size="sm" 
                  className="w-full text-xs"
                >
                  {p.cta}
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-7 rounded-xl bg-brand-blue/[0.03] border-brand-blue/10">
        <h3 className="font-medium text-sm mb-2">Seu plano atual</h3>
        <div className="flex items-center gap-3">
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${planBadgeClass(user?.plano)}`}>
            {planLabel(user?.plano)}
          </span>
          <p className="text-xs text-muted-foreground">
            {user?.plano === 'Free' 
              ? 'Você está no plano gratuito. Faça upgrade para desbloquear todo o potencial.' 
              : 'Você já possui um acesso premium ativo.'}
          </p>
        </div>
      </Card>
    </div>
  );
}
