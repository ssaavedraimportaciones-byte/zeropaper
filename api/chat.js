import Anthropic from '@anthropic-ai/sdk';
export const config = { runtime: 'nodejs' };

const FB = {
  projectId: 'zeropaper-prod',
  apiKey:    'AIzaSyCli7F4hLi-XEmmekGZpO2KQ1SO612I85Y'
};
const FS_URL = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents`;

// ── HERRAMIENTAS ─────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'buscar_operacion',
    description: 'Busca operaciones registradas en el sistema ZeroPaper por patente de vehículo o número de folio/documento. Úsala SIEMPRE que el usuario mencione una patente o folio específico para verificar si la operación existe.',
    input_schema: {
      type: 'object',
      properties: {
        patente: {
          type: 'string',
          description: 'Patente del vehículo (ej: BBCD12, ABC123). Convierte a mayúsculas.'
        },
        folio: {
          type: 'string',
          description: 'Número de folio o documento a buscar'
        }
      },
      required: []
    }
  },
  {
    name: 'crear_ticket',
    description: 'Crea un ticket de soporte técnico automáticamente. Úsala SIN preguntar cuando: el usuario ya intentó la solución y no funcionó, hay error técnico que no puedes resolver, el problema involucra datos perdidos, o el sistema no está disponible.',
    input_schema: {
      type: 'object',
      properties: {
        problema: {
          type: 'string',
          description: 'Descripción detallada del problema reportado'
        },
        prioridad: {
          type: 'string',
          enum: ['alta', 'media', 'baja'],
          description: 'alta=sistema caído o datos perdidos, media=función no disponible, baja=consulta o duda'
        },
        categoria: {
          type: 'string',
          enum: ['login', 'sincronizacion', 'operaciones', 'app', 'admin', 'reportes', 'otro'],
          description: 'Categoría del problema'
        }
      },
      required: ['problema', 'prioridad', 'categoria']
    }
  },
  {
    name: 'consultar_conocimiento',
    description: 'Consulta la base de conocimiento aprendida de la empresa. Úsala para obtener patrones operativos, documentos frecuentes, vehículos recurrentes, y problemas resueltos anteriormente.',
    input_schema: {
      type: 'object',
      properties: {
        empresa: {
          type: 'string',
          description: 'ID de la empresa'
        },
        depto: {
          type: 'string',
          description: 'ID del departamento (opcional)'
        }
      },
      required: ['empresa']
    }
  },
  {
    name: 'resolver_problema',
    description: 'Registra un problema resuelto para que el sistema aprenda y pueda sugerir soluciones similares en el futuro.',
    input_schema: {
      type: 'object',
      properties: {
        empresa: {
          type: 'string',
          description: 'ID de la empresa'
        },
        problema: {
          type: 'string',
          description: 'Descripción del problema'
        },
        solucion: {
          type: 'string',
          description: 'Cómo se resolvió'
        },
        categoria: {
          type: 'string',
          description: 'Categoría: login, sync, operaciones, ocr, otro'
        }
      },
      required: ['empresa', 'problema', 'solucion']
    }
  }
];

const SYSTEM_PROMPT = `Eres ZP Asistente, el soporte técnico inteligente de ZeroPaper™ — sistema de control operativo portuario sin papel.

## CAPACIDADES ESPECIALES
Tienes acceso en tiempo real al sistema:
- **buscar_operacion**: busca operaciones por patente o folio en Firestore
- **crear_ticket**: crea tickets de soporte técnico automáticamente
- **consultar_conocimiento**: consulta patrones aprendidos de la empresa (docs frecuentes, vehículos recurrentes, problemas resueltos)
- **resolver_problema**: registra un problema resuelto para que el sistema aprenda

## CUÁNDO USAR HERRAMIENTAS (sin preguntar)
- Usuario menciona patente o folio → usa buscar_operacion INMEDIATAMENTE
- Problema no resuelto en 2 intentos → usa crear_ticket
- Error técnico que no puedes resolver → usa crear_ticket
- Datos perdidos o sistema caído → usar crear_ticket (prioridad: alta)
- Usuario pregunta sobre patrones o frecuencias → usa consultar_conocimiento
- Resolviste un problema → usa resolver_problema para que el sistema aprenda

## CONOCIMIENTO DEL SISTEMA

### URLs
- App operador: https://zeropaper-swart.vercel.app/app
- Panel admin: https://zeropaper-swart.vercel.app/admin
- Seguimiento carga: https://zeropaper-swart.vercel.app/seguimiento
- Certificado ambiental: https://zeropaper-swart.vercel.app/certificado

