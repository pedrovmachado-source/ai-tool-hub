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
    const { paymentMethod = "card", priceId, productId, mode = "payment", isPix = false } = body;


    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-06-20",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : null;

    let lineItems: any[] = [];
    let metadata: any = {
      userId: user.id,
    };

    // If it's a Cash package
    if (packageId) {
      const { data: pkg, error: pkgError } = await supabaseClient
        .from('cash_packages')
        .select('*')
        .eq('id', packageId)
        .single();
      
      if (pkgError || !pkg) throw new Error("Pacote de Cash não encontrado");

      const isPixMethod = paymentMethod === 'pix';
      const cashToCredit = isPixMethod ? Math.floor(pkg.base_cash * 1.1) : pkg.base_cash;

      lineItems = [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: `Recarga de ${pkg.name} - ${cashToCredit} Cash`,
            description: isPixMethod ? "Inclui bônus de 10% por pagamento via PIX" : "Pagamento via Cartão",
          },
          unit_amount: Math.round(pkg.price_brl_cents),
        },
        quantity: 1,
      }];

      metadata = {
        ...metadata,
        packageId: pkg.id,
        cashToCredit: cashToCredit.toString(),
        paymentMethod: paymentMethod,
        type: 'cash_deposit'
      };
    } else {
      // Handle regular product purchase
      if (!priceId) throw new Error("Price ID or Package ID is required");
      
      if (isPix) {
        const price = await stripe.prices.retrieve(priceId);
        if (!price.unit_amount) throw new Error("Price amount not found");
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

      metadata = {
        ...metadata,
        productId: productId || "",
        paymentType: isPix ? "pix" : "card",
        type: 'product_purchase'
      };
    }

    const sessionOptions: any = {
      customer: customerId || undefined,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: mode as "payment" | "subscription",
      metadata: metadata,
      success_url: packageId 
        ? `${req.headers.get("origin")}/comprar-cash/sucesso?session_id={CHECKOUT_SESSION_ID}`
        : `${req.headers.get("origin")}/menu?checkout=success`,
      cancel_url: packageId
        ? `${req.headers.get("origin")}/comprar-cash/cancelado`
        : `${req.headers.get("origin")}/menu?checkout=canceled`,
    };

    if (paymentMethod === 'pix' || isPix) {
      sessionOptions.payment_method_types = ['card', 'pix'];
    } else {
      sessionOptions.payment_method_types = ['card'];
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