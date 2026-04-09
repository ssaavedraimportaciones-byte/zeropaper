import Anthropic from '@anthropic-ai/sdk';

export const config = { runtime: 'edge', maxDuration: 30 };

const SYSTEM = `Eres un sistema OCR especializado en documentos operativos portuarios e industriales chilenos.
Analiza la imagen y extrae TODOS los datos que puedas identificar.

CAMPOS A BUSCAR (prioridad):
1. PATENTE: Formato chileno (XX-XX-00, XXXX-00, XX-0000). Busca en cualquier parte de la imagen.
2. FOLIO: Número de documento, guía, factura. Puede estar escrito a mano.
3. TIPO_DOCUMENTO: Clasifica entre: GUIA_DESPACHO, FACTURA, CONOCIMIENTO_EMBARQUE, DUS, DAM, EIR, INTERCHECK, BOOKING, GATE_IN, GATE_OUT, ORDEN_COMPRA, NOTA_ENTREGA, PASE_SALIDA, CARTA_PORTE, MANIFIESTO, u OTRO.
4. RUT: Si hay RUT visible (formato XX.XXX.XXX-X)
5. FECHA: Fecha del documento
6. MONTO: Si hay montos visibles
7. EMPRESA: Nombre de empresa si aparece
8. OBSERVACIONES: Cualquier dato relevante adicional

Responde SIEMPRE en JSON válido con esta estructura:
{
  "patente": "XX-XX-00" o null,
  "folio": "12345" o null,
  "tipoDocumento": "GUIA_DESPACHO" o null,
  "rut": "12.345.678-9" o null,
  "fecha": "2025-01-15" o null,
  "monto": "$123.456" o null,
  "empresa": "Nombre S.A." o null,
  "observaciones": "texto libre",
  "confianza": { "patente": 0.95, "folio": 0.8, "tipoDocumento": 0.9 },
  "escritoAMano": true/false,
  "resumen": "Breve descripción de lo que se ve en el documento"
}

Si no puedes leer algo con certeza, pon confianza baja (<0.5). NUNCA inventes datos.`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key no configurada' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Request inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { image, mediaType } = body;
  if (!image) {
    return new Response(
      JSON.stringify({ error: 'Imagen requerida (base64)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const client = new Anthropic({ apiKey });

    // Strip data URL prefix if present
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    const imgMediaType = mediaType || 'image/jpeg';

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imgMediaType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: 'Analiza este documento y extrae todos los datos según las instrucciones. Responde SOLO con JSON válido.'
          }
        ],
      }],
      system: SYSTEM,
    });

    const text = response.content[0]?.text || '{}';

    // Try to parse JSON from response
    let result;
    try {
      // Extract JSON from possible markdown code block
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      result = { error: 'No se pudo procesar la respuesta', raw: text };
    }

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (err) {
    const msg = String(err?.message || err);
    let userMsg = 'Error al procesar imagen';
    if (msg.includes('credit') || msg.includes('billing')) {
      userMsg = 'Sin créditos de IA. Contacta al administrador.';
    } else if (msg.includes('too large') || msg.includes('size')) {
      userMsg = 'Imagen demasiado grande. Intenta con menor resolución.';
    }

    return new Response(
      JSON.stringify({ error: userMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
