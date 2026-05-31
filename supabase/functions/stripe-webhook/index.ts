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
      apiVersion: "2024-06-20",
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

    const relevantEvents = new Set([
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
      "checkout.session.expired"
    ]);

    if (relevantEvents.has(event.type)) {
      const session = event.data.object;
      const metadata = session.metadata;
      const type = metadata?.type;
      const userId = metadata?.userId;

      if (!userId) return new Response("Missing userId", { status: 200 });

      // Handle Failures
      if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
         await supabaseClient.from('transactions').update({ status: 'failed' }).eq('stripe_session_id', session.id);
         return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Handle Success
      if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        
        // Ensure it's paid for non-async completion
        if (event.type === "checkout.session.completed" && session.payment_status !== 'paid' && session.payment_method_types?.includes('card')) {
           return new Response("Not paid yet", { status: 200 });
        }

        // Idempotency check
        const { data: existingTx } = await supabaseClient
          .from('transactions')
          .select('id')
          .eq('stripe_event_id', event.id)
          .maybeSingle();
        
        if (existingTx) return new Response("Already processed", { status: 200 });

        if (type === 'cash_deposit') {
          const cashAmount = parseInt(metadata.cashToCredit);
          
          // Use RPC for atomic credit
          const { error: rpcError } = await supabaseClient.rpc('increment_cash_balance', {
            p_user: userId,
            p_amount: cashAmount
          });

          if (rpcError) throw rpcError;

          // Log transaction
          const { error: txError } = await supabaseClient.from('transactions').insert({
            user_id: userId,
            type: 'credit',
            amount: cashAmount,
            reason: 'deposit',
            status: 'completed',
            stripe_session_id: session.id,
            stripe_event_id: event.id
          });

          if (txError) console.error("Error logging transaction:", txError);

        } else if (type === 'product_purchase' || !type) {
          // Existing product purchase logic
          const productId = metadata?.productId;
          if (productId) {
            const { error: purchaseError } = await supabaseClient.from('purchases').insert({
              user_id: userId,
              product_id: productId,
              stripe_session_id: session.id,
              amount_total: session.amount_total,
              currency: session.currency,
              status: 'completed'
            });

            if (purchaseError) console.error("Error logging purchase:", purchaseError);

            let productName = "";
            const { data: contentProd } = await supabaseClient.from('content_items').select('title').eq('id', productId).maybeSingle();
            if (contentProd) {
              productName = contentProd.title;
            } else {
              const { data: siteProd } = await supabaseClient.from('site_products' as any).select('name').eq('id', productId).maybeSingle();
              if (siteProd) productName = (siteProd as any).name;
            }

            if (productName) {
              await supabaseClient.from('purchased_accounts').insert({
                user_id: userId,
                account_type: productName,
                status: 'active',
                credentials: {
                  info: "Seu acesso será liberado em breve. Verifique seu e-mail ou entre em contato com o suporte.",
                  purchase_id: session.id
                }
              });
            }
          }
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
