import { Wallet } from 'lucide-react';

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CashBalance({ cents, onClick }: { cents: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Adicionar saldo"
      className="flex items-center gap-1.5 sm:gap-2 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal pl-2.5 pr-3 py-1.5 sm:py-1.5 rounded-full transition-all border border-brand-teal/25 hover:border-brand-teal/40"
    >
      <Wallet size={14} className="shrink-0" />
      <span className="text-[11px] sm:text-[12px] font-bold tabular-nums">
        {formatBRL(cents)}
      </span>
    </button>
  );
}
