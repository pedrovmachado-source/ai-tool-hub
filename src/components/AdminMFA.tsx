import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';

interface Factor { id: string; friendly_name?: string; factor_type: string; status: string; }

export default function AdminMFA() {
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else setFactors((data?.all || []) as Factor[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEnroll = async () => {
    setEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `Admin TOTP ${new Date().toISOString().slice(0, 10)}`,
    });
    setEnrolling(false);
    if (error || !data) {
      toast({ title: 'Erro ao iniciar 2FA', description: error?.message, variant: 'destructive' });
      return;
    }
    setEnrollData({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verifyEnroll = async () => {
    if (!enrollData || code.length < 6) return;
    setVerifying(true);
    const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId: enrollData.id });
    if (chalErr || !chal) {
      setVerifying(false);
      toast({ title: 'Erro', description: chalErr?.message, variant: 'destructive' });
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: enrollData.id, challengeId: chal.id, code,
    });
    setVerifying(false);
    if (error) {
      toast({ title: 'Código inválido', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: '2FA ativado com sucesso!' });
    setEnrollData(null);
    setCode('');
    await load();
  };

  const unenroll = async (factorId: string) => {
    if (!confirm('Remover este fator 2FA?')) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: '2FA removido' }); await load(); }
  };

  const verifiedFactors = factors.filter(f => f.status === 'verified');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="text-brand-blue" size={24} />
        <div>
          <h2 className="text-lg font-bold text-white">Autenticação em Dois Fatores (2FA)</h2>
          <p className="text-[12px] text-white/50">Proteção extra para contas de administrador via TOTP (Google Authenticator, Authy, 1Password).</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/50 text-sm"><Loader2 className="animate-spin" size={16} /> Carregando…</div>
      ) : (
        <>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold text-white">Fatores ativos</span>
              <span className={`text-[11px] px-2 py-1 rounded-full ${verifiedFactors.length > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {verifiedFactors.length > 0 ? 'Protegido' : 'Sem 2FA'}
              </span>
            </div>
            {verifiedFactors.length === 0 && (
              <p className="text-[12px] text-white/40 italic">Nenhum fator ativo. Configure abaixo.</p>
            )}
            <ul className="space-y-2">
              {verifiedFactors.map(f => (
                <li key={f.id} className="flex items-center justify-between bg-white/[0.03] rounded p-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="text-[12px] text-white">{f.friendly_name || 'TOTP'}</span>
                  </div>
                  <button onClick={() => unenroll(f.id)} className="text-[11px] text-brand-red hover:underline flex items-center gap-1">
                    <ShieldOff size={12} /> Remover
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {!enrollData && (
            <button
              onClick={startEnroll}
              disabled={enrolling}
              className="px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-medium text-white text-[12px] font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {enrolling && <Loader2 className="animate-spin" size={14} />}
              Adicionar novo fator TOTP
            </button>
          )}

          {enrollData && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-4">
              <div>
                <p className="text-[12px] text-white/70 mb-2">1. Escaneie o QR abaixo no seu app autenticador:</p>
                <img src={enrollData.qr} alt="QR Code 2FA" className="w-48 h-48 bg-white p-2 rounded" />
                <p className="text-[10px] text-white/40 mt-2">Ou insira manualmente: <code className="text-white/70">{enrollData.secret}</code></p>
              </div>
              <div>
                <p className="text-[12px] text-white/70 mb-2">2. Digite o código de 6 dígitos gerado pelo app:</p>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-32 px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-center tracking-widest font-mono"
                  />
                  <button
                    onClick={verifyEnroll}
                    disabled={verifying || code.length < 6}
                    className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    {verifying && <Loader2 className="animate-spin" size={14} />}
                    Confirmar
                  </button>
                  <button
                    onClick={() => { setEnrollData(null); setCode(''); }}
                    className="px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-white/70 text-[12px]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
