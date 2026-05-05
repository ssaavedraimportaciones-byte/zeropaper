import { NextRequest, NextResponse } from 'next/server'
import { getTextStream, noKeyError, detectProvider } from '../_lib/ai-stream'

const SYSTEM_PROMPT = `Eres ZP Asistente, el soporte inteligente de ZeroPaper™ — sistema de control operativo portuario sin papel.

## CONOCIMIENTO DEL SISTEMA

### Funciones de la app
- **Operador (/app)**: Registra ingresos/egresos de vehículos. Toma foto del documento. Funciona offline.
- **Panel admin (/owner)**: Dashboard, exportar CSV, reportes, departamentos.
- **TV dashboard (/tv)**: Vista en tiempo real para pantalla grande.

### Documentos soportados
EIR, DUS, DAM, Guía de Despacho, Factura, Conocimiento de Embarque, Booking, Gate In/Out, Intercheck, Pase de Salida, Carta Porte, Manifiesto.

### Problemas frecuentes
- **No puedo iniciar sesión**: Ctrl+Shift+R para limpiar caché. Verificar sin espacios en email.
- **No sincroniza**: Verificar internet. Cerrar y abrir app. Si persiste, contactar soporte.
- **OCR no lee bien**: Buena iluminación. Foto enfocada.
- **Instalar PWA**: Chrome: menú 3 puntos → "Instalar". Safari: compartir → "Agregar a pantalla inicio".
- **Folio duplicado**: El admin puede anular desde /owner.

## ESTILO DE RESPUESTA
- Siempre en español chileno
- Directo y concreto, máximo 3 párrafos
- Usa formato markdown cuando ayude (bold, listas)`

export async function POST(req: NextRequest) {
  if (detectProvider() === 'none') {
    return NextResponse.json({ error: noKeyError() }, { status: 503 })
  }

  let body: { messages?: Array<{ role: string; content: string }> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request inválido' }, { status: 400 })
  }

  const { messages } = body
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 })
  }

  const msgs = messages as Array<{ role: string; content: string }>
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      try {
        for await (const text of getTextStream(msgs, SYSTEM_PROMPT)) {
          send({ text })
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        const msg = String((err as Error)?.message || err)
        let userMsg = 'Error al conectar con el asistente. Intenta nuevamente.'
        if (msg === 'NO_KEY') userMsg = noKeyError()
        else if (msg.includes('credit') || msg.includes('billing') || msg.includes('quota')) userMsg = '⚠️ Sin créditos de IA. El administrador debe recargar.'
        else if (msg.includes('401') || msg.includes('API key') || msg.includes('API_KEY')) userMsg = '⚠️ API key inválida. Verifica la configuración.'
        else if (msg.includes('overloaded') || msg.includes('529')) userMsg = '⚠️ El servicio está muy solicitado. Intenta en unos segundos.'
        send({ error: userMsg })
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  })
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
