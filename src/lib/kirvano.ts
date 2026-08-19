import { supabase } from '@/integrations/supabase/client';

export const KIRVANO_PRICE_LABEL = 'R$ 9,90/mês';
export const SUPPORT_WHATSAPP = '5521965248844';

let cachedBaseUrl: string | null = null;

/** Base URL da oferta na Kirvano (https://pay.kirvano.com/<uuid>), guardada em site_settings. */
export async function getKirvanoCheckoutBaseUrl(): Promise<string | null> {
  if (cachedBaseUrl !== null) return cachedBaseUrl || null;
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'kirvano_checkout_url')
    .maybeSingle();
  const value = (data?.value ?? {}) as { url?: string };
  cachedBaseUrl = (value.url || '').trim();
  return cachedBaseUrl || null;
}

export interface CheckoutUser {
  id: string;
  email: string;
  nome?: string;
  sobrenome?: string;
  telefone?: string;
}

/**
 * Monta a URL do checkout hospedado da Kirvano com os dados do usuário
 * pré-preenchidos. utm_content e src carregam o user_id (redundância proposital)
 * — é assim que o webhook reconhece de quem é a compra.
 */
export function buildKirvanoCheckoutUrl(baseUrl: string, user: CheckoutUser): string {
  const url = new URL(baseUrl);
  const name = [user.nome, user.sobrenome].filter(Boolean).join(' ').trim();
  if (user.email) url.searchParams.set('customer.email', user.email);
  if (name) url.searchParams.set('customer.name', name);
  if (user.telefone) url.searchParams.set('customer.phone', user.telefone);
  url.searchParams.set('utm_content', user.id);
  url.searchParams.set('src', user.id);
  return url.toString();
}

export async function openKirvanoCheckout(user: CheckoutUser): Promise<'ok' | 'missing-url'> {
  const base = await getKirvanoCheckoutBaseUrl();
  if (!base) return 'missing-url';
  window.location.href = buildKirvanoCheckoutUrl(base, user);
  return 'ok';
}

export interface SubscriberRow {
  access_until: string | null;
  access_source: string | null;
  subscription_status: string | null;
  plan_name: string | null;
  charge_frequency: string | null;
  next_charge_date: string | null;
}

export async function fetchSubscriber(userId: string): Promise<SubscriberRow | null> {
  const { data } = await supabase
    .from('subscribers')
    .select('access_until, access_source, subscription_status, plan_name, charge_frequency, next_charge_date')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as SubscriberRow) ?? null;
}

export const hasActiveAccess = (row: SubscriberRow | null): boolean =>
  !!row?.access_until && new Date(row.access_until) > new Date();

export const formatDate = (value?: string | null): string =>
  value ? new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
