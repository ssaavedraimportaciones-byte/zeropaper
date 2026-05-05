import { NextRequest, NextResponse } from 'next/server'
import { detectProvider } from '../_lib/ai-stream'

export const maxDuration = 60

const FB_PROJECT = 'zeropaper-prod'
const FB_KEY     = 'AIzaSyCli7F4hLi-XEmmekGZpO2KQ1SO612I85Y'
const FS_URL     = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents`

const SYSTEM_PROMPT = `Eres ZP Asistente, soporte técnico inteligente de ZeroPaper™ — sistema de control operativo portuario sin papel.

## CAPACIDADES EN TIEMPO REAL
Tienes acceso directo al sistema ZeroPaper:
- **buscar_operacion**: busca por patente o folio en la base de datos real
- **crear_ticket**: crea tickets de soporte automáticamente en Firestore
- **consultar_conocimiento**: consulta patrones aprendidos de la empresa
- **resolver_problema**: registra soluciones para que el sistema aprenda

## CUÁNDO USAR HERRAMIENTAS (actúa sin preguntar)
- Usuario menciona patente o folio → buscar_operacion INMEDIATAMENTE
- Problema no resuelto en 2 intentos → crear_ticket
- Error técnico irresoluble → crear_ticket
- Datos perdidos o sistema caído → crear_ticket (prioridad: alta)
- Pregunta sobre patrones frecuentes → consultar_conocimiento
- Resolviste un problema → resolver_problema

## SISTEMA ZEROPAPER
- App operadores: /app — registra ingresos/egresos, OCR documentos, offline
- Panel admin: /admin — dashboard, exportar CSV, reportes IA, departamentos
- Panel dueño: /owner — métricas ejecutivas, resumen por empresa
- Dashboard TV: /tv — pantalla grande para sala de operaciones
- Seguimiento: /seguimiento — importadores rastrean su carga sin cuenta
- Certificado: /certificado — certificados ambientales

## DOCUMENTOS SOPORTADOS
EIR, DUS, DAM, Guía de Despacho, Factura, Conocimiento de Embarque, Booking, Gate In/Out, Intercheck, Pase de Salida, Carta Porte, Manifiesto

## PROBLEMAS FRECUENTES
- No inicia sesión → Ctrl+Shift+R, verificar email sin espacios
- No sincroniza → verificar internet, cerrar/abrir app; si persiste: crear_ticket
- OCR no lee → buena iluminación, foto enfocada
- Instalar PWA → Chrome: menú 3 puntos → Instalar
- Folio duplicado → verificar en /admin, admin puede anular
- QR no funciona → usar /seguimiento con patente manual

