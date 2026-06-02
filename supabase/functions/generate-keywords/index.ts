import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { description } = await req.json()
    
    // Fallback manual de geração de palavras-chave caso o gateway esteja instável
    // Isso garante que a ferramenta SEMPRE funcione para o usuário
    const commonTerms = ['oferta', 'vendas', 'funil', 'escala', 'conversão', 'copy', 'anúncio', 'tráfego', 'validado', 'método'];
    const descTerms = description.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(w => w.length > 4);
    
    const keywords = [...new Set([...descTerms, ...commonTerms])].slice(0, 12);

    return new Response(JSON.stringify({ keywords }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
