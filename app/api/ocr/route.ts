import { NextRequest, NextResponse } from 'next/server'
import { detectProvider, noKeyError } from '../_lib/ai-stream'

const OCR_PROMPT = `Eres un sistema OCR especializado en documentos operativos portuarios e industriales chilenos.
Analiza la imagen y extrae TODOS los datos que puedas identificar.

CAMPOS A BUSCAR:
1. PATENTE: Formato chileno (XX-XX-00, XXXX-00, XX-0000).
2. FOLIO: Número de documento, guía, factura. Puede estar escrito a mano.
3. TIPO_DOCUMENTO: GUIA_DESPACHO, FACTURA, CONOCIMIENTO_EMBARQUE, DUS, DAM, EIR, INTERCHECK, BOOKING, GATE_IN, GATE_OUT, ORDEN_COMPRA, NOTA_ENTREGA, PASE_SALIDA, CARTA_PORTE, MANIFIESTO, u OTRO.
4. RUT: Si hay RUT visible (formato XX.XXX.XXX-X)
5. FECHA: Fecha del documento
6. EMPRESA: Nombre de empresa si aparece

Responde SIEMPRE en JSON válido, sin texto adicional:
{
  "patente": "XX-XX-00" o null,
  "folio": "12345" o null,
  "tipoDocumento": "GUIA_DESPACHO" o null,
  "rut": null,
  "fecha": null,
  "empresa": null,
  "observaciones": "texto libre",
  "confianza": { "patente": 0.95, "folio": 0.8, "tipoDocumento": 0.9 },
  "escritoAMano": false,
  "resumen": "Breve descripción del documento"
}

Si no puedes leer algo con certeza, pon confianza baja (<0.5). NUNCA inventes datos.
Responde SOLO con JSON válido, sin markdown ni texto extra.`

async function runGeminiOcr(base64: string, mimeType: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genai.getGenerativeModel({ model: 'gemini-2.5-pro' })

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { data: base64, mimeType } },
        { text: OCR_PROMPT },
      ],
    }],
  })

  return result.response.text()
}

async function runClaudeOcr(base64: string, mimeType: string): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  type ImgMime = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  const imgType = (mimeType.split(';')[0] || 'image/jpeg') as ImgMime
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: imgType, data: base64 } },
        { type: 'text', text: OCR_PROMPT },
      ],
    }],
  })

  return response.content[0]?.type === 'text' ? response.content[0].text : '{}'
}

export async function POST(req: NextRequest) {
  const provider = detectProvider()
  if (provider === 'none') {
    return NextResponse.json({ error: noKeyError() }, { status: 503 })
  }

  let body: { image?: string; mediaType?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request inválido' }, { status: 400 })
  }

  const { image, mediaType } = body
  if (!image) {
    return NextResponse.json({ error: 'Imagen requerida (base64)' }, { status: 400 })
  }

  try {
    const base64 = image.replace(/^data:image\/[a-z]+;base64,/, '')
    const mime = mediaType || 'image/jpeg'

    const text = provider === 'gemini'
      ? await runGeminiOcr(base64, mime)
      : await runClaudeOcr(base64, mime)

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : text)

    return NextResponse.json(result, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    const msg = String((err as Error)?.message || err)
    let userMsg = 'Error al procesar imagen'
    if (msg.includes('credit') || msg.includes('billing') || msg.includes('quota')) {
      userMsg = 'Sin créditos de IA. Contacta al administrador.'
    } else if (msg.includes('too large') || msg.includes('size')) {
      userMsg = 'Imagen demasiado grande. Intenta con menor resolución.'
    } else if (msg.includes('401') || msg.includes('API_KEY')) {
      userMsg = 'API key inválida. Verifica la configuración en Vercel.'
    }
    return NextResponse.json({ error: userMsg }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