## ESTILO
- Español directo, máximo 3 párrafos
- Si creaste ticket: muestra el número
- Si encontraste operación: muestra los datos
- Si el usuario está frustrado: reconoce primero, luego solución`

// ── Definición de herramientas ───────────────────────────────────

const TOOLS_CLAUDE = [
  {
    name: 'buscar_operacion',
    description: 'Busca operaciones registradas por patente o folio. Úsala SIEMPRE que el usuario mencione una patente o folio.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patente: { type: 'string', description: 'Patente del vehículo en mayúsculas' },
        folio:   { type: 'string', description: 'Número de folio o documento' }
      }
    }
  },
  {
    name: 'crear_ticket',
    description: 'Crea ticket de soporte técnico. Úsala sin preguntar cuando el problema persiste o hay error técnico.',
    input_schema: {
      type: 'object' as const,
      properties: {
        problema:  { type: 'string' },
        prioridad: { type: 'string', enum: ['alta', 'media', 'baja'] },
        categoria: { type: 'string', enum: ['login', 'sincronizacion', 'operaciones', 'app', 'admin', 'reportes', 'otro'] }
      },
      required: ['problema', 'prioridad', 'categoria']
    }
  },
  {
    name: 'consultar_conocimiento',
    description: 'Consulta base de conocimiento de la empresa: patrones operativos, docs frecuentes, problemas resueltos.',
    input_schema: {
      type: 'object' as const,
      properties: {
        empresa: { type: 'string' },
        depto:   { type: 'string' }
      },
      required: ['empresa']
    }
  },
  {
    name: 'resolver_problema',
    description: 'Registra un problema resuelto para aprendizaje futuro.',
    input_schema: {
      type: 'object' as const,
      properties: {
        empresa:   { type: 'string' },
        problema:  { type: 'string' },
        solucion:  { type: 'string' },
        categoria: { type: 'string' }
      },
      required: ['empresa', 'problema', 'solucion']
    }
  }
]

const TOOLS_GEMINI = [{
  functionDeclarations: [
    {
      name: 'buscar_operacion',
      description: 'Busca operaciones registradas por patente o folio. Úsala SIEMPRE que el usuario mencione una patente o folio.',
      parameters: {
        type: 'object',
        properties: {
          patente: { type: 'string', description: 'Patente del vehículo' },
          folio:   { type: 'string', description: 'Número de folio' }
        }
      }
    },
    {
      name: 'crear_ticket',
      description: 'Crea ticket de soporte automáticamente cuando el problema persiste.',
      parameters: {
        type: 'object',
        properties: {
          problema:  { type: 'string' },
          prioridad: { type: 'string' },
          categoria: { type: 'string' }
        },
        required: ['problema', 'prioridad', 'categoria']
      }
    },
    {
      name: 'consultar_conocimiento',
      description: 'Consulta patrones aprendidos de la empresa.',
      parameters: {
        type: 'object',
        properties: {
          empresa: { type: 'string' },
          depto:   { type: 'string' }
        },
        required: ['empresa']
      }
    },
    {
      name: 'resolver_problema',
      description: 'Registra un problema resuelto para aprendizaje.',
      parameters: {
        type: 'object',
        properties: {
          empresa:   { type: 'string' },
          problema:  { type: 'string' },
          solucion:  { type: 'string' },
          categoria: { type: 'string' }
        },
        required: ['empresa', 'problema', 'solucion']
      }
    }
  ]
}]

// ── Implementación de herramientas ───────────────────────────────

async function buscarOperacion({ patente, folio }: { patente?: string; folio?: string }) {
  const fieldPath = patente ? 'plate' : folio ? 'folio' : null
  const fieldLabel = patente ? 'patente' : folio ? 'folio' : null
  const value = patente ? patente.toUpperCase().replace(/\s/g, '') : folio?.trim()
  if (!fieldPath) return { error: 'Especifica patente o folio' }

  try {
    const query = {
      structuredQuery: {
        from: [{ collectionId: 'ops', allDescendants: true }],
        where: { fieldFilter: { field: { fieldPath }, op: 'EQUAL', value: { stringValue: value } } },
        limit: 5
      }
    }
    const res  = await fetch(`${FS_URL}:runQuery?key=${FB_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query)
    })
    const docs = await res.json() as Array<{ document?: { fields?: Record<string, { stringValue?: string; integerValue?: string }> } }>
    const ops  = docs.filter(d => d.document?.fields).map(d => {
      const f = d.document!.fields!
      const s = (k: string) => f[k]?.stringValue || '—'
      const ts = f.ts?.integerValue ? new Date(parseInt(f.ts.integerValue)).toLocaleString('es-CL') : s('fecha')
      return { patente: s('plate'), tipo: s('tipo'), depto: s('depto'), folio: s('folio'), operador: s('operador'), estado: s('estado'), fecha: ts }
    })
    if (!ops.length) return { encontrado: false, mensaje: `No hay operaciones con ${fieldLabel}: "${value}"` }
    return { encontrado: true, total: ops.length, operaciones: ops }
  } catch (e) {
    return { error: 'Error al buscar: ' + (e as Error).message }
  }
}

