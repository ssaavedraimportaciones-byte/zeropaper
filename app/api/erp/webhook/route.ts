import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/lib/firebase-admin'

const erpEventSchema = z.object({
  source: z.enum(['SAP', 'Oracle', 'Generic']),
  event: z.string(),
  payload: z.record(z.unknown()),
  timestamp: z.string().optional(),
})

// Normalize ERP fields to ZeroPaper operation format
function normalize(source: string, payload: Record<string, unknown>) {
  const p = payload as any
  return {
    plate: p.plate ?? p.patente ?? p.vehicle_id ?? '',
    company: p.company ?? p.empresa ?? p.client_name ?? '',
    folio: p.folio ?? p.document_number ?? p.ref ?? '',
    type: p.doc_type ?? p.tipo ?? 'OTRO',
    notes: p.notes ?? p.observaciones ?? '',
    erpSource: source,
    raw: payload,
  }
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.ERP_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = erpEventSchema.parse(await req.json())
    const normalized = normalize(body.source, body.payload)

    const db = getDb()
    await db.collection('erp_events').add({
      ...normalized,
      originalEvent: body.event,
      receivedAt: new Date().toISOString(),
      timestamp: body.timestamp ?? new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 422 })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
