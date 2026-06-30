import { ArrowLeft, ExternalLink, ShieldCheck, MessageCircle, Info, AlertTriangle } from 'lucide-react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

const TELEGRAM_URL = 'https://t.me/fbadsstore_bot?start=1353808441';

export default function FbAccountsPage({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white pt-[92px] sm:pt-[116px]">
      <Navbar onNavigate={(t) => {
        if (t === 'home') navigate('/');
        else if (t === 'profile') navigate('/perfil');
        else navigate('/menu');
      }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 text-[11px] px-3 py-1.5 rounded-full mb-4">
            <ShieldCheck size={12} className="text-emerald-400" /> Parceiro verificado
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl mb-3">Contas de Facebook Ads</h1>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Acesse contas profissionais para escalar suas campanhas de Facebook & Instagram Ads com segurança e estabilidade.
          </p>
        </div>

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block bg-gradient-to-br from-[#229ED9] to-[#0088cc] hover:from-[#33b3ee] hover:to-[#0099dd] transition-all rounded-2xl p-6 sm:p-8 mb-6 shadow-[0_10px_40px_-10px_rgba(34,158,217,0.5)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <MessageCircle size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/70 mb-1">Comprar via Telegram</div>
              <div className="text-lg sm:text-xl font-semibold">Abrir @fbadsstore_bot</div>
              <div className="text-xs text-white/70 mt-1">Atendimento direto com o parceiro oficial</div>
            </div>
            <ExternalLink size={20} className="text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </a>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 sm:p-6 mb-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-brand-blue-medium shrink-0 mt-0.5" />
            <div className="text-sm text-white/75 leading-relaxed space-y-3">
              <p>
                <strong className="text-white">Este é um site parceiro.</strong> Toda a venda, entrega e suporte técnico das contas é feito diretamente por eles via Telegram. Nós apenas fazemos o direcionamento para facilitar seu acesso a um fornecedor de confiança.
              </p>
              <p>
                O parceiro já é validado pela nossa equipe e atende centenas de afiliados e gestores de tráfego diariamente. <strong className="text-emerald-400">São de confiança!</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { t: 'Variedade', d: 'Perfis, BMs ilimitadas, contas estrangeiras e mais' },
            { t: 'Entrega rápida', d: 'Atendimento ágil direto no Telegram' },
            { t: 'Suporte direto', d: 'Tire dúvidas com o vendedor antes de comprar' },
          ].map((b) => (
            <div key={b.t} className="bg-white/[0.03] border border-white/10 rounded-lg p-4">
              <div className="text-sm font-medium mb-1">{b.t}</div>
              <div className="text-xs text-white/55 leading-relaxed">{b.d}</div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2.5 text-[11px] text-white/40 bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Qualquer questão sobre pagamento, garantia ou reposição deve ser tratada diretamente com o parceiro no Telegram. A Convert Club não intermedeia essas transações.
          </p>
        </div>
      </div>
    </div>
  );
}
