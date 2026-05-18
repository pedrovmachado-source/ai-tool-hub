import { useState } from 'react';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  description: z.string().trim().min(10, 'Descreva o que deseja (mín. 10 caracteres)').max(2000, 'Máx. 2000 caracteres'),
  ref_link_1: z.string().trim().url('Link de referência 1 inválido').max(500),
  ref_link_2: z.string().trim().url('Link de referência 2 inválido').max(500),
  whatsapp: z.string().trim().regex(/^[+\d\s()-]{8,20}$/, 'WhatsApp inválido'),
});

export interface SiteOrderProduct {
  slug: string;
  name: string;
  price: string;
  buy_url?: string | null;
  kind?: 'site' | 'criativo';
}

export default function SiteOrderModal({ product, onClose }: { product: SiteOrderProduct; onClose: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ description: '', ref_link_1: '', ref_link_2: '', whatsapp: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    if (!user) { toast({ title: 'Faça login para continuar', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('site_orders' as any).insert({
        user_id: user.id,
        product_slug: product.slug,
        ...parsed.data,
      });
      if (error) { toast({ title: 'Erro ao enviar pedido', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Pedido enviado!', description: 'Redirecionando para o pagamento…' });
      if (product.buy_url) window.open(product.buy_url, '_blank', 'noopener,noreferrer');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (k: string) => `w-full px-3 py-2 rounded-lg text-sm bg-secondary border ${errors[k] ? 'border-brand-red' : 'border-border'} text-foreground focus:outline-none focus:border-brand-blue`;

  return (
    <div className="fixed inset-0 z-[400] bg-black/70 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="min-w-0">
            <h3 className="font-serif-display text-lg truncate">Pedido — {product.name}</h3>
            <p className="text-xs text-muted-foreground">
              {product.kind === 'criativo' ? 'Criativo' : 'Site Pronto'} · R$ {product.price}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição do que deseja no site *</label>
            <textarea rows={4} maxLength={2000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls('description') + ' resize-none'} placeholder="Conte os objetivos, público, oferta, estilo desejado…" />
            {errors.description && <p className="text-[11px] text-brand-red mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Link de referência 1 *</label>
            <input type="url" maxLength={500} value={form.ref_link_1} onChange={e => setForm({ ...form, ref_link_1: e.target.value })} className={inputCls('ref_link_1')} placeholder="https://..." />
            {errors.ref_link_1 && <p className="text-[11px] text-brand-red mt-1">{errors.ref_link_1}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Link de referência 2 *</label>
            <input type="url" maxLength={500} value={form.ref_link_2} onChange={e => setForm({ ...form, ref_link_2: e.target.value })} className={inputCls('ref_link_2')} placeholder="https://..." />
            {errors.ref_link_2 && <p className="text-[11px] text-brand-red mt-1">{errors.ref_link_2}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">WhatsApp para contato *</label>
            <input maxLength={20} value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className={inputCls('whatsapp')} placeholder="+55 11 99999-9999" />
            {errors.whatsapp && <p className="text-[11px] text-brand-red mt-1">{errors.whatsapp}</p>}
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2 justify-end">
          <button onClick={onClose} disabled={submitting} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
          <button onClick={submit} disabled={submitting} className="px-4 py-2 rounded-lg bg-brand-amber text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2">
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Enviar pedido e ir para pagamento
          </button>
        </div>
      </div>
    </div>
  );
}
