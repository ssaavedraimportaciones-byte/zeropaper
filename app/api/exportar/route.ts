import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const FB_PROJECT = 'zeropaper-prod'
const FB_KEY     = 'AIzaSyCli7F4hLi-XEmmekGZpO2KQ1SO612I85Y'
const FS_BASE    = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents`

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// ── Firestore helpers ────────────────────────────────────────────

function parseFs(doc: Record<string, unknown>) {
  if (!(doc as { fields?: unknown })?.fields) return null
  const f = (doc as { fields: Record<string, { stringValue?: string; integerValue?: string; doubleValue?: number }> }).fields
  const s = (k: string) => f[k]?.stringValue  ?? ''
  const n = (k: string) => Number(f[k]?.integerValue ?? f[k]?.doubleValue ?? 0)
  return {
    id:           (doc as { name?: string }).name?.split('/').pop() ?? '',
    ts:           n('ts'),
    fecha:        s('fecha'),
    tipo:         s('tipo'),
    estado:       s('estado') || 'PENDIENTE',
    patente:      s('patente') || s('vehiculo'),
    folio:        s('folio')   || s('documento'),
    departamento: s('departamento') || s('depto') || '—',
    operador:     s('operador')     || s('operadorNombre') || '—',
    observacion:  s('observacion')  || s('obs') || '',
  }
}

function escapeCSV(val: unknown) {
  const str = String(val ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n'))
    return '"' + str.replace(/"/g, '""') + '"'
  return str
}

type Op = ReturnType<typeof parseFs>

function opsToCSV(ops: NonNullable<Op>[]) {
  const headers = ['ID','Fecha','Tipo','Estado','Patente','Folio','Departamento','Operador','Observación','Timestamp']
  const rows = ops.map(o => [
    o!.id, o!.fecha, o!.tipo, o!.estado, o!.patente,
    o!.folio, o!.departamento, o!.operador, o!.observacion,
    o!.ts ? new Date(o!.ts).toISOString() : ''
  ].map(escapeCSV).join(','))
  return [headers.join(','), ...rows].join('\n')
}

function semanaActual() {
  const hoy = new Date()
  const lun = new Date(hoy)
  lun.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
  const dom = new Date(lun)
  dom.setDate(lun.getDate() + 6)
  return {
    desde: lun.toISOString().slice(0, 10),
    hasta: dom.toISOString().slice(0, 10),
  }
}

async function listarEmpresas() {
  const r = await fetch(`${FS_BASE}/empresas?key=${FB_KEY}&pageSize=100`)
  if (!r.ok) return []
  const data = await r.json() as { documents?: Array<{ name: string; fields?: { nombre?: { stringValue?: string } } }> }
  return (data.documents || []).map(d => ({
    id:     d.name.split('/').pop()!,
    nombre: d.fields?.nombre?.stringValue || d.name.split('/').pop()!,
  }))
}

async function cargarOpsEmpresa(empresaId: string) {
  const r = await fetch(`${FS_BASE}/empresas/${empresaId}/ops?key=${FB_KEY}&pageSize=2000`)
  if (!r.ok) return []
  const data = await r.json() as { documents?: unknown[] }
  return (data.documents || []).map(d => parseFs(d as Record<string, unknown>)).filter(Boolean)
}

async function obtenerEmailEmpresa(empresaId: string) {
  try {
    const r = await fetch(`${FS_BASE}/empresas/${empresaId}/config/settings?key=${FB_KEY}`)
    if (!r.ok) return null
    const data = await r.json() as { fields?: { emailReportes?: { stringValue?: string } } }
    return data.fields?.emailReportes?.stringValue || null
  } catch { return null }
}

async function guardarReporte(empresaId: string, payload: { totalOps: number; csvBase64: string; periodo: string }) {
  await fetch(`${FS_BASE}/empresas/${empresaId}/reportes?key=${FB_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        tipo:      { stringValue: 'exportacion_semanal' },
        ts:        { integerValue: String(Date.now()) },
        fecha:     { stringValue: new Date().toISOString().slice(0, 10) },
        totalOps:  { integerValue: String(payload.totalOps) },
        csvBase64: { stringValue: payload.csvBase64 },
        periodo:   { stringValue: payload.periodo },
        estado:    { stringValue: 'completado' },
      }
    })
  })
}

async function enviarEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'ZeroPaper™ <onboarding@resend.dev>', to: [to], subject, html })
    })
    return r.ok
  } catch { return false }
}

// ── Handler ──────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const url        = new URL(req.url)
  const empresaId  = url.searchParams.get('empresa')
  const emailParam = url.searchParams.get('email') || process.env.EXPORT_EMAIL || null
  const { desde, hasta } = semanaActual()
  const periodo    = `${desde} al ${hasta}`

  const empresas = empresaId
    ? [{ id: empresaId, nombre: empresaId }]
    : await listarEmpresas()

  const resultados: unknown[] = []

  for (const emp of empresas) {
    try {
      const allOps = await cargarOpsEmpresa(emp.id)
      const ops    = allOps.filter(o => o!.fecha >= desde && o!.fecha <= hasta) as NonNullable<Op>[]

      if (ops.length === 0) {
        resultados.push({ empresa: emp.id, ops: 0, status: 'sin_datos' })
        continue
      }

      const csv       = opsToCSV(ops)
      const csvBase64 = Buffer.from(csv).toString('base64')

      await guardarReporte(emp.id, { totalOps: ops.length, csvBase64, periodo })

      const emailDest = emailParam || await obtenerEmailEmpresa(emp.id)
      if (emailDest) {
        await enviarEmail(
          emailDest,
          `[ZeroPaper™] Exportación semanal — ${emp.nombre} (${periodo})`,
          `<h2>ZeroPaper™ — Exportación semanal</h2>
           <p><strong>Empresa:</strong> ${emp.nombre}</p>
           <p><strong>Período:</strong> ${periodo}</p>
           <p><strong>Total operaciones:</strong> ${ops.length}</p>
           <p>El CSV está disponible en el panel admin en <strong>Reportes → Exportaciones</strong>.</p>`
        )
      }

      resultados.push({ empresa: emp.id, ops: ops.length, status: 'ok' })
    } catch (err) {
      resultados.push({ empresa: emp.id, status: 'error', error: (err as Error).message })
    }
  }

  return NextResponse.json(
    { ok: true, periodo, resultados, ts: new Date().toISOString() },
    { headers: CORS }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
