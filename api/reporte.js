/**
 * ZeroPaper™ — Reporte ejecutivo mensual con IA (Claude Sonnet)
 * Vercel Cron: día 1 de cada mes a las 11:00 UTC (08:00 Chile)
 * También acepta llamadas manuales desde el panel admin
 *
 * Endpoint: GET /api/reporte?empresa=ID
 * Cron:     GET /api/reporte  (genera para todas las empresas)
 */

import Anthropic from '@anthropic-ai/sdk';

const FB_PROJECT = 'zeropaper-prod';
const FB_KEY     = 'AIzaSyCli7F4hLi-XEmmekGZpO2KQ1SO612I85Y';
const FS_BASE    = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents`;

export const config = { maxDuration: 120 };

// ── UTILS ─────────────────────────────────────────────────────
function parseFs(doc) {
  if (!doc?.fields) return null;
  const f = doc.fields;
  const s = k => f[k]?.stringValue  ?? '';
  const n = k => Number(f[k]?.integerValue ?? f[k]?.doubleValue ?? 0);
  return {
    ts:           n('ts'),
    fecha:        s('fecha'),
    tipo:         s('tipo'),
    estado:       s('estado') || 'PENDIENTE',
    departamento: s('departamento') || s('depto') || 'Sin depto',
    operador:     s('operador')     || s('operadorNombre') || 'Desconocido',
  };
}

function mesPasado() {
  const hoy   = new Date();
  const ini   = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const fin   = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
  return {
    desde: ini.toISOString().slice(0, 10),
    hasta: fin.toISOString().slice(0, 10),
    label: ini.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
    key:   ini.toISOString().slice(0, 7),
  };
}

function contarPorClave(ops, clave) {
  return ops.reduce((acc, o) => {
    const k = o[clave] || 'Desconocido';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function topEntradas(obj, n = 5) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
}

function opsPorDia(ops, desde, hasta) {
  const dias = {};
  let cur = new Date(desde);
  const end = new Date(hasta);
  while (cur <= end) {
    dias[cur.toISOString().slice(0, 10)] = 0;
    cur.setDate(cur.getDate() + 1);
  }
  ops.forEach(o => { if (dias[o.fecha] !== undefined) dias[o.fecha]++; });
  const vals = Object.values(dias);
  const max  = Math.max(...vals, 0);
  const min  = Math.min(...vals.filter(v => v > 0), 0);
  const avg  = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
  const diasConActividad = vals.filter(v => v > 0).length;
  return { max, min: min === Infinity ? 0 : min, avg, diasConActividad };
}

// ── FIRESTORE ─────────────────────────────────────────────────
async function obtenerEmailEmpresa(empresaId) {
  try {
    const r = await fetch(`${FS_BASE}/empresas/${empresaId}/config/settings?key=${FB_KEY}`);
    if (!r.ok) return null;
    const data = await r.json();
    return data.fields?.emailReportes?.stringValue || null;
  } catch { return null; }
}

async function listarEmpresas() {
  const r = await fetch(`${FS_BASE}/empresas?key=${FB_KEY}&pageSize=100`);
  if (!r.ok) return [];
  const data = await r.json();
  return (data.documents || []).map(d => ({
    id:     d.name.split('/').pop(),
    nombre: d.fields?.nombre?.stringValue || d.name.split('/').pop(),
  }));
}

async function cargarOpsEmpresa(empresaId) {
  const r = await fetch(`${FS_BASE}/empresas/${empresaId}/ops?key=${FB_KEY}&pageSize=2000`);
  if (!r.ok) return [];
  const data = await r.json();
  return (data.documents || []).map(parseFs).filter(Boolean);
}

async function guardarReporte(empresaId, payload) {
  const docId = `reporte_${payload.key}`;
  await fetch(`${FS_BASE}/empresas/${empresaId}/reportes/${docId}?key=${FB_KEY}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        tipo:       { stringValue: 'reporte_mensual_ia' },
        ts:         { integerValue: String(Date.now()) },
        periodo:    { stringValue: payload.periodo },
        key:        { stringValue: payload.key },
        totalOps:   { integerValue: String(payload.totalOps) },
        reporte:    { stringValue: payload.reporte },
        stats:      { stringValue: JSON.stringify(payload.stats) },
        modelo:     { stringValue: 'claude-sonnet-4-5' },
        estado:     { stringValue: 'completado' },
      }
    })
  });
}

// ── EMAIL ─────────────────────────────────────────────────────
async function enviarEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ZeroPaper™ <onboarding@resend.dev>',
        to: [to], subject, html
      })
    });
    return r.ok;
  } catch { return false; }
}

