import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user?.email) throw new Error("User not authenticated");

    const body = await req.json();
    const { priceId, productId, mode = "payment", type, amountCents } = body;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-06-20",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : null;

    let lineItems: any[];
    let metadata: Record<string, string> = { userId: user.id };

    if (type === "cash_deposit") {
      const amt = Number(amountCents);
      if (!Number.isFinite(amt) || amt < 500) throw new Error("Valor mínimo de R$ 5,00");
      if (amt > 5_000_000) throw new Error("Valor máximo de R$ 50.000,00");
      lineItems = [{
        price_data: {
          currency: "brl",
          unit_amount: amt,
          product_data: { name: "Depósito de saldo - Convert Club" },
        },
        quantity: 1,
      }];
      metadata = { ...metadata, type: "cash_deposit", amountCents: String(amt) };
    } else {
      if (!priceId) throw new Error("Price ID is required");
      lineItems = [{ price: priceId, quantity: 1 }];
      metadata = { ...metadata, productId: productId || "", type: "product_purchase" };
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: mode as "payment" | "subscription",
      metadata,
      payment_method_types: ["card"],
      success_url: `${req.headers.get("origin")}/menu?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/menu?checkout=canceled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[create-checkout] error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
