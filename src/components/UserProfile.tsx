import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function UserProfile({ onBack, onNavigate }: { onBack: () => void; onNavigate: (page: string) => void }) {
  const { user, updateUser, logout } = useAuth();
  const [tab, setTab] = useState<'info' | 'senha' | 'plano'>('info');
  const [nome, setNome] = useState(user?.nome || '');
  const [sobre, setSobre] = useState(user?.sobre || '');
  const [email] = useState(user?.email || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [empresa, setEmpresa] = useState(user?.empresa || '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  if (!user) { onBack(); return null; }

  const save = async () => {
    setSaving(true);
    await updateUser({ nome, sobre, telefone, empresa });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changePassword = async () => {
    if (newPassword.length < 8) { setPwMsg('Senha deve ter no mínimo 8 caracteres.'); return; }
    if (newPassword !== confirmPassword) { setPwMsg('As senhas não coincidem.'); return; }
    setPwLoading(true);
    setPwMsg('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) { setPwMsg(error.message); } else { setPwMsg('Senha alterada com sucesso!'); setNewPassword(''); setConfirmPassword(''); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[600px] mx-auto px-6 py-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft size={16} /> Voltar</button>

        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center text-2xl font-semibold text-primary-foreground">{user.nome?.[0] || '?'}</div>
          <div>
            <div className="text-lg font-medium">{user.nome} {user.sobre}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <div className="mt-1">
              <span className={`text-[11px] font-semibold px-3 py-0.5 rounded-full ${user.plano === 'Pro' ? 'bg-gradient-to-r from-brand-amber to-brand-amber/80 text-primary-foreground' : 'bg-border text-muted-foreground'}`}>{user.plano === 'Pro' ? 'PRO' : 'FREE'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-0 border-b border-border mb-6">
          {(['info', 'senha', 'plano'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-[13.5px] border-b-2 transition-colors ${tab === t ? 'text-brand-blue border-brand-blue font-medium' : 'text-muted-foreground border-transparent'}`}>
              {t === 'info' ? 'Informações' : t === 'senha' ? 'Senha' : 'Plano'}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label><input value={nome} onChange={e => setNome(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Sobrenome</label><input value={sobre} onChange={e => setSobre(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" /></div>
            </div>
            <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label><input value={email} disabled className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-secondary text-muted-foreground" /></div>
            <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">Telefone</label><input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" /></div>
            <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">Empresa</label><input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Nome da empresa" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" /></div>
            <button onClick={save} disabled={saving} className="px-5 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saved ? '✓ Salvo!' : 'Salvar alterações'}
            </button>
          </div>
        )}

        {tab === 'senha' && (
          <div>
            {pwMsg && <p className={`text-sm mb-3 ${pwMsg.includes('sucesso') ? 'text-green-600' : 'text-brand-red'}`}>{pwMsg}</p>}
            <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">Nova senha</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" /></div>
            <div className="mb-4"><label className="text-xs font-medium text-muted-foreground mb-1 block">Confirmar nova senha</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" /></div>
            <button onClick={changePassword} disabled={pwLoading} className="px-5 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50">
              {pwLoading && <Loader2 size={14} className="animate-spin" />}
              Alterar senha
            </button>
          </div>
        )}

        {tab === 'plano' && (
          <div>
            {user.plano === 'Pro' ? (
              <div className="bg-brand-amber/10 border border-brand-amber/30 rounded-xl p-6 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-base font-semibold mb-1">Você é assinante Pro!</div>
                <p className="text-sm text-muted-foreground">Acesso completo a todos os e-books, prompts e atualizações mensais.</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Você está no plano gratuito. Desbloqueie todos os conteúdos com o Pro.</p>
                <button onClick={() => onNavigate('pro')} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-primary-foreground hover:opacity-90" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>⚡ Assinar Pro — R$19,90/mês</button>
              </div>
            )}

            <div className="mt-8 bg-brand-red/5 border border-brand-red/20 rounded-lg p-5">
              <h4 className="text-sm font-semibold text-brand-red mb-2">Zona de perigo</h4>
              <p className="text-[13px] text-muted-foreground mb-3">Sair da sua conta.</p>
              <button onClick={logout} className="px-4 py-2 bg-brand-red text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90">Sair da conta</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
