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

    const { priceId, productId, mode = "payment", isPix = false } = await req.json();
    if (!priceId) throw new Error("Price ID is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : null;

    let lineItems: any[] = [];

    if (isPix) {
      // Fetch the price to get amount and currency
      const price = await stripe.prices.retrieve(priceId);
      if (!price.unit_amount) throw new Error("Price amount not found");

      // Apply 10% discount
      const discountedAmount = Math.round(price.unit_amount * 0.9);

      lineItems = [{
        price_data: {
          currency: price.currency,
          product: price.product,
          unit_amount: discountedAmount,
        },
        quantity: 1,
      }];
    } else {
      lineItems = [{ price: priceId, quantity: 1 }];
    }

    const sessionOptions: any = {
      customer: customerId || undefined,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: mode as "payment" | "subscription",
      metadata: {
        userId: user.id,
        productId: productId || "",
        paymentType: isPix ? "pix" : "card",
      },
      success_url: `${req.headers.get("origin")}/menu?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/menu?checkout=canceled`,
    };

    if (isPix) {
      sessionOptions.payment_method_types = ['pix'];
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('[create-checkout] error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});