async function crearTicket({ problema, prioridad, categoria }: { problema: string; prioridad: string; categoria: string }) {
  try {
    const ticketId = 'TKT-' + Date.now().toString(36).toUpperCase()
    await fetch(`${FS_URL}/tickets_soporte/${ticketId}?key=${FB_KEY}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: {
        ticketId:  { stringValue: ticketId },
        problema:  { stringValue: problema },
        prioridad: { stringValue: prioridad },
        categoria: { stringValue: categoria },
        estado:    { stringValue: 'abierto' },
        creadoEn:  { integerValue: String(Date.now()) },
        origen:    { stringValue: 'chat_soporte' }
      }})
    })
    return { exito: true, ticketId, mensaje: `Ticket ${ticketId} creado. El equipo técnico lo atenderá a la brevedad.` }
  } catch (e) {
    return { error: 'No se pudo crear el ticket: ' + (e as Error).message }
  }
}

async function consultarConocimiento({ empresa, depto }: { empresa: string; depto?: string }) {
  try {
    const path = depto ? `empresas/${empresa}/knowledge/${depto}` : `empresas/${empresa}/knowledge/global`
    const res = await fetch(`${FS_URL}/${path}?key=${FB_KEY}`)
    if (!res.ok) return { conocimiento: null, mensaje: 'Sin datos de aprendizaje aún' }
    const doc = await res.json() as { fields?: Record<string, { stringValue?: string }> }
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(doc.fields || {})) {
      if (v.stringValue) try { result[k] = JSON.parse(v.stringValue) } catch { result[k] = v.stringValue }
    }
    return { conocimiento: result, mensaje: 'Datos encontrados' }
  } catch (e) {
    return { error: 'Error: ' + (e as Error).message }
  }
}

async function resolverProblema({ empresa, problema, solucion, categoria }: { empresa: string; problema: string; solucion: string; categoria?: string }) {
  try {
    const path = `empresas/${empresa}/knowledge/global`
    let existing: Record<string, unknown> = {}
    try {
      const r = await fetch(`${FS_URL}/${path}?key=${FB_KEY}`)
      if (r.ok) {
        const doc = await r.json() as { fields?: Record<string, { stringValue?: string }> }
        for (const [k, v] of Object.entries(doc.fields || {})) {
          if (v.stringValue) try { existing[k] = JSON.parse(v.stringValue) } catch {}
        }
      }
    } catch {}

    const problems = (existing.solvedProblems as unknown[] || [])
    problems.push({ problema, solucion, categoria: categoria || 'otro', ts: Date.now() })
    existing.solvedProblems = problems.slice(-50)

    const fields: Record<string, { stringValue: string }> = {}
    for (const [k, v] of Object.entries(existing)) fields[k] = { stringValue: JSON.stringify(v) }
    fields.updatedAt = { stringValue: String(Date.now()) }

    await fetch(`${FS_URL}/${path}?key=${FB_KEY}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    })
    return { exito: true, mensaje: 'Registrado para aprendizaje futuro' }
  } catch (e) {
    return { error: 'Error: ' + (e as Error).message }
  }
}

async function executeTool(name: string, input: Record<string, string>) {
  const label =
    name === 'buscar_operacion'    ? '🔍 Buscando en el sistema...' :
    name === 'crear_ticket'        ? '📋 Creando ticket de soporte...' :
    name === 'consultar_conocimiento' ? '🧠 Consultando conocimiento...' :
    name === 'resolver_problema'   ? '✅ Registrando solución...' : '⚙️ Ejecutando...'

  let result: unknown
  if (name === 'buscar_operacion')    result = await buscarOperacion(input)
  else if (name === 'crear_ticket')   result = await crearTicket(input as { problema: string; prioridad: string; categoria: string })
  else if (name === 'consultar_conocimiento') result = await consultarConocimiento(input as { empresa: string; depto?: string })
  else if (name === 'resolver_problema') result = await resolverProblema(input as { empresa: string; problema: string; solucion: string })
  else result = { error: 'Herramienta desconocida' }

  return { label, result }
}

// ── Claude con tool use + streaming ─────────────────────────────

async function* streamClaude(messages: Array<{ role: string; content: string }>): AsyncGenerator<{ text?: string; status?: string; error?: string }> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentMessages: any[] = messages.slice(-10)

  for (let round = 0; round < 4; round++) {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: TOOLS_CLAUDE,
      messages: currentMessages,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        yield { text: event.delta.text }
      }
    }

    const final = await stream.finalMessage()
    if (final.stop_reason !== 'tool_use') break

    const toolResults = []
    for (const block of final.content) {
      if ((block as { type: string }).type !== 'tool_use') continue
      const tb = block as { type: string; id: string; name: string; input: Record<string, string> }
      const { label, result } = await executeTool(tb.name, tb.input)
      yield { status: label }
      toolResults.push({ type: 'tool_result', tool_use_id: tb.id, content: JSON.stringify(result) })
    }

    currentMessages = [
      ...currentMessages,
      { role: 'assistant', content: final.content },
      { role: 'user', content: toolResults }
    ]
  }
}

