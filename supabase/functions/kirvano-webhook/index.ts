import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const DAY = 24 * 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const REVOKE_EVENTS = new Set([
  "SALE_CHARGEBACK",
  "SALE_REFUNDED",
  "SALE_REFUND",
  "SUBSCRIPTION_EXPIRED",
]);

const INFO_EVENTS = new Set([
  "PIX_GENERATED",
  "PIX_EXPIRED",
  "BANK_SLIP_GENERATED",
  "BANK_SLIP_EXPIRED",
  "ABANDONED_CART",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expectedToken = Deno.env.get("KIRVANO_WEBHOOK_TOKEN");
  if (!expectedToken) {
    console.error("[kirvano-webhook] KIRVANO_WEBHOOK_TOKEN not configured");
    return json({ error: "Not configured" }, 500);
  }

  const rawBody = await req.text();

  // First-version diagnostics: log the real shape Kirvano sends so the token
  // validation can be narrowed down later.
  const headerDump: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headerDump[k] = /token|authorization|secret|key/i.test(k) ? "<redacted>" : v;
  });
  console.log("[kirvano-webhook] headers", JSON.stringify(headerDump));
  console.log("[kirvano-webhook] token-carrying headers present:", JSON.stringify({
    token: !!req.headers.get("token"),
    "x-kirvano-token": !!req.headers.get("x-kirvano-token"),
    "security-token": !!req.headers.get("security-token"),
    authorization: !!req.headers.get("authorization"),
  }));
  console.log("[kirvano-webhook] raw body", rawBody.slice(0, 4000));

  let payload: Record<string, any> = {};
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const candidates = [
    req.headers.get("token"),
    req.headers.get("x-kirvano-token"),
    req.headers.get("security-token"),
    req.headers.get("x-security-token"),
    authHeader,
    authHeader.replace(/^Bearer\s+/i, ""),
    typeof payload.token === "string" ? payload.token : null,
  ].filter((v): v is string => typeof v === "string" && v.length > 0);

  if (!candidates.some((c) => c.trim() === expectedToken)) {
    console.warn("[kirvano-webhook] token not found or invalid");
    return json({ error: "Unauthorized" }, 401);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const event = String(payload.event ?? "").toUpperCase();
  const saleType = String(payload.type ?? "").toUpperCase();
  const customer = (payload.customer ?? {}) as Record<string, any>;
  const plan = (payload.plan ?? {}) as Record<string, any>;
  const utm = (payload.utm ?? {}) as Record<string, any>;

  const saleId = payload.sale_id ? String(payload.sale_id) : null;
  const checkoutId = payload.checkout_id ? String(payload.checkout_id) : null;
  const email = String(customer.email ?? payload.email ?? "").trim().toLowerCase();

  // --- Idempotency + raw audit log (always) ---
  if (saleId) {
    const { error: dupErr } = await admin
      .from("kirvano_events")
      .insert({ sale_id: saleId, event: event || "UNKNOWN", payload });
    if (dupErr) {
      if (dupErr.code === "23505" || /duplicate key/i.test(dupErr.message)) {
        console.log("[kirvano-webhook] duplicate event ignored", saleId, event);
        return json({ ok: true, duplicate: true });
      }
      console.error("[kirvano-webhook] event log failed", dupErr.message);
    }
  } else {
    await admin.from("kirvano_events").insert({ sale_id: null, event: event || "UNKNOWN", payload });
  }

  if (!event) return json({ ok: true, ignored: "missing event" });

  if (INFO_EVENTS.has(event)) {
    console.log("[kirvano-webhook] informational event", event, email);
    return json({ ok: true, logged: event });
  }

  // --- Identify the user ---
  let userId: string | null = null;

  for (const raw of [utm.utm_content, utm.src, payload.utm_content, payload.src]) {
    const v = typeof raw === "string" ? raw.trim() : "";
    if (!UUID_RE.test(v)) continue;
    const { data } = await admin.auth.admin.getUserById(v);
    if (data?.user) { userId = data.user.id; break; }
  }

  let existingSubscriber: Record<string, any> | null = null;

  if (!userId && email) {
    const { data: sub } = await admin
      .from("subscribers")
      .select("id, user_id, email, access_until")
      .ilike("email", email)
      .maybeSingle();
    if (sub?.user_id) {
      userId = sub.user_id;
      existingSubscriber = sub;
    } else {
      // fall back to auth.users lookup
      const { data: page } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const match = page?.users?.find((u) => (u.email ?? "").trim().toLowerCase() === email);
      if (match) userId = match.id;
    }
  }

  if (!userId) {
    await admin.from("unmatched_sales").insert({
      sale_id: saleId,
      event,
      email: email || null,
      payload,
    });
    console.log("[kirvano-webhook] unmatched sale stored", email, event);
    return json({ ok: true, unmatched: true });
  }

  if (!existingSubscriber) {
    const { data } = await admin
      .from("subscribers")
      .select("id, user_id, email, access_until")
      .eq("user_id", userId)
      .maybeSingle();
    existingSubscriber = data ?? null;
  }

  const now = new Date();
  const currentAccess = existingSubscriber?.access_until
    ? new Date(existingSubscriber.access_until as string)
    : null;

  const nextChargeRaw = plan.next_charge_date as string | undefined;
  const nextCharge = nextChargeRaw ? new Date(nextChargeRaw) : null;
  const nextChargeValid = nextCharge && !Number.isNaN(nextCharge.getTime());

  const row: Record<string, unknown> = {
    user_id: userId,
    kirvano_customer_email: email || null,
    kirvano_last_sale_id: saleId,
    kirvano_checkout_id: checkoutId,
    plan_name: plan.name ? String(plan.name) : null,
    charge_frequency: plan.charge_frequency ? String(plan.charge_frequency) : null,
    next_charge_date: nextChargeValid ? nextCharge!.toISOString() : null,
    updated_at: now.toISOString(),
  };

  if (event === "SALE_APPROVED") {
    let target: Date;
    if (saleType === "RECURRING" && nextChargeValid) {
      target = new Date(nextCharge!.getTime() + 3 * DAY);
    } else {
      target = new Date(now.getTime() + 30 * DAY);
    }
    // never reduce an access_until that is already further ahead
    if (currentAccess && currentAccess > target) target = currentAccess;
    row.access_until = target.toISOString();
    row.access_source = "subscription";
    row.subscription_status = "active";
  } else if (REVOKE_EVENTS.has(event)) {
    row.access_until = now.toISOString();
    row.subscription_status = event === "SALE_CHARGEBACK" ? "chargeback" : "refunded";
  } else if (event === "SALE_REFUSED") {
    row.subscription_status = "past_due";
  } else if (event === "SUBSCRIPTION_CANCELED" || event === "SUBSCRIPTION_CANCELLED") {
    row.subscription_status = "canceled";
  } else {
    console.log("[kirvano-webhook] unhandled event logged only", event);
    return json({ ok: true, logged: event });
  }

  if (existingSubscriber?.id) {
    const { error } = await admin.from("subscribers").update(row).eq("id", existingSubscriber.id);
    if (error) {
      console.error("[kirvano-webhook] update failed", error.message);
      return json({ ok: false, error: "db" }, 200);
    }
  } else {
    const { error } = await admin.from("subscribers").insert({ ...row, email: email || "" });
    if (error) {
      console.error("[kirvano-webhook] insert failed", error.message);
      return json({ ok: false, error: "db" }, 200);
    }
  }

  console.log("[kirvano-webhook] processed", event, saleType, userId, row.access_until ?? "access unchanged");
  return json({ ok: true, event });
});
