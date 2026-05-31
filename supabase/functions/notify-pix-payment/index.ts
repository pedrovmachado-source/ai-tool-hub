import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    const { packageName, amount, cashAmount } = await req.json();

    // Get user profile info
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('nome, email, telefone')
      .eq('id', user.id)
      .single();

    // Get admins from user_roles
    const { data: admins } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    const adminIds = admins?.map(a => a.user_id) || [];
    
    // Get admin emails
    const { data: adminProfiles } = await supabaseClient
      .from('profiles')
      .select('email')
      .in('user_id', adminIds);

    const adminEmails = adminProfiles?.map(p => p.email).filter(Boolean) as string[] || ["kayodesouzaapj@gmail.com"];

    console.log(`Notification: User ${profile?.nome} (${profile?.email}) clicked 'Already Paid' for ${packageName}. Notifying ${adminEmails.join(', ')}`);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Convert Club <noreply@convertclub.com>",
          to: adminEmails,
          subject: "Novo Aviso de Pagamento PIX",
          html: `
            <h1>Aviso de Pagamento PIX Realizado</h1>
            <p>O usuário abaixo informou que realizou o pagamento via PIX:</p>
            <ul>
              <li><strong>Nome:</strong> ${profile?.nome || 'Não informado'}</li>
              <li><strong>Email:</strong> ${profile?.email || user.email}</li>
              <li><strong>Telefone:</strong> ${profile?.telefone || 'Não informado'}</li>
              <li><strong>Pacote:</strong> ${packageName}</li>
              <li><strong>Valor:</strong> R$ ${amount}</li>
              <li><strong>Cash a receber:</strong> ${cashAmount}</li>
            </ul>
          `,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error sending email via Resend:", errorText);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
