import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Facebook, ShieldCheck, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PurchasedAccount {
  id: string;
  account_type: string;
  credentials: {
    login?: string;
    password?: string;
    two_factor?: string;
    recovery_email?: string;
    bm_link?: string;
  };
  created_at: string;
  status: string;
}

export default function PurchasedAccountsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [accounts, setAccounts] = useState<PurchasedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchased_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedAccounts = (data || []).map(acc => ({
        ...acc,
        credentials: (typeof acc.credentials === 'object' && acc.credentials !== null) 
          ? acc.credentials as PurchasedAccount['credentials']
          : {}
      })) as PurchasedAccount[];
      
      setAccounts(typedAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Não foi possível carregar suas contas.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(fieldId);
    toast.success('Copiado para a área de transferência');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black border-white/10 text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif-display flex items-center gap-2 text-white">
            <ShieldCheck className="text-brand-blue-medium" />
            Minhas Contas & BMs
          </DialogTitle>
          <p className="text-white/40 text-sm">
            Aqui estão os acessos de todas as contas e BMs que você adquiriu.
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="py-12 text-center text-white/20">Carregando seus acessos...</div>
          ) : accounts.length === 0 ? (
            <div className="py-12 text-center glass-smooth rounded-2xl border border-white/5">
              <Facebook size={40} className="mx-auto mb-4 text-white/10" />
              <p className="text-white/40">Nenhuma conta encontrada em seu perfil.</p>
              <p className="text-xs text-white/20 mt-1">Após a confirmação do pagamento, os dados aparecerão aqui.</p>
            </div>
          ) : (
            accounts.map((acc) => (
              <div key={acc.id} className="glass-smooth border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-serif-display text-lg text-white">{acc.account_type}</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                      Comprado em {new Date(acc.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    acc.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-white/10 text-white/40'
                  }`}>
                    {acc.status === 'active' ? 'Ativo' : acc.status}
                  </span>
                </div>

                <div className="grid gap-3">
                  {acc.credentials.login && (
                    <CredentialField 
                      label="Login / Email" 
                      value={acc.credentials.login} 
                      onCopy={() => copyToClipboard(acc.credentials.login!, `${acc.id}-login`)}
                      isCopied={copiedId === `${acc.id}-login`}
                    />
                  )}
                  {acc.credentials.password && (
                    <CredentialField 
                      label="Senha" 
                      value={acc.credentials.password} 
                      onCopy={() => copyToClipboard(acc.credentials.password!, `${acc.id}-pass`)}
                      isCopied={copiedId === `${acc.id}-pass`}
                      isPassword
                    />
                  )}
                  {acc.credentials.two_factor && (
                    <CredentialField 
                      label="Código 2FA / Chave" 
                      value={acc.credentials.two_factor} 
                      onCopy={() => copyToClipboard(acc.credentials.two_factor!, `${acc.id}-2fa`)}
                      isCopied={copiedId === `${acc.id}-2fa`}
                    />
                  )}
                  {acc.credentials.bm_link && (
                    <div className="mt-2">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 ml-1">Link de Convite BM</p>
                      <button 
                        onClick={() => window.open(acc.credentials.bm_link, '_blank')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue-medium hover:bg-brand-blue/20 transition-all text-sm font-medium"
                      >
                        <span className="truncate mr-2">{acc.credentials.bm_link}</span>
                        <ExternalLink size={14} className="shrink-0" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CredentialField({ label, value, onCopy, isCopied, isPassword }: { label: string; value: string; onCopy: () => void; isCopied: boolean; isPassword?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 ml-1">{label}</p>
      <div className="flex gap-2">
        <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 text-sm font-mono text-white/80 truncate">
          {isPassword ? '••••••••••••' : value}
        </div>
        <button 
          onClick={onCopy}
          className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0"
        >
          {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