// ── PROMPT PARA CLAUDE SONNET ─────────────────────────────────
function buildPrompt(empresa, stats) {
  return `Eres analista de operaciones industriales. Genera un reporte ejecutivo mensual conciso y de alto valor para la empresa "${empresa.nombre}".

DATOS DEL PERÍODO: ${stats.periodo}

MÉTRICAS OPERATIVAS:
- Total operaciones: ${stats.totalOps}
- Aprobadas: ${stats.aprobadas} (${stats.tasaAprobacion}%)
- Rechazadas: ${stats.rechazadas}
- Pendientes: ${stats.pendientes}
- Días con actividad: ${stats.diasActividad} de ${stats.diasTotales}
- Promedio diario: ${stats.promDiario} ops/día
- Día más activo: ${stats.maxDia} ops
- Distribución por tipo: ${stats.porTipo}
- Departamentos activos: ${stats.porDepto}
- Operadores activos: ${stats.operadoresActivos}
- Top operadores: ${stats.topOperadores}

INSTRUCCIONES:
Genera un reporte ejecutivo en español con EXACTAMENTE estas secciones:

## Resumen Ejecutivo
(2-3 oraciones sobre el período, destacando lo más relevante)

## Métricas Clave
(3-4 bullets con los números más importantes y su interpretación)

## Patrones Identificados
(2-3 observaciones sobre tendencias, picos de actividad o anomalías)

## Departamentos y Operadores
(Qué áreas tuvieron más actividad y qué significa operativamente)

## Alertas
(Solo si hay algo que llama atención: baja actividad, muchos rechazos, concentración en un operador, etc. Si todo está normal, indicar "Sin alertas.")

## Recomendaciones
(2-3 acciones concretas para el próximo mes basadas en los datos)

Tono: directo, ejecutivo, orientado a acción. Sin frases genéricas. Máximo 400 palabras.`;
}

// ── HANDLER ───────────────────────────────────────────────────
export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS')
    return new Response(null, { headers: corsHeaders });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const url        = new URL(req.url);
  const empresaId  = url.searchParams.get('empresa') || null;
  const emailParam = url.searchParams.get('email') || process.env.EXPORT_EMAIL || null;
  const { desde, hasta, label, key } = mesPasado();

  const client   = new Anthropic({ apiKey });
  const empresas = empresaId
    ? [{ id: empresaId, nombre: empresaId }]
    : await listarEmpresas();

  const resultados = [];

  for (const emp of empresas) {
    try {
      const allOps       = await cargarOpsEmpresa(emp.id);
      const opsDelMes    = allOps.filter(o => o.fecha >= desde && o.fecha <= hasta);

      if (opsDelMes.length === 0) {
        resultados.push({ empresa: emp.id, status: 'sin_datos' });
        continue;
      }

      const diasTotales = Math.round((new Date(hasta) - new Date(desde)) / 86400000) + 1;
      const aprobadas   = opsDelMes.filter(o => o.estado === 'APROBADO').length;
      const rechazadas  = opsDelMes.filter(o => o.estado === 'RECHAZADO').length;
      const pendientes  = opsDelMes.filter(o => !['APROBADO','RECHAZADO'].includes(o.estado)).length;
      const porTipo     = contarPorClave(opsDelMes, 'tipo');
      const porDepto    = contarPorClave(opsDelMes, 'departamento');
      const porOp       = contarPorClave(opsDelMes, 'operador');
      const { max: maxDia, avg: promDiario, diasConActividad } = opsPorDia(opsDelMes, desde, hasta);

      const stats = {
        periodo:          label,
        totalOps:         opsDelMes.length,
        aprobadas, rechazadas, pendientes,
        tasaAprobacion:   Math.round(aprobadas / opsDelMes.length * 100),
        diasActividad:    diasConActividad,
        diasTotales,
        promDiario,
        maxDia,
        porTipo:          topEntradas(porTipo, 5),
        porDepto:         topEntradas(porDepto, 5),
        operadoresActivos: Object.keys(porOp).length,
        topOperadores:    topEntradas(porOp, 3),
      };

      // Llamar a Claude Sonnet
      const msg = await client.messages.create({
        model:      'claude-sonnet-4-5',
        max_tokens: 1500,
        messages:   [{ role: 'user', content: buildPrompt(emp, stats) }],
      });

      const reporteTexto = msg.content[0]?.text || 'No se pudo generar el reporte.';

      // Guardar en Firestore
      await guardarReporte(emp.id, {
        periodo: label, key, totalOps: opsDelMes.length,
        reporte: reporteTexto, stats
      });

      // Email: Firestore config > params > env
      const emailDest = emailParam || await obtenerEmailEmpresa(emp.id);
      if (emailDest) {
        const htmlReporte = reporteTexto
          .replace(/^## (.+)$/gm, '<h3 style="color:#1B4332;margin-top:20px">$1</h3>')
          .replace(/^- (.+)$/gm, '<li>$1</li>')
          .replace(/\n\n/g, '<br><br>');

        await enviarEmail({
          to: emailDest,
          subject: `[ZeroPaper™] Reporte ejecutivo ${label} — ${emp.nombre}`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#1B4332;padding:24px;border-radius:12px 12px 0 0">
                <h1 style="color:white;margin:0;font-size:20px">ZeroPaper™ — Reporte Ejecutivo</h1>
                <p style="color:#D8F3DC;margin:4px 0 0;font-size:13px">${emp.nombre} · ${label}</p>
              </div>
              <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px">
                ${htmlReporte}
                <hr style="margin:20px 0;border:1px solid #e5e7eb">
                <p style="font-size:11px;color:#9ca3af">Generado automáticamente por ZeroPaper™ IA · Modelo: claude-sonnet-4-5</p>
              </div>
            </div>
          `
        });
      }

      resultados.push({ empresa: emp.id, ops: opsDelMes.length, status: 'ok' });

    } catch (err) {
      resultados.push({ empresa: emp.id, status: 'error', error: err.message });
    }
  }

  return new Response(
    JSON.stringify({ ok: true, periodo: label, resultados, ts: new Date().toISOString() }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
