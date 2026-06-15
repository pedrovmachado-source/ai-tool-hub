import { Wallet } from 'lucide-react';

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CashBalance({ cents, onClick }: { cents: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Adicionar saldo"
      aria-label={`Saldo ${formatBRL(cents)} — adicionar saldo`}
      className="flex items-center gap-1 sm:gap-2 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal pl-2 pr-2 sm:pl-2.5 sm:pr-3 py-1.5 rounded-full transition-all border border-brand-teal/25 hover:border-brand-teal/40 shrink-0"
    >
      <Wallet size={14} className="shrink-0" />
      <span className="text-[10px] sm:text-[12px] font-bold tabular-nums leading-none">
        {formatBRL(cents)}
      </span>
    </button>
  );
}