### Funciones IA (nuevas)
- **OCR Inteligente**: El operador puede sacar foto del documento y la IA lee automáticamente patente, folio y tipo de documento. Funciona con documentos impresos y escritos a mano.
- **Autoaprendizaje**: El sistema aprende patrones por departamento: documentos frecuentes por hora, vehículos recurrentes, anomalías típicas. Usa consultar_conocimiento para acceder a estos datos.
- **Sugerencias IA**: En la pantalla de inicio se muestran sugerencias basadas en lo aprendido.

### Roles
**Operador (/app)**: Registra ingresos/egresos. Funciona offline. OCR automático con foto. QR en INGRESO.
**Administrador (/admin)**: Dashboard, aprobaciones, exportar CSV, departamentos, reportes IA.
**Importador (/seguimiento)**: Rastrea su carga sin cuenta, via QR o patente.

### Problemas frecuentes y soluciones
- **No puedo iniciar sesión**: Ctrl+Shift+R para limpiar caché. Verificar sin espacios en email.
- **No sincroniza**: Verificar internet. Cerrar y abrir app. Si persiste → crear_ticket
- **OCR no lee bien**: Asegurar buena iluminación. Foto enfocada. Funciona mejor con documentos impresos.
- **Instalar PWA**: Chrome: menú 3 puntos → "Instalar". Safari: compartir → "Agregar a pantalla inicio"
- **Folio duplicado**: Verificar en /admin si existe. Admin puede anular.
- **QR no funciona**: URL: /seguimiento. Alternativamente ingresar patente manual.

## ESTILO DE RESPUESTA
- Siempre en español
- Directo y concreto, máximo 3 párrafos
- Si creaste un ticket: menciona el número
- Si encontraste operación: muestra los datos
- Si consultaste conocimiento: presenta insights útiles
- Si el usuario está frustrado: reconoce primero, luego da solución`;

// ── EJECUTAR HERRAMIENTAS ────────────────────────────────────────
async function executeTool(name, input) {
  if (name === 'buscar_operacion') return buscarOperacion(input);
  if (name === 'crear_ticket')     return crearTicket(input);
  if (name === 'consultar_conocimiento') return consultarConocimiento(input);
  if (name === 'resolver_problema') return resolverProblema(input);
  return { error: 'Herramienta desconocida' };
}

async function consultarConocimiento({ empresa, depto }) {
  try {
    const path = depto
      ? `empresas/${empresa}/knowledge/${depto}`
      : `empresas/${empresa}/knowledge/global`;

    const res = await fetch(`${FS_URL}/${path}?key=${FB.apiKey}`);
    if (!res.ok) return { conocimiento: null, mensaje: 'Sin datos de aprendizaje aún' };

    const doc = await res.json();
    const result = {};
    for (const [k, v] of Object.entries(doc.fields || {})) {
      if (v.stringValue) {
        try { result[k] = JSON.parse(v.stringValue); } catch { result[k] = v.stringValue; }
      }
    }
    return { conocimiento: result, mensaje: 'Datos de aprendizaje encontrados' };
  } catch (e) {
    return { error: 'Error al consultar conocimiento: ' + e.message };
  }
}

async function resolverProblema({ empresa, problema, solucion, categoria }) {
  try {
    const path = `empresas/${empresa}/knowledge/global`;
    let existing = {};
    try {
      const getRes = await fetch(`${FS_URL}/${path}?key=${FB.apiKey}`);
      if (getRes.ok) {
        const doc = await getRes.json();
        for (const [k, v] of Object.entries(doc.fields || {})) {
          if (v.stringValue) try { existing[k] = JSON.parse(v.stringValue); } catch {}
        }
      }
    } catch {}

    const problems = existing.solvedProblems || [];
    problems.push({ problema, solucion, categoria: categoria || 'otro', ts: Date.now() });
    existing.solvedProblems = problems.slice(-50);

    const fields = {};
    for (const [k, v] of Object.entries(existing)) {
      fields[k] = { stringValue: JSON.stringify(v) };
    }
    fields.updatedAt = { integerValue: String(Date.now()) };

    await fetch(`${FS_URL}/${path}?key=${FB.apiKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });

    return { exito: true, mensaje: 'Problema registrado para aprendizaje futuro' };
  } catch (e) {
    return { error: 'Error al registrar: ' + e.message };
  }
}

