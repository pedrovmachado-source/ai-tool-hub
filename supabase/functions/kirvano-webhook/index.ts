import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, security-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

// Events that GRANT access
const GRANT_EVENTS = new Set([
  "SALE_APPROVED",
  "SUBSCRIPTION_RENEWED",
  "SUBSCRIPTION_CHARGED",
]);

// Events that REVOKE access (immediately)
const REVOKE_EVENTS = new Set([
  "SALE_REFUNDED",
  "SALE_CHARGEBACK",
  "SUBSCRIPTION_EXPIRED",
]);

// Events that keep access until the paid period ends
const CANCEL_EVENTS = new Set([
  "SUBSCRIPTION_CANCELED",
  "SUBSCRIPTION_CANCELLED",
]);

function addPeriod(from: Date, frequency?: string | null): Date {
  const f = (frequency || "").toLowerCase();
  const d = new Date(from);
  if (f.includes("anual") || f.includes("year") || f.includes("annual")) {
    d.setFullYear(d.getFullYear() + 1);
  } else if (f.includes("semestr")) {
    d.setMonth(d.getMonth() + 6);
  } else if (f.includes("trimestr") || f.includes("quarter")) {
    d.setMonth(d.getMonth() + 3);
  } else if (f.includes("semanal") || f.includes("week")) {
    d.setDate(d.getDate() + 7);
  } else {
    // default: monthly + 3 days of grace
    d.setMonth(d.getMonth() + 1);
    d.setDate(d.getDate() + 3);
  }
  return d;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const expectedToken = Deno.env.get("KIRVANO_WEBHOOK_TOKEN");
  if (!expectedToken) {
    console.error("[kirvano-webhook] KIRVANO_WEBHOOK_TOKEN not configured");
    return json({ error: "Not configured" }, 500);
  }

  const receivedToken =
    req.headers.get("security-token") ||
    req.headers.get("x-security-token") ||
    req.headers.get("security_token") ||
    "";

  if (receivedToken !== expectedToken) {
    console.warn("[kirvano-webhook] invalid security token");
    return json({ error: "Unauthorized" }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const event = String(payload.event ?? payload.type ?? "").toUpperCase();
  const customer = (payload.customer ?? {}) as Record<string, unknown>;
  const plan = (payload.plan ?? {}) as Record<string, unknown>;

  const email = String(customer.email ?? payload.email ?? "").trim().toLowerCase();
  if (!email) return json({ error: "Missing customer email" }, 400);
  if (!event) return json({ error: "Missing event" }, 400);

  const saleId = payload.sale_id ? String(payload.sale_id) : null;
  const checkoutId = payload.checkout_id ? String(payload.checkout_id) : null;
  const planName = plan.name ? String(plan.name) : (payload.product_name ? String(payload.product_name) : null);
  const chargeFrequency = plan.charge_frequency ? String(plan.charge_frequency) : null;
  const nextChargeRaw = (plan.next_charge_date ?? payload.next_charge_date) as string | undefined;
  const nextChargeDate = nextChargeRaw ? new Date(nextChargeRaw) : null;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  // Find the auth user for this email (may not exist yet: buyer pays before signing up)
  const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listError) {
    console.error("[kirvano-webhook] listUsers error", listError.message);
  }
  const matchedUser = usersPage?.users?.find(
    (u) => (u.email ?? "").toLowerCase() === email,
  ) ?? null;

  const now = new Date();
  let accessUntil: string | null = null;
  let subscriptionStatus = event;
  let shouldWrite = true;

  if (GRANT_EVENTS.has(event)) {
    const base =
      nextChargeDate && !Number.isNaN(nextChargeDate.getTime()) && nextChargeDate > now
        ? new Date(nextChargeDate.getTime() + 3 * 24 * 60 * 60 * 1000) // 3-day grace
        : addPeriod(now, chargeFrequency);
    accessUntil = base.toISOString();
    subscriptionStatus = "active";
  } else if (REVOKE_EVENTS.has(event)) {
    accessUntil = now.toISOString();
    subscriptionStatus = "revoked";
  } else if (CANCEL_EVENTS.has(event)) {
    // keep current access_until; just flag as canceled
    subscriptionStatus = "canceled";
    accessUntil = undefined as unknown as null;
  } else {
    // Unknown / informational event (abandoned cart, pix generated, etc.)
    shouldWrite = false;
  }

  if (!shouldWrite) {
    console.log("[kirvano-webhook] ignored event", event, email);
    return json({ ok: true, ignored: event });
  }

  const row: Record<string, unknown> = {
    email,
    kirvano_customer_email: email,
    kirvano_last_sale_id: saleId,
    kirvano_checkout_id: checkoutId,
    plan_name: planName,
    charge_frequency: chargeFrequency,
    next_charge_date:
      nextChargeDate && !Number.isNaN(nextChargeDate.getTime()) ? nextChargeDate.toISOString() : null,
    subscription_status: subscriptionStatus,
    access_source: "kirvano",
    updated_at: now.toISOString(),
  };
  if (accessUntil !== undefined) row.access_until = accessUntil;
  if (matchedUser) row.user_id = matchedUser.id;

  // Update existing row (by user_id when known, otherwise by email)
  let updated = false;
  if (matchedUser) {
    const { data, error } = await admin
      .from("subscribers")
      .update(row)
      .eq("user_id", matchedUser.id)
      .select("id");
    if (error) {
      console.error("[kirvano-webhook] update by user_id failed", error.message);
      return json({ error: "Database error" }, 500);
    }
    updated = (data?.length ?? 0) > 0;
  }

  if (!updated) {
    const { data, error } = await admin
      .from("subscribers")
      .update(row)
      .eq("email", email)
      .select("id");
    if (error) {
      console.error("[kirvano-webhook] update by email failed", error.message);
      return json({ error: "Database error" }, 500);
    }
    updated = (data?.length ?? 0) > 0;
  }

  if (!updated) {
    if (!matchedUser) {
      // No account yet — nothing to attach the purchase to. Log and accept so
      // Kirvano does not retry forever; access is granted once the user signs up
      // with the same email (see reconcile below on next paid event).
      console.log("[kirvano-webhook] no account for", email, "event", event);
      return json({ ok: true, pending_signup: true });
    }
    const { error } = await admin.from("subscribers").insert(row);
    if (error) {
      console.error("[kirvano-webhook] insert failed", error.message);
      return json({ error: "Database error" }, 500);
    }
  }

  console.log("[kirvano-webhook] processed", event, email, "access_until:", accessUntil ?? "unchanged");
  return json({ ok: true, event, access_until: accessUntil ?? null });
});
