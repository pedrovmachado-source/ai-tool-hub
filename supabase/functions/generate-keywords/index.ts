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

Retorne APENAS um JSON no seguinte formato:
{
  "keywords": ["termo 1", "termo 2", ...]
}`

    const response = await fetch('https://api.lovable.app/v1/chat/completions', {
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
      }),
    })

    const rawResponse = await response.text()
    console.log('Raw AI Response:', rawResponse)

    let data;
    try {
      data = JSON.parse(rawResponse)
    } catch (e) {
      // Se falhar o parse, vamos tentar o endpoint alternativo como fallback
      console.log('Failed to parse from api.lovable.app, trying alternative...');
      
      const responseAlt = await fetch('https://gpt-proxy.lovable.app/v1/chat/completions', {
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
        }),
      })
      
      const rawResponseAlt = await responseAlt.text()
      try {
        data = JSON.parse(rawResponseAlt)
      } catch (e2) {
        throw new Error(`Falha ao conectar com a API de IA: ${rawResponse.substring(0, 50)}...`)
      }
    }

    if (data.error) {
      throw new Error(data.error.message || 'Erro na API da IA')
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Resposta da IA inválida ou vazia')
    }

    const content = data.choices[0].message.content.trim()
    const jsonString = content.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(jsonString)
    } catch (e) {
      aiResponse = { keywords: content.split('\n').filter(l => l.trim()).map(l => l.replace(/^[0-9.-]+\s*/, '').trim()).slice(0, 15) };
    }

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