async function buscarOperacion({ patente, folio }) {
  const searchField = patente ? 'patente' : folio ? 'folio' : null;
  const searchValue = patente
    ? patente.toUpperCase().replace(/\s/g, '')
    : folio?.trim();

  if (!searchField) return { error: 'Debes especificar patente o folio' };

  try {
    const query = {
      structuredQuery: {
        from: [{ collectionId: 'ops', allDescendants: true }],
        where: {
          fieldFilter: {
            field:  { fieldPath: searchField },
            op:     'EQUAL',
            value:  { stringValue: searchValue }
          }
        },
        limit: 5
      }
    };

    const res  = await fetch(`${FS_URL}:runQuery?key=${FB.apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(query)
    });
    const docs = await res.json();

    const ops = (Array.isArray(docs) ? docs : [])
      .filter(d => d.document?.fields)
      .map(d => {
        const f = d.document.fields;
        const ts = f.ts?.integerValue
          ? new Date(parseInt(f.ts.integerValue)).toLocaleString('es-CL')
          : (f.fecha?.stringValue || '—');
        return {
          patente:   f.patente?.stringValue  || '—',
          tipo:      f.tipo?.stringValue     || '—',
          depto:     f.depto?.stringValue    || '—',
          folio:     f.folio?.stringValue    || '—',
          operador:  f.operadorNombre?.stringValue || '—',
          estado:    f.estado?.stringValue   || '—',
          fecha:     ts
        };
      });

    if (!ops.length) return {
      encontrado: false,
      mensaje: `No se encontraron operaciones con ${searchField}: "${searchValue}"`
    };
    return { encontrado: true, total: ops.length, operaciones: ops };

  } catch (e) {
    return { error: 'Error al buscar operación: ' + e.message };
  }
}

async function crearTicket({ problema, prioridad, categoria }) {
  try {
    const ticketId = 'TKT-' + Date.now().toString(36).toUpperCase();

    await fetch(`${FS_URL}/tickets_soporte/${ticketId}?key=${FB.apiKey}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          ticketId:  { stringValue: ticketId },
          problema:  { stringValue: problema },
          prioridad: { stringValue: prioridad },
          categoria: { stringValue: categoria },
          estado:    { stringValue: 'abierto' },
          creadoEn:  { integerValue: String(Date.now()) },
          origen:    { stringValue: 'chat_soporte' }
        }
      })
    });

    return {
      exito:    true,
      ticketId,
      mensaje:  `Ticket ${ticketId} creado. El equipo técnico lo atenderá a la brevedad.`
    };
  } catch (e) {
    return { error: 'No se pudo crear el ticket: ' + e.message };
  }
}

// ── EDGE FUNCTION ────────────────────────────────────────────────
export const config = { runtime: 'edge', maxDuration: 60 };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':  '*',
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
      JSON.stringify({ error: 'API key no configurada. Contacta al administrador.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Request inválido' }), { status: 400 });
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'Mensajes requeridos' }), { status: 400 });
  }

  const client  = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        let currentMessages = messages.slice(-10);

        // Tool use loop: up to 4 rounds
        for (let round = 0; round < 4; round++) {
          const anthropicStream = client.messages.stream({
            model:      'claude-opus-4-6',
            max_tokens: 2048,
            system:     SYSTEM_PROMPT,
            tools:      TOOLS,
            messages:   currentMessages,
          });

          // Stream text deltas live
          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta?.type === 'text_delta'
            ) {
              send({ text: event.delta.text });
            }
          }

          const finalMsg = await anthropicStream.finalMessage();

          if (finalMsg.stop_reason !== 'tool_use') break; // done

          // Execute each tool call
          const toolResults = [];
          for (const block of finalMsg.content) {
            if (block.type !== 'tool_use') continue;

            const label = block.name === 'buscar_operacion'
              ? '🔍 Buscando en el sistema...'
              : '📋 Creando ticket de soporte...';
            send({ status: label });

            const result = await executeTool(block.name, block.input);
            toolResults.push({
              type:        'tool_result',
              tool_use_id: block.id,
              content:     JSON.stringify(result)
            });
          }

          currentMessages = [
            ...currentMessages,
            { role: 'assistant', content: finalMsg.content },
            { role: 'user',      content: toolResults      }
          ];
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();

      } catch (err) {
        const msg = String(err?.message || err);

        let userMsg;
        if (msg.includes('credit balance') || msg.includes('billing')) {
          userMsg = '⚠️ El servicio de IA no tiene créditos disponibles. El administrador debe recargar en console.anthropic.com/settings/billing.';
        } else if (msg.includes('API key') || msg.includes('authentication') || msg.includes('401')) {
          userMsg = '⚠️ API key de IA no configurada. El administrador debe agregarla en el panel de Vercel.';
        } else if (msg.includes('overloaded') || msg.includes('529')) {
          userMsg = '⚠️ El servicio de IA está muy solicitado. Intenta en unos segundos.';
        } else {
          userMsg = 'Error al conectar con el asistente. Intenta nuevamente.';
        }

        send({ error: userMsg });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type':                'text/event-stream',
      'Cache-Control':               'no-cache',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
