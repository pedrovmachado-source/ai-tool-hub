import { Wallet } from 'lucide-react';

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CashBalance({ cents, onClick }: { cents: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Adicionar saldo"
      className="flex items-center gap-1.5 sm:gap-2 bg-brand-green/15 hover:bg-brand-green/25 text-brand-green pl-2 pr-2.5 sm:pl-2.5 sm:pr-3 py-1 sm:py-1.5 rounded-full transition-colors border border-brand-green/30"
    >
      <Wallet size={14} className="shrink-0" />
      <span className="text-[11px] sm:text-[12px] font-semibold tabular-nums">
        {formatBRL(cents)}
      </span>
    </button>
  );
}
