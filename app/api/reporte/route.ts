import { NextRequest, NextResponse } from 'next/server'
import { detectProvider } from '../_lib/ai-stream'

export const maxDuration = 120

const FB_PROJECT = 'zeropaper-prod'
const FB_KEY     = 'AIzaSyCli7F4hLi-XEmmekGZpO2KQ1SO612I85Y'
const FS_BASE    = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents`

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// ── Utils ────────────────────────────────────────────────────────

function parseFs(doc: Record<string, unknown>) {
  const f = (doc as { fields?: Record<string, { stringValue?: string; integerValue?: string; doubleValue?: number }> }).fields
  if (!f) return null
  const s = (k: string) => f[k]?.stringValue  ?? ''
  const n = (k: string) => Number(f[k]?.integerValue ?? f[k]?.doubleValue ?? 0)
  return {
    ts:           n('ts'),
    fecha:        s('fecha'),
    tipo:         s('tipo'),
    estado:       s('estado') || 'PENDIENTE',
    departamento: s('departamento') || s('depto') || 'Sin depto',
    operador:     s('operador')     || s('operadorNombre') || 'Desconocido',
  }
}

function mesPasado() {
  const hoy = new Date()
  const ini = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
  const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0)
  return {
    desde: ini.toISOString().slice(0, 10),
    hasta: fin.toISOString().slice(0, 10),
    label: ini.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
    key:   ini.toISOString().slice(0, 7),
  }
}

type Op = { ts: number; fecha: string; tipo: string; estado: string; departamento: string; operador: string }

function contarPorClave(ops: Op[], clave: keyof Op) {
  return ops.reduce<Record<string, number>>((acc, o) => {
    const k = String(o[clave] || 'Desconocido')
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
}

function top(obj: Record<string, number>, n = 5) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k}: ${v}`).join(', ')
}

function opsPorDia(ops: Op[], desde: string, hasta: string) {
  const dias: Record<string, number> = {}
  let cur = new Date(desde)
  const end = new Date(hasta)
  while (cur <= end) { dias[cur.toISOString().slice(0, 10)] = 0; cur.setDate(cur.getDate() + 1) }
  ops.forEach(o => { if (dias[o.fecha] !== undefined) dias[o.fecha]++ })
  const vals = Object.values(dias)
  const max  = Math.max(...vals, 0)
  const avg  = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  const diasConActividad = vals.filter(v => v > 0).length
  return { max, avg, diasConActividad }
}

// ── Firestore ────────────────────────────────────────────────────

async function listarEmpresas() {
  const r = await fetch(`${FS_BASE}/empresas?key=${FB_KEY}&pageSize=100`)
  if (!r.ok) return []
  const data = await r.json() as { documents?: Array<{ name: string; fields?: { nombre?: { stringValue?: string } } }> }
  return (data.documents || []).map(d => ({
    id:     d.name.split('/').pop()!,
    nombre: d.fields?.nombre?.stringValue || d.name.split('/').pop()!,
  }))
}

async function cargarOpsEmpresa(empresaId: string): Promise<Op[]> {
  const r = await fetch(`${FS_BASE}/empresas/${empresaId}/ops?key=${FB_KEY}&pageSize=2000`)
  if (!r.ok) return []
  const data = await r.json() as { documents?: unknown[] }
  return (data.documents || []).map(d => parseFs(d as Record<string, unknown>)).filter(Boolean) as Op[]
}

async function obtenerEmailEmpresa(empresaId: string) {
  try {
    const r = await fetch(`${FS_BASE}/empresas/${empresaId}/config/settings?key=${FB_KEY}`)
    if (!r.ok) return null
    const data = await r.json() as { fields?: { emailReportes?: { stringValue?: string } } }
    return data.fields?.emailReportes?.stringValue || null
  } catch { return null }
}

