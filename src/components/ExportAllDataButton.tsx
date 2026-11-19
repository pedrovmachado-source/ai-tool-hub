import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const TABLES = [
  'profiles', 'user_roles', 'subscribers', 'user_offers', 'validated_offers', 'student_areas',
  'saved_ebooks', 'site_orders', 'site_products', 'site_settings', 'categories', 'tools',
  'content_sections', 'content_items', 'modules', 'lessons', 'niche_modules', 'niche_lessons',
  'invite_codes', 'access_claims', 'offer_analyses', 'pix_deposits', 'purchases', 'transactions',
  'purchased_accounts', 'unmatched_sales', 'kirvano_events', 'activity_logs', 'device_logs',
  'blocked_devices', 'cash_packages', 'email_send_log', 'suppressed_emails',
] as const;

async function fetchAll(table: string) {
  const rows: unknown[] = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await (supabase as any).from(table).select('*').range(from, from + size - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < size) break;
  }
  return rows;
}

export default function ExportAllDataButton() {
  const [busy, setBusy] = useState(false);
  const [blob, setBlob] = useState<{ url: string; name: string } | null>(null);

  const generate = async () => {
    setBusy(true);
    try {
      const result: Record<string, unknown> = {};
      const errors: Record<string, string> = {};
      await Promise.all(TABLES.map(async (t) => {
        try { result[t] = await fetchAll(t); } catch (e: any) { errors[t] = e?.message ?? 'erro'; }
      }));
      const payload = { exported_at: new Date().toISOString(), tables: result, errors };
      const b = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const name = `backup-plataforma-${new Date().toISOString().slice(0, 10)}.json`;
      setBlob({ url: URL.createObjectURL(b), name });
      toast({ title: 'Backup pronto', description: 'Clique em "Baixar arquivo".' });
    } catch (e: any) {
      toast({ title: 'Erro ao exportar', description: e?.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  if (blob) {
    return (
      <Button asChild size="sm" className="bg-brand-teal hover:bg-brand-teal/90">
        <a href={blob.url} download={blob.name} onClick={() => setTimeout(() => setBlob(null), 1000)}>
          <Download size={14} className="mr-2" /> Baixar arquivo
        </a>
      </Button>
    );
  }
  return (
    <Button variant="outline" size="sm" onClick={generate} disabled={busy} className="border-white/10 bg-white/5">
      {busy ? <Loader2 size={14} className="animate-spin mr-2" /> : <Download size={14} className="mr-2" />}
      Baixar todos os dados
    </Button>
  );
}
