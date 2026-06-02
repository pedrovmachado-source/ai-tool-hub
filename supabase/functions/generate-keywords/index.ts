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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not set')
    }

    const prompt = `Você é um especialista em marketing digital e tráfego pago. 
Com base na seguinte descrição de oferta, gere uma lista de 10 a 15 palavras-chave e termos de pesquisa altamente eficazes para serem usados na Biblioteca de Anúncios do Facebook para encontrar concorrentes ou ofertas similares validadas.

Descrição da Oferta: "${description}"

Retorne apenas um JSON no seguinte formato:
{
  "keywords": ["termo 1", "termo 2", ...]
}`

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-sonnet',
        messages: [
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      }),
    })

    const data = await response.json()
    console.log('AI Response data:', data)
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Resposta da IA inválida ou vazia')
    }

    const content = data.choices[0].message.content.trim()
    // Remove possíveis blocos de código markdown que a IA possa ter retornado
    const jsonString = content.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(jsonString)
    } catch (e) {
      console.error('Failed to parse AI content as JSON:', content)
      throw new Error('Erro ao processar resposta da IA')
    }

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