async function guardarReporte(empresaId: string, payload: {
  periodo: string; key: string; totalOps: number; reporte: string; stats: unknown
}) {
  const docId = `reporte_${payload.key}`
  await fetch(`${FS_BASE}/empresas/${empresaId}/reportes/${docId}?key=${FB_KEY}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        tipo:     { stringValue: 'reporte_mensual_ia' },
        ts:       { integerValue: String(Date.now()) },
        periodo:  { stringValue: payload.periodo },
        key:      { stringValue: payload.key },
        totalOps: { integerValue: String(payload.totalOps) },
        reporte:  { stringValue: payload.reporte },
        stats:    { stringValue: JSON.stringify(payload.stats) },
        estado:   { stringValue: 'completado' },
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

// ── IA: genera reporte ejecutivo ─────────────────────────────────

function buildPrompt(empresaNombre: string, stats: Record<string, unknown>) {
  return `Eres analista de operaciones industriales. Genera un reporte ejecutivo mensual conciso para la empresa "${empresaNombre}".

PERÍODO: ${stats.periodo}
Total operaciones: ${stats.totalOps} | Aprobadas: ${stats.aprobadas} (${stats.tasaAprobacion}%) | Rechazadas: ${stats.rechazadas} | Pendientes: ${stats.pendientes}
Días con actividad: ${stats.diasActividad}/${stats.diasTotales} | Promedio diario: ${stats.promDiario} | Día pico: ${stats.maxDia} ops
Por tipo: ${stats.porTipo} | Por depto: ${stats.porDepto} | Top operadores: ${stats.topOperadores}

Genera el reporte con estas secciones exactas:
## Resumen Ejecutivo
## Métricas Clave
## Patrones Identificados
## Alertas
## Recomendaciones

Tono: ejecutivo, directo, orientado a acción. Máximo 400 palabras. Solo español.`
}

async function generarReporteIA(empresaNombre: string, stats: Record<string, unknown>): Promise<string> {
  const prompt = buildPrompt(empresaNombre, stats)
  const provider = detectProvider()

  if (provider === 'gemini') {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-pro' })
    const result = await model.generateContent(prompt)
    return result.response.text()
  }

  if (provider === 'claude') {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })
    return msg.content[0]?.type === 'text' ? msg.content[0].text : ''
  }

  throw new Error('NO_KEY')
}

// ── Handler ──────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const url        = new URL(req.url)
  const empresaId  = url.searchParams.get('empresa')
  const emailParam = url.searchParams.get('email') || process.env.EXPORT_EMAIL || null
  const { desde, hasta, label, key } = mesPasado()

  const empresas = empresaId
    ? [{ id: empresaId, nombre: empresaId }]
    : await listarEmpresas()

  const resultados: unknown[] = []

  for (const emp of empresas) {
    try {
      const allOps    = await cargarOpsEmpresa(emp.id)
      const opsDelMes = allOps.filter(o => o.fecha >= desde && o.fecha <= hasta)

      if (opsDelMes.length === 0) {
        resultados.push({ empresa: emp.id, status: 'sin_datos' })
        continue
      }

      const diasTotales  = Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000) + 1
      const aprobadas    = opsDelMes.filter(o => o.estado === 'APROBADO').length
      const rechazadas   = opsDelMes.filter(o => o.estado === 'RECHAZADO').length
      const pendientes   = opsDelMes.filter(o => !['APROBADO','RECHAZADO'].includes(o.estado)).length
      const porTipo      = contarPorClave(opsDelMes, 'tipo')
      const porDepto     = contarPorClave(opsDelMes, 'departamento')
      const porOp        = contarPorClave(opsDelMes, 'operador')
      const { max: maxDia, avg: promDiario, diasConActividad } = opsPorDia(opsDelMes, desde, hasta)

      const stats = {
        periodo: label, totalOps: opsDelMes.length,
        aprobadas, rechazadas, pendientes,
        tasaAprobacion: Math.round(aprobadas / opsDelMes.length * 100),
        diasActividad: diasConActividad, diasTotales, promDiario, maxDia,
        porTipo: top(porTipo), porDepto: top(porDepto),
        operadoresActivos: Object.keys(porOp).length,
        topOperadores: top(porOp, 3),
      }

      const reporteTexto = await generarReporteIA(emp.nombre, stats as Record<string, unknown>)

      await guardarReporte(emp.id, { periodo: label, key, totalOps: opsDelMes.length, reporte: reporteTexto, stats })

      const emailDest = emailParam || await obtenerEmailEmpresa(emp.id)
      if (emailDest) {
        const htmlReporte = reporteTexto
          .replace(/^## (.+)$/gm, '<h3 style="color:#1B4332;margin-top:20px">$1</h3>')
          .replace(/^- (.+)$/gm, '<li>$1</li>')
          .replace(/\n\n/g, '<br><br>')

        await enviarEmail(
          emailDest,
          `[ZeroPaper™] Reporte ejecutivo ${label} — ${emp.nombre}`,
          `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1B4332;padding:24px;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:20px">ZeroPaper™ — Reporte Ejecutivo</h1>
              <p style="color:#D8F3DC;margin:4px 0 0;font-size:13px">${emp.nombre} · ${label}</p>
            </div>
            <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px">
              ${htmlReporte}
              <hr style="margin:20px 0;border:1px solid #e5e7eb">
              <p style="font-size:11px;color:#9ca3af">Generado por ZeroPaper™ IA</p>
            </div>
          </div>`
        )
      }

      resultados.push({ empresa: emp.id, ops: opsDelMes.length, status: 'ok' })
    } catch (err) {
      resultados.push({ empresa: emp.id, status: 'error', error: (err as Error).message })
    }
  }

  return NextResponse.json(
    { ok: true, periodo: label, resultados, ts: new Date().toISOString() },
    { headers: CORS }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}
