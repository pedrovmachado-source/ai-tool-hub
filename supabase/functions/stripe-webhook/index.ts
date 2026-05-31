import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const sig = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!sig || !webhookSecret) {
      return new Response("Missing signature or secret", { status: 400 });
    }

    const body = await req.text();
    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const productId = session.metadata?.productId;

      if (userId && productId) {
        // Log the purchase
        const { error: purchaseError } = await supabaseClient.from('purchases').insert({
          user_id: userId,
          product_id: productId,
          stripe_session_id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          status: 'completed'
        });

        if (purchaseError) console.error("Error logging purchase:", purchaseError);

        // Fetch product details to create the "account" entry
        const { data: product } = await supabaseClient.from('content_items').select('*').eq('id', productId).single();

        if (product) {
          // Create entry in purchased_accounts so it shows up for the user
          const { error: accError } = await supabaseClient.from('purchased_accounts').insert({
            user_id: userId,
            account_type: product.title,
            status: 'active',
            credentials: {
              info: "Seu acesso será liberado em breve. Verifique seu e-mail ou entre em contato com o suporte.",
              purchase_id: session.id
            }
          });
          if (accError) console.error("Error creating purchased account record:", accError);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('[stripe-webhook] error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