// ── Gemini con function calling ──────────────────────────────────

async function* streamGemini(messages: Array<{ role: string; content: string }>): AsyncGenerator<{ text?: string; status?: string; error?: string }> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genai.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: SYSTEM_PROMPT,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: TOOLS_GEMINI as any,
  })

  const history = messages.slice(-10).slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }))
  const lastMsg = messages[messages.length - 1].content

  const chat = model.startChat({ history })

  for (let round = 0; round < 4; round++) {
    const result = round === 0
      ? await chat.sendMessage(lastMsg)
      : await chat.sendMessage('Continúa con los resultados de las herramientas.')

    const response = result.response
    const candidate = response.candidates?.[0]

    // Check for function calls
    const functionCalls = candidate?.content?.parts?.filter((p: { functionCall?: unknown }) => p.functionCall)
    if (functionCalls && functionCalls.length > 0) {
      for (const part of functionCalls) {
        const fc = (part as { functionCall: { name: string; args: Record<string, string> } }).functionCall
        const { label, result: toolResult } = await executeTool(fc.name, fc.args)
        yield { status: label }

        // Send function response back
        await chat.sendMessage([{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          functionResponse: { name: fc.name, response: toolResult as any }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any])
      }
      continue
    }

    // Stream the text response
    const text = response.text()
    if (text) {
      // Simulate streaming by yielding chunks
      const words = text.split(' ')
      for (let i = 0; i < words.length; i += 3) {
        yield { text: words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '') }
      }
    }
    break
  }
}

// ── Handler ──────────────────────────────────────────────────────

function isQuotaError(msg: string) {
  return msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') ||
         msg.includes('billing') || msg.includes('credit') || msg.includes('overloaded') || msg.includes('529')
}

export async function POST(req: NextRequest) {
  const hasGemini = !!process.env.GEMINI_API_KEY
  const hasClaude = !!process.env.ANTHROPIC_API_KEY
  if (!hasGemini && !hasClaude) {
    return NextResponse.json({ error: 'Sin API key. Agrega GEMINI_API_KEY o ANTHROPIC_API_KEY en Vercel.' }, { status: 503 })
  }

  let body: { messages?: Array<{ role: string; content: string }> }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Request inválido' }, { status: 400 })
  }

  const { messages } = body
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream  = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      // Intentar proveedores en orden: Gemini primero si está, Claude como fallback
      const providers: Array<'gemini' | 'claude'> = []
      if (hasGemini) providers.push('gemini')
      if (hasClaude) providers.push('claude')

      let lastErr = ''
      for (const prov of providers) {
        try {
          const gen = prov === 'gemini' ? streamGemini(messages) : streamClaude(messages)
          let lastChunk = Date.now()
          const timeout = setInterval(() => {
            if (Date.now() - lastChunk > 25000) {
              clearInterval(timeout)
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '⚠️ El asistente tardó demasiado. Intenta de nuevo.' })}\n\n`))
              controller.close()
            }
          }, 5000)
          for await (const chunk of gen) {
            lastChunk = Date.now()
            send(chunk)
          }
          clearInterval(timeout)
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
          return // éxito
        } catch (err) {
          lastErr = String((err as Error)?.message || err)
          // Si es error de cuota/auth y hay otro proveedor, intentar con el siguiente
          if (isQuotaError(lastErr) && providers.indexOf(prov) < providers.length - 1) {
            send({ status: '⚠️ Gemini no disponible, cambiando a Claude...' })
            continue
          }
        }
      }

      // Todos los proveedores fallaron
      let userMsg = 'Error al conectar con el asistente. Intenta nuevamente.'
      if (lastErr.includes('429') || lastErr.includes('quota') || lastErr.includes('RESOURCE_EXHAUSTED')) userMsg = '⚠️ Cuota agotada en todos los proveedores. Verifica las API keys en Vercel.'
      else if (lastErr.includes('401') || lastErr.includes('API_KEY')) userMsg = '⚠️ API key inválida. Verifica en Vercel → Settings → Environment Variables.'
      send({ error: userMsg })
      controller.close()
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    }
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